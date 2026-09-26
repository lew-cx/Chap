# Chap

A GUI test bench, showroom and reference client for
[LewLM](https://github.com/lew-cx/LewLM).

If you are building on LewLM, Chap is the place to read how a client is meant to
use it. It covers streaming on both chat surfaces, the event bus, structured
output, tool calls, ingestion, retrieval, speech in and out, and the typed error
envelope. All of it is written against LewLM's published contract, with nothing
guessed.

Chap also shows how little application code a full chat and operations interface
needs when the backend does the work:

```
  hand-written LewLM integration code

    246  packages/lewlm/src/stream.ts     both surfaces, streaming or not, one union
    112  packages/lewlm/src/types.ts      curated names over the generated contract
     92  packages/lewlm/src/errors.ts     one error type for everything
     84  packages/lewlm/src/http.ts       typed fetch + identity headers
     79  packages/lewlm/src/events.ts     the /v1/events subscription, filtered
     47  packages/lewlm/src/sse.ts        SSE reader
     26  packages/lewlm/src/index.ts
     25  packages/lewlm/src/multipart.ts  attachment parts
  -----
    711  lewlm integration   (budget 900)
```

`npm run loc:budget` checks that number. It pays for a full chat surface, a
five-tab operations console, a lab covering every non-chat surface, sessions, a
live event explorer, and replies spoken aloud as they stream. Everything else
Chap knows about LewLM (57 routes, 293 schemas, 55 event types, 41 error codes)
is **generated from LewLM's own published contract**. None of it is written by
hand.

## Where to start reading

| to see how to…                                   | read                                                    |
| ------------------------------------------------ | ------------------------------------------------------- |
| stream a chat or response, and fold the deltas   | [packages/lewlm/src/stream.ts](packages/lewlm/src/stream.ts) |
| subscribe to `/v1/events` with server-side filters | [packages/lewlm/src/events.ts](packages/lewlm/src/events.ts) |
| turn every LewLM error into one typed value      | [packages/lewlm/src/errors.ts](packages/lewlm/src/errors.ts) |
| generate types from LewLM's contract             | [scripts/gen-types.mjs](scripts/gen-types.mjs)          |
| prove a LewLM server does what it says, headless | [scripts/proof.ts](scripts/proof.ts)                    |
| proxy LewLM without transforming a byte          | [server/src/proxy.ts](server/src/proxy.ts)              |
| build a request from the chat composer's state   | [web/src/chat/request.ts](web/src/chat/request.ts)      |
| embed and rerank against LewLM for retrieval     | [packages/module-collections/](packages/module-collections/) |

`packages/lewlm` has zero runtime dependencies, no React, and runs in both the
browser and Node.

## Running it

Chap needs a LewLM server and nothing else. Chap's own server proxies to it, so
the SPA and the API share one origin and no credential reaches the browser.

```bash
# 1. LewLM (see its README)
cd ../LewLM
.venv/bin/lewlm serve                                # or, on Windows with a GPU:
docker compose --profile gpu up -d lewlm-cuda

# 2. Chap
npm install
npm run gen:types      # reads LewLM's contract; no running server needed
npm run dev            # http://localhost:5173
```

Copy `.env.example` to `.env` to point at a different LewLM or supply an API key.
The key stays in the server process, and the browser never receives it.

LewLM supports CORS, so the browser can also talk to it directly. Start it with
`LEWLM_CORS_ENABLED=true` and `LEWLM_CORS_ALLOW_ORIGINS='["http://localhost:5173"]'`.

### On another machine

`npm run doctor` checks whether a machine can run Chap before anything else is
attempted, and `npm run dev` runs it first. It asks the runtime rather than
comparing version strings, because the two things Chap depends on arrived in
mid-22 and a Node release just short of either fails later, inside a module,
with an error that looks like a Chap bug:

- **`node:sqlite`, unflagged**: module-collections' entire store. It ships with
  Node, so there is no native module anywhere in the tree, no build toolchain to
  install, and nothing to rebuild per platform.
- **`--env-file-if-exists`**: how the server and the proofs read `.env`.

Node 22.13 or newer has both. Nothing else here is platform-specific. No
dependency compiles, paths are built rather than concatenated, and the scripts
that shell out reach npm through its own CLI under the running Node rather than
an `npm.cmd` shim, so Windows needs no special handling. `npm run gen:types` falls
back to the committed `vendor/openapi.json`, so a checkout with no LewLM beside
it still generates. [docs/cross-platform.md](docs/cross-platform.md) records what
running away from the Mac actually found.

One caveat comes from the browser, not Chap. Push-to-talk dictation and
copy-to-clipboard require a **secure context**. `localhost` is one and a LAN
address is not. Opening the dev server from a second machine over
`http://192.168.x.x:5173` removes both APIs: the microphone button disables
itself and names the secure context as the reason, rather than blaming the
transcription model, and the copy button reports `blocked`. Use those two
features from the machine serving them, or put a certificate in front.

## Verifying

```bash
npm run proof                  # exercises the transport layer against live LewLM
npm run gen:gaps               # runs the proofs; writes what Settings → Gaps shows
npm run gen:gaps -- --check    # fails if that screen has drifted from the proofs
npm run gen:types -- --check   # fails if LewLM's contract has drifted
npm run loc:budget             # fails if any package's hand-written code grew
npm run module:check           # fails if core learned a module's name
npm run skin:check             # fails if a skin leaked out of the shell
npm run typecheck
npm test
npm run doctor                 # can this machine run Chap at all
```

`npm run proof` is deliberately browser-free. It proves the transport layer
independently of React, so a UI bug can never pass for an integration bug. It
also checks that every model reporting `chat_ready` can actually load, instead of
trusting the registry annotation alone.

LewLM's own Chap checklist has thirteen UI behaviours, four of which need an
engine to go down. It runs in a browser against a fixture whose engine can be
stopped, killed and restarted from outside:

```bash
../LewLM/.venv/Scripts/python.exe scripts/lewlm-fixture.py --fallback --port 8081   # bin/python off Windows
LEWLM_BASE_URL=http://127.0.0.1:8081 npm run dev
npm run ui:checklist                                                                 # records docs/chap-validation.md's rows
LEWLM_BASE_URL=http://127.0.0.1:8081 LEWLM_FIXTURE_CONTROL=http://127.0.0.1:8099 npm run proof
```

With that harness running, the proof also runs the engine-down gap probes (G37,
G38, G40). The last recorded run is
[docs/chap-validation.md](docs/chap-validation.md).

## Where LewLM falls short

The integration line count goes *down* when LewLM gains a capability. Wiring
`tool_calls` into LewLM removed about 150 lines Chap would otherwise have
written. Normalizing its OpenAPI removed 60 from the type generator. Byte uploads
on `documents.ingest` removed a whole file-staging subsystem before it was ever
built.

When the count goes up, it is usually because LewLM is missing something. Those
cases are tracked in [docs/lewlm-gaps.md](docs/lewlm-gaps.md). Each entry states
what Chap needs, what the workaround costs, and the shape of a fix, and each has
a probe in `npm run proof` that flips from `gap` to `FIXD` when LewLM gains the
capability. That flip tells us which workaround to delete.

The Settings → Gaps screen is generated from a live proof run by
`npm run gen:gaps` rather than kept in step by hand, because that screen is where
a reader judges whether this project's central claim is honest, and a hand-kept
copy of a fact is exactly what drifts.

## Spoken replies

The `speak` toggle in the composer reads a reply aloud while it is still being
generated. The reply is split into sentences as tokens arrive, and each sentence
is synthesized as soon as it ends, so the first words play about one sentence
after the model starts instead of a whole turn later. Playback is scheduled on the
Web Audio clock so the clips join with no gap.

None of it needed a LewLM change: one `POST /v1/audio/speech` per sentence and
the existing typed client. All of it is in `web/`, because segmentation, jitter
and playback are browser concerns rather than contract concerns, which is also
why the integration budget above did not move. LewLM names its synthesis model
itself (G25) and lists the voices it can use (G27), so the drawer has one control
and a readout.

## Two skins, one component tree

Chap runs in two visual styles, switchable with `Cmd+\` (`Ctrl+\` on non-Apple
hardware, which is also how the control labels itself there):

- **Bench**: a dense, dark instrument panel with a live telemetry rail. The
  working environment.
- **Showroom**: spacious translucent glass. The display environment.

They are not two apps. One component tree reads one token layer, and the skin
swaps the token values. See [docs/skins.md](docs/skins.md).

## Modules and companions

LewLM is core, and it is the one part you cannot remove. Everything else attaches
as a module, and `npm run module:check` fails the build if a core file learns a
module's name. There are two kinds:

- **Built-in modules** are Chap features built on LewLM alone, and they are always
  on. `module-collections` is a retrieval store: chunks in `node:sqlite`, with
  embeddings and reranking from LewLM.
- **Companions** are adapters for *other products that run on LewLM*, so Chap can
  be used to test them too. They are **off unless `CHAP_COMPANIONS` names them**,
  and nothing in Chap needs them. `module-docktizo` is the one example today. It
  fronts [DocKtizo](packages/module-docktizo/README.md), an experimental
  document-generation service built on LewLM by the same author. If you have not
  heard of DocKtizo, you can ignore that directory.

```
                       integration     ui      budgets      kind
    lewlm                      711      —      900 / none   core
    module-collections         268     210     300 / 260    built-in
    module-docktizo            288    1221     340 / 1400   companion (off)
```

**Two budgets, because they answer different questions.** `integration` is what
it costs to *talk* to an upstream: the client, the store, the server half, the
types. `ui` is what it costs to *show* it. A file that renders is `.tsx` and a
file that talks is `.ts`, so the split needs no directory rules and JSX cannot
hide on the wrong side of it.

To test your own LewLM-based product through Chap, add a companion. The recipe,
and the rules that keep core blind to it, are in [docs/modules.md](docs/modules.md).

## Layout

```
packages/lewlm/       @chap/lewlm — the entire LewLM surface. Zero runtime
                      dependencies, no React, isomorphic. Core, not a module.
  src/generated/      from LewLM's contract. Checked in: the diff IS the record
                      of contract drift.
packages/module-*/    Everything that is not LewLM. Two exports each (./server
                      and ./web) and its own line budget. Companions carry a
                      README saying what they front.
server/               Hono. Proxies /v1 to LewLM and mounts whatever modules are
                      on. A byte pipe: it must never transform a payload.
web/                  Vite + React + Tailwind v4.
vendor/               contracts Chap generates from, so a checkout builds offline.
docs/                 modules.md, lewlm-gaps.md, skins.md, chap-validation.md,
                      cross-platform.md
scripts/              doctor, gen-types, gen-gaps, proof, probe, loc-budget,
                      module-check, skin-check, dev, npm (how to invoke npm on
                      every platform, in one place), ui-smoke, ui-checklist,
                      lewlm-fixture.py (LewLM's fake backend with engine controls)
```

## License

Apache-2.0, the same as LewLM. See [LICENSE](LICENSE).
