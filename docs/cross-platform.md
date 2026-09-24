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

The root cause is one line in LewLM, and Chap cannot fix it there. DocKtizo
already pins `* text=auto eol=lf`, which is why its target never failed. **LewLM
should do the same** — until it does, Chap is only defending itself.

**A gaps screen generated from services that were not running.**
`gen:gaps` runs every proof and writes what they report. With DocKtizo down, its
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

Run `npm run gen:gaps` only with every upstream up. It is the one command here
whose output is a claim about somebody else.

## Notes

- `.env.example`, `.gitattributes` and `.gitignore` check out CRLF, because
  `.gitattributes` pins extensions and those have none. Node's `--env-file`
  parser strips the carriage return, so a CRLF `.env` reads correctly; this is
  cosmetic and is left alone.
- `server/.chap/vectors.sqlite` is tracked despite `.chap/` being ignored — it
  was committed once in `Solid foundation` and never updated. Ignoring a path
  does not untrack what is already in the index.
- `playwright` is a devDependency that nothing imports or runs.
