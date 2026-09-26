# Running Chap off the Mac it was written on

What differs by platform, and what a difference means when you see it.

Chap was developed on macOS and carries a portability pass that was written by
reading the tree rather than by running it — `fix(portability)` names four
Windows failures and two secure-context ones, all found by inspection. This
document is what running it on Windows afterwards actually found, so the next
person can tell a platform fact from a Chap defect without rediscovering the
difference.

Verified on Windows 11, Node 24.16, against LewLM `0.4.2` on 2026-08-26.

## What is the same

Everything the repo gates, which is most of it:

```
  npm install                     clean, no native rebuild (node:sqlite)
  npm run doctor                  ready
  npm run typecheck               clean
  npm test                        13 passed
  npm run module:check            2 registries, 2 modules
  npm run skin:check              5 shell files, 0/25 escape hatches
  npm run loc:budget              within every budget
  npm run gen:types -- --check    both targets in sync
  npm run build                   builds, fonts self-hosted
  npm run dev                     doctor, server on 8787, Vite on 5173
  NODE_ENV=production npm start   index.html, assets and SPA fallback all 200
```

Two things worth naming because they look like faults and are not. Vite binds
`localhost`, which resolves to `::1` first here, so `http://127.0.0.1:5173`
refuses the connection while the URL Vite prints works. And `serveStatic` is off
unless `NODE_ENV=production`, so a plain `npm start` answering 404 on `/` is the
configured behaviour, not a broken static root.

## What is not the same: audio

LewLM serves audio only through `mlx_audio`, and MLX is Apple silicon only. Both
audio bundles on this host are that runtime:

```
  kokoro-82m           audio_roles=[speech]          affinity=[mlx_audio]
  whisper-large-v3     audio_roles=[transcription]   affinity=[mlx_audio]
```

The two models that do load here are `llamacpp`, and they are text only. So the
composer's spoken replies and the dictation button have no backend on Windows —
not because Chap or the contract lost anything, but because no audio model on
this host can be loaded by a runtime that exists off Apple silicon.

That shows up in the proof as a lower score, and the score line in the README is
a macOS one:

```
  macOS     24 passed · 0 failed · 5 gaps confirmed · 17 gaps fixed upstream
  Windows   20 passed · 1 failed · 5 gaps confirmed · 17 gaps fixed upstream
```

The failure is `synthesis voices are listable`, and the two skips are the speech
and transcription probes. **The gap tallies are identical**, which is the number
that matters: contract parity is the same on both platforms, and the difference
is entirely which models this host can load.

The composition differs even though the count does not. `G27` (voices unlistable)
reads as an open gap here because there is no synthesis model to ask, and `G5`
(sampling controls) reads as fixed because a different runtime serves the
request. Neither flip is a contract change. This is the same caveat
`docs/lewlm-gaps.md` already makes about `G1` and `G5` — that some lines are
environment rather than contract — and on a non-Apple host it reaches two more.

## Two traps this found, and where they were fixed

**A contract hash that identified the checkout, not the contract.**
`gen:types --check` failed on a clean tree, reporting `meta.ts` stale and telling
you to regenerate. Nothing had drifted. LewLM pins nothing beyond `text=auto` in
its `.gitattributes`, so with Git for Windows' default `core.autocrlf=true` its
`examples/integration-bundle.json` checks out CRLF; `gen-types.mjs` hashed the
raw bytes of that file, so the hash moved while the parsed contract did not. The
LF-normalized hash of the live bundle is exactly the one `meta.ts` already
recorded.

Following the instruction would have made it real: regenerating writes the
CRLF-derived hash into the committed `meta.ts`, and copies thirteen fixtures
verbatim off the same checkout, turning a phantom on one platform into drift on
every other. Contract documents are now read through `asContract()` in
`scripts/gen-types.mjs`, which normalizes line endings where a document enters,
so a regeneration on Windows leaves a clean tree.

The root cause is one line in LewLM, and Chap cannot fix it there. DocKtizo (the
optional companion in `packages/module-docktizo`) already pins
`* text=auto eol=lf`, which is why its target never failed. **LewLM should do the
same** — until it does, Chap is only defending itself.

**A gaps screen generated from services that were not running.**
`gen:gaps` ran every proof and wrote what they reported. With DocKtizo down, its
proof still emits a full result set — five FAILs noted `fetch failed`, then five
GAPs noted `not verifiable without a working token` — and those were written out
as five open gaps *against DocKtizo*, with a suite line of `0 passed · 5 failed`.
The same run flipped LewLM's `G27` to open for the audio reason above.

