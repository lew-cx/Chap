"""LewLM's fake backend, with the engine controls a browser check needs.

`python -m lewlm.testing.fake_backend` serves LewLM in front of a fake engine,
but only an in-process test can stop that engine or kill a stream: the CLI has
no way to reach `fixture.engine` from outside. Four items of LewLM's Chap UI
checklist (docs/guides/chap-validation.md: engine restart, interrupted stream,
fallback explanation, events reconnect) are exactly those controls, so this
wraps the same `FakeBackendFixture` pieces and adds a loopback control port.

Run it with LewLM's own interpreter — it imports LewLM, it is not part of Chap:

    ../LewLM/.venv/Scripts/python.exe scripts/lewlm-fixture.py      # Windows
    ../LewLM/.venv/bin/python scripts/lewlm-fixture.py              # macOS, Linux

Options: --port (LewLM, 8080), --control-port (8099), --fallback (route the
primary model to the backup model when its engine is down, via LewLM's
`explicit_alias` policy), --cors-origin (repeatable; http://localhost:5173 by
default), --stream-delay-ms (40).

Control routes, all on 127.0.0.1:<control-port>:

    GET  /state          which engines are up, and the model ids
    POST /engine/stop    stop the primary engine (the port stays reserved)
    POST /engine/start   bring it back on the same port
    POST /engine/die     end every in-flight primary stream on its next frame
    POST /backup/stop    stop the backup engine — the one model no alias covers
    POST /backup/start   bring it back on the same port
    POST /rescan         ask LewLM to rescan, as an operator would after a restart
    POST /lewlm/restart  a new LewLM lifetime on the same port: every connection
                         drops, and every event cursor issued so far is foreign
"""

from __future__ import annotations

import argparse
import json
import sys
import tempfile
import threading
import time
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

from lewlm.testing.fake_backend import FakeOpenAIEngine

PRIMARY_ENDPOINT = "fixture"
BACKUP_ENDPOINT = "backup"


def _settings(port: int, data_dir: Path, primary: FakeOpenAIEngine, backup: FakeOpenAIEngine,
              origins: tuple[str, ...], aliases: dict[str, str]) -> Any:
    from lewlm.config.endpoints import ExternalEndpoint
    from lewlm.config.settings import LewLMSettings

    return LewLMSettings(
        environment="test",
        host="127.0.0.1",
        port=port,
        data_dir=data_dir / "state",
        models_dir=(data_dir / "models",),
        runtime_packs=("external_accelerator",),
        external_endpoints=(
            ExternalEndpoint(endpoint_id=PRIMARY_ENDPOINT, profile="openai_compatible",
                             base_url=primary.base_url, read_timeout_seconds=30),
            ExternalEndpoint(endpoint_id=BACKUP_ENDPOINT, profile="openai_compatible",
                             base_url=backup.base_url, read_timeout_seconds=30),
        ),
        backend_feature_probes_enabled=False,
        # A browser check reloads Chap for every item, and each load is a burst
        # of polled reads; the default 120/min is a production limit, not a
        # property under test here.
        rate_limit_requests=100_000,
        cors_enabled=bool(origins),
        cors_allow_origins=origins,
        external_fallback_policy="explicit_alias" if aliases else "none",
        external_fallback_aliases=aliases,
    )


def _model_for(services: Any, endpoint_id: str) -> str:
    """The registered id of the one model an endpoint advertises."""
    for manifest in services.model_registry.list_manifests():
        if f"-{endpoint_id}-" in manifest.model_id:
            return manifest.model_id
    raise RuntimeError(f"endpoint {endpoint_id} advertised no model")


