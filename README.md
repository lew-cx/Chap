# Chap

A GUI test bench and showroom for [LewLM](../LewLM), and a place to attach
whatever else you run beside it.

Chap exists to show how little application code a full-featured chat and
operations interface needs when the backend does the work.

```
  hand-written LewLM integration code

    223  packages/lewlm/src/stream.ts     both surfaces, streaming or not, one union
    108  packages/lewlm/src/types.ts      curated names over the generated contract
     92  packages/lewlm/src/errors.ts     one error type for everything
     84  packages/lewlm/src/http.ts       typed fetch + identity headers
     47  packages/lewlm/src/sse.ts        SSE reader
     41  packages/lewlm/src/events.ts     the /v1/events subscription
     26  packages/lewlm/src/index.ts
     25  packages/lewlm/src/multipart.ts  attachment parts
  -----
    646  lewlm   (budget 900)
```

That number is checked by `npm run loc:budget`. It buys a full chat surface,
a five-tab operations console, a lab over every non-chat surface, sessions, a live
event explorer, and replies spoken aloud as they stream. Everything else Chap
knows about LewLM — 56 routes, 291 schemas, 55 event types, 39 error codes — is
**generated from LewLM's own published contract**, never hand-written.

## LewLM is core. Everything else attaches.

Chap is a LewLM client, and that is the part you cannot remove. Everything else
is a module, including the vector store that used to be the one piece of real
domain code in this repo:

```
    646  lewlm              (budget 900)
    478  module-collections (budget 500)   retrieval: chunks in node:sqlite
    936  module-docktizo    (budget 950)   a document service, 14 of its 26 routes
   2060  everything Chap hand-wrote
```

A consumer who wants a chat and operations GUI deletes two directories and four
lines and still has a coherent product. `npm run module:check` fails the build if
a core file learns a module's name, so that stays true rather than merely being
claimed. See [docs/modules.md](docs/modules.md).

The per-package split is the interesting number, and it does not say what you
would expect. `module-docktizo` opened with six gaps against its upstream; all
six were closed within a day, and the module got **bigger** — 788 lines to 936.
The workarounds shrank: a hand-maintained copy of DocKtizo's state machine, a
2-second poll loop with its own cursor bookkeeping, and a two-call readiness
probe all went. What replaced them is larger, because each fix made something
possible that had not been worth building before — a readiness report that names
the component that is down, a pre-submit capability warning, validation errors
that say which field.

So a closed gap does not always return lines. Sometimes it returns capability,
and the count of things Chap has to guess about its upstream — which is what
[docs/docktizo-gaps.md](docs/docktizo-gaps.md) actually measures — goes from six
to zero while the line count rises.

That number goes *down* when LewLM gains a capability. Wiring `tool_calls` into
LewLM deleted ~150 lines Chap would otherwise have written; normalizing its
OpenAPI deleted 60 from the type generator; byte uploads on `documents.ingest`
deleted a whole file-staging subsystem before it was built.

When the number goes up, it is usually because LewLM is missing something. Those
are tracked in [docs/lewlm-gaps.md](docs/lewlm-gaps.md), and each entry has a
probe in `npm run proof` that flips from `gap` to `FIXD` when LewLM gains the
capability — telling us which workaround to delete.

```
  23 passed · 0 failed · 2 gaps confirmed · 15 gaps fixed upstream
```

Two gaps remain open: `/v1/events` has no filtering or replay, and on the MLX
runtime some prompts deliver the whole reply as a single delta, so streaming is
the transport but not the experience. The three audio gaps this project opened
while bringing transcription and speech up were closed within a day, and each one
deleted code: two model selects, the probing behind them, a free-text voice box
and its caveat. `npm run proof` synthesizes a phrase and transcribes it back to
prove both ends in one pass.

## Spoken replies

The `speak` toggle in the composer reads a reply aloud while it is still being
generated. The reply is cut into sentences as the tokens arrive and each one is
synthesized when it closes, so the first words play about a sentence after the
model starts rather than a turn later. Playback is scheduled on the Web Audio
clock so the clips abut without a gap.

That head start is only as good as the stream underneath it. On the two MLX
bundles on this host the whole reply currently arrives in one delta for some
prompts, so every sentence closes at once and the feature falls back to reading
a finished reply — no worse than not having it, but none of the benefit. That is
G29, and it is LewLM's to fix rather than something Chap can segment around.

None of it needed a LewLM change — one `POST /v1/audio/speech` per sentence and
the existing typed client. All of it is in `web/`, because segmentation, jitter
and playback are browser concerns rather than contract concerns; that is also why
the integration budget above did not move.

It started with two controls that existed only because of gaps — a model select
and a free-text voice box. Both are gone: LewLM now names the synthesis model
itself (G25) and lists the voices it can use (G27), so the drawer has one control
and a readout.

## Two skins, one component tree

Chap runs in two aesthetics, switchable with `Cmd+\`:

- **Bench** — dense dark instrument panel with a live telemetry rail. The
  working environment.
- **Showroom** — spacious translucent glass. The display environment.

They are not two apps. One component tree reads one token layer; the skin swaps
the token values. See [docs/skins.md](docs/skins.md).

## Running it

Chap needs a LewLM server. Chap's own server proxies to it, so the SPA and the
API share one origin and no credential — LewLM's or a module's — reaches the
browser.

Modules are optional. With none registered, everything below still works and
Chap is a LewLM client and nothing else.

LewLM now supports CORS, so talking to it directly works too — start it with
`LEWLM_CORS_ENABLED=true` and `LEWLM_CORS_ALLOW_ORIGINS='["http://localhost:5173"]'`.

```bash
# 1. LewLM
cd ../LewLM
.venv/bin/lewlm serve

# 2. Chap
npm install
npm run gen:types      # reads LewLM's contract; no running server needed
npm run dev            # http://localhost:5173
```

Copy `.env.example` to `.env` to point at a different LewLM or supply an API key.
The key stays in the server process; the browser never receives it.

## Verifying

```bash
npm run proof                  # exercises the transport layer against live LewLM
npm run proof:dk               # the same, for DocKtizo — needs its API and worker
npm run gen:types -- --check   # fails if LewLM's contract has drifted
npm run loc:budget             # fails if any package's hand-written code grew
npm run module:check           # fails if core learned a module's name
npm run skin:check             # fails if a skin leaked out of the shell
npm run typecheck
```

`npm run proof` is deliberately browser-free: it proves the transport layer
independently of React, so a UI bug can never masquerade as an integration bug.
It verifies that every model reporting `chat_ready` can actually load, rather
than trusting the registry annotation on its own.

## Layout

```
packages/lewlm/       @chap/lewlm — the entire LewLM surface. Zero runtime
                      dependencies, no React, isomorphic. Core, not a module.
  src/generated/      from LewLM's contract. Checked in: the diff IS the record
                      of contract drift.
packages/module-*/    Everything that is not LewLM. Two exports each — ./server
                      and ./web — and its own line budget.
server/               Hono. Proxies /v1 to LewLM, mounts whatever MODULES holds.
                      A byte pipe — it must never transform a payload.
web/                  Vite + React + Tailwind v4. The showroom.
docs/                 modules.md, lewlm-gaps.md, docktizo-gaps.md, skins.md
scripts/              gen-types, proof, probe, loc-budget, module-check,
                      skin-check, dev
```