That lands on the Settings screen a visitor reads to judge whether this
project's central claim is honest, and `--check` made it worse by telling
whoever saw the drift to run the command that publishes the false version.
`scripts/gen-gaps.mjs` now refuses: a suite that passed nothing proved nothing,
since every proof opens by establishing liveness, so zero passing probes means
the run never got far enough for a GAP line to mean absence-of-capability rather
than absence-of-service. It reports which upstream was unreachable and leaves
the module alone.

Run `npm run gen:gaps` only with every upstream it proves up. It is the one
command here whose output is a claim about somebody else. Since then, companions
are off by default, so the default run proves LewLM alone. A companion's proof
joins only when `CHAP_COMPANIONS` names it.

## The lanes, 2026-09-25

LewLM's `windows-linux-lanes` branch ran every engine lane on this host — native
Windows llama.cpp and Ollama, vLLM, SGLang and TabbyAPI under WSL2, CPU and CUDA
containers — and left Chap's UI checklist pending. That checklist is now
recorded in [chap-validation.md](chap-validation.md), against a fixture and
against the `lewlm:cuda` container. Five things came up that are about running
Chap on Windows rather than about LewLM's contract.

**Two servers can answer on one port.** The `lewlm:cuda` container publishes
`0.0.0.0:8080` and `[::]:8080` through Docker Desktop and `wslrelay`. A LewLM
started natively on `127.0.0.1:8080` binds as well, because Windows lets a
specific address share a port with the wildcard. From then on
`http://127.0.0.1:8080` reaches one server and `http://localhost:8080` —
`::1` first — reaches the other, with no error anywhere. Check `/v1/health`'s
`hostname` when a result looks like it came from the wrong place: a container
answers with its container id. Running a second LewLM on another port and
setting `LEWLM_BASE_URL` avoids the question.

**`npm run proof` ignored `.env`.** It is started with
`--env-file-if-exists=.env` so it proves "the same services the running app
talks to", and then read neither `LEWLM_BASE_URL` nor `LEWLM_API_KEY`: it
always proved `127.0.0.1:8080`, keyless. With the container above, that is a
different LewLM from the one Chap was pointed at. It reads both now, plus
`LEWLM_FIXTURE_CONTROL` for the harness, since `gen:gaps` passes no flags.

**`npm run dev` could leave a server behind.** `dev.mjs` stopped its tasks with
`child.kill()`, which on Windows ends npm and not the tsx or Vite process npm
started. A killed dev session left chap-server holding 8787. The next one's
server died with `EADDRINUSE` inside `tsx watch` — which keeps running, so
`dev.mjs` never saw it exit — while Vite, finding 5173 taken, moved to 5174 and
proxied to the stale server. It looked like a working app pointed at the wrong
LewLM. Now tasks are stopped with `taskkill /T /F` on Windows, and Vite has
`strictPort`, so a second dev server fails instead of drifting. `dev.mjs` run
directly (`node scripts/dev.mjs`) also works now: npm's CLI is found beside
`node.exe` rather than spawning `npm.cmd`, which fails with `EINVAL`.

**Vite's dev proxy held a dropped stream open.** With LewLM restarted under an
open `/v1/events`, chap-server truncated the response as it should, and Vite
kept the browser's side open. The explorer sat at "open" and never resumed.
Not Windows-specific, but found here. Production has no Vite hop and was never
affected. `web/vite.config.ts` now destroys the browser's response when the
upstream one closes incomplete.

**A refused connection is slow on Windows.** A fresh TCP connect to a closed
loopback port is refused after about two seconds (2.05–2.19 s measured here),
because Windows retries the SYN before reporting `WinError 10061`; on Linux and
macOS it fails in milliseconds. LewLM's first fix for G40 waited one second for
a stream's first item before committing headers, which covered the fast
platforms and not this one: the first streamed request to a freshly stopped
engine still got `200` and an in-band failure. The follow-up waits for the
engine to accept the connection instead of a fixed second, and the same request
is now a `503` after 2.05 s ([lewlm-gaps.md](lewlm-gaps.md), G40). Anything else
that times an engine's failure should still expect two seconds here, not zero.

**Chromium's offline emulation does not drop localhost.**
`context.setOffline(true)` leaves an established stream to `localhost` open, so
it cannot simulate a reconnect. The checklist restarts LewLM through the
fixture harness instead, which is a real drop, and a real `lost: null`.

## Notes

- `.env.example`, `.gitattributes` and `.gitignore` check out CRLF, because
  `.gitattributes` pins extensions and those have none. Node's `--env-file`
  parser strips the carriage return, so a CRLF `.env` reads correctly; this is
  cosmetic and is left alone.
- `server/.chap/vectors.sqlite` is tracked despite `.chap/` being ignored — it
  was committed once in `Solid foundation` and never updated. Ignoring a path
  does not untrack what is already in the index.
- `playwright` drives `scripts/ui-smoke.mjs` and `scripts/ui-checklist.mjs`;
  `npx playwright install chromium` once per machine.