def main(argv: list[str] | None = None) -> int:
    import uvicorn

    from lewlm.api.app import create_app
    from lewlm.core.bootstrap import bootstrap_services

    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--control-port", type=int, default=8099)
    parser.add_argument("--fallback", action="store_true")
    parser.add_argument("--cors-origin", action="append", default=None)
    parser.add_argument("--stream-delay-ms", type=int, default=40)
    args = parser.parse_args(argv)
    origins = tuple(args.cors_origin or ["http://localhost:5173"])

    delay = args.stream_delay_ms / 1000.0
    primary = FakeOpenAIEngine(model_ids=("fixture-chat",), stream_delay_seconds=delay).start()
    backup = FakeOpenAIEngine(model_ids=("fixture-backup",), stream_delay_seconds=delay).start()
    primary_port = primary._port  # noqa: SLF001 - restarting on the same port is the point
    backup_port = backup._port  # noqa: SLF001

    with tempfile.TemporaryDirectory(prefix="chap-lewlm-fixture-") as tmp:
        data_dir = Path(tmp)
        (data_dir / "state").mkdir(parents=True)
        (data_dir / "models").mkdir(parents=True)

        # Model ids are minted by the scan, and the alias has to name them, so the
        # registry is scanned once to learn them and the service is built again.
        services = bootstrap_services(_settings(args.port, data_dir, primary, backup, origins, {}))
        services.model_registry.scan()
        primary_model = _model_for(services, PRIMARY_ENDPOINT)
        backup_model = _model_for(services, BACKUP_ENDPOINT)
        aliases = {primary_model: backup_model} if args.fallback else {}
        settings = _settings(args.port, data_dir, primary, backup, origins, aliases)
        base_url = f"http://127.0.0.1:{args.port}"

        def serve() -> tuple[Any, threading.Thread]:
            """One LewLM lifetime: fresh services, so a fresh event epoch."""
            services = bootstrap_services(settings)
            services.model_registry.scan()
            # Open SSE subscriptions would otherwise hold a restart open forever.
            server = uvicorn.Server(uvicorn.Config(create_app(settings, services=services), host="127.0.0.1",
                                                   port=args.port, log_level="warning", lifespan="on",
                                                   timeout_graceful_shutdown=1))
            thread = threading.Thread(target=server.run, daemon=True, name="lewlm")
            thread.start()
            deadline = time.monotonic() + 30
            while True:
                try:
                    with urllib.request.urlopen(f"{base_url}/v1/health", timeout=1):
                        return server, thread
                except Exception:  # noqa: BLE001 - not up yet
                    if time.monotonic() > deadline:
                        raise
                    time.sleep(0.05)

        lifetime = {"current": serve()}

        def restart() -> None:
            # Every connection drops, and the cursors clients hold belong to a
            # lifetime that no longer exists: LewLM's `lost: null` case.
            server, thread = lifetime["current"]
            server.should_exit = True
            thread.join(timeout=15)
            lifetime["current"] = serve()

        def state() -> dict[str, Any]:
            return {"lewlm": base_url, "primary": {"model": primary_model, "endpoint": PRIMARY_ENDPOINT,
                    "running": primary.running}, "backup": {"model": backup_model, "endpoint": BACKUP_ENDPOINT,
                    "running": backup.running}, "fallback": aliases}

        def die() -> None:
            primary.die_mid_stream.set()
            # Long enough for an in-flight stream to reach its next frame, short
            # enough that the retry the user chooses afterwards is not killed too.
            threading.Timer(1.0, primary.die_mid_stream.clear).start()

        def rescan() -> Any:
            request = urllib.request.Request(f"{base_url}/v1/models/scan", data=b"{}", method="POST",
                                             headers={"content-type": "application/json"})
            with urllib.request.urlopen(request, timeout=30) as response:
                return json.loads(response.read())

        actions = {
            "/engine/stop": lambda: primary.stop(),
            "/backup/stop": lambda: backup.stop(),
            "/backup/start": lambda: backup.start(backup_port),
            "/engine/start": lambda: primary.start(primary_port),
            "/engine/die": die,
            "/rescan": rescan,
            "/lewlm/restart": restart,
        }

        class Control(BaseHTTPRequestHandler):
            def _reply(self, status: int, body: Any) -> None:
                payload = json.dumps(body).encode()
                self.send_response(status)
                self.send_header("content-type", "application/json")
                self.send_header("content-length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)

            def do_GET(self) -> None:  # noqa: N802
                self._reply(200, state()) if self.path == "/state" else self._reply(404, {"error": self.path})

            def do_POST(self) -> None:  # noqa: N802
                action = actions.get(self.path)
                if action is None:
                    self._reply(404, {"error": self.path})
                    return
                try:
                    result = action()
                except Exception as error:  # noqa: BLE001 - reported to the caller
                    self._reply(500, {"error": str(error)})
                    return
                self._reply(200, {"ok": True, "result": result if isinstance(result, dict) else None, **state()})

            def log_message(self, format: str, *args: Any) -> None:  # noqa: A002
                pass

        control = ThreadingHTTPServer(("127.0.0.1", args.control_port), Control)
        threading.Thread(target=control.serve_forever, daemon=True, name="control").start()
        print(f"LewLM fixture  {base_url}   control http://127.0.0.1:{args.control_port}", flush=True)
        print(f"  primary  {primary_model}  @{PRIMARY_ENDPOINT}", flush=True)
        print(f"  backup   {backup_model}  @{BACKUP_ENDPOINT}", flush=True)
        print(f"  fallback {'primary -> backup' if aliases else 'off'}   cors {', '.join(origins)}", flush=True)
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass
        finally:
            control.shutdown()
            lifetime["current"][0].should_exit = True
            primary.stop()
            backup.stop()
    return 0


if __name__ == "__main__":
    sys.exit(main())
