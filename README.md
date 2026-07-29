# Chap

A GUI test bench and showroom for [LewLM](../LewLM) — and, later, DocKtizo.

Chap exists to show how little application code a full-featured chat and
operations interface needs when the backend does the work.

```
  hand-written LewLM integration code

    209  packages/lewlm/src/stream.ts     both surfaces, streaming or not, one union
    107  packages/lewlm/src/types.ts      curated names over the generated contract
     92  packages/lewlm/src/errors.ts     one error type for everything
     84  packages/lewlm/src/http.ts       typed fetch + identity headers
     47  packages/lewlm/src/sse.ts        SSE reader
     41  packages/lewlm/src/events.ts     the /v1/events subscription
     26  packages/lewlm/src/index.ts
     25  packages/lewlm/src/multipart.ts  attachment parts
  -----
    631  total   (budget 900)
```

That number is checked by CI (`npm run loc:budget`). It buys a full chat surface,
a five-tab operations console, a lab over every non-chat surface, sessions, a live
event explorer and a retrieval store. Everything else Chap knows about LewLM —
54 routes, 284 schemas, 55 event types, 39 error codes — is **generated from
LewLM's own published contract**, never hand-written.

The one piece of real domain code is `server/src/vectors.ts`: a vector store on
`node:sqlite`, zero dependencies. It exists because LewLM deliberately owns no
vector storage, so retrieval splits cleanly — Chap finds candidates, LewLM scores
and grounds them.

That number goes *down* when LewLM gains a capability. Wiring `tool_calls` into
LewLM deleted ~150 lines Chap would otherwise have written; normalizing its
OpenAPI deleted 60 from the type generator; byte uploads on `documents.ingest`
deleted a whole file-staging subsystem before it was built.

When the number goes up, it is usually because LewLM is missing something. Those
are tracked in [docs/lewlm-gaps.md](docs/lewlm-gaps.md), and each entry has a
probe in `npm run proof` that flips from `gap` to `FIXD` when LewLM gains the
capability — telling us which workaround to delete.

```
  19 passed · 0 failed · 0 gaps confirmed · 11 gaps fixed upstream
```

Two gaps remain open, both needing a subsystem rather than a field.

## Two skins, one component tree

Chap runs in two aesthetics, switchable with `Cmd+\`:

- **Bench** — dense dark instrument panel with a live telemetry rail. The
  working environment.
- **Showroom** — spacious translucent glass. The display environment.

They are not two apps. One component tree reads one token layer; the skin swaps
the token values. See [docs/skins.md](docs/skins.md).

## Running it

Chap needs a LewLM server. Chap's own server proxies to it, so the SPA and the
API share one origin, the API key stays out of the browser, and there is a home
for the vector store LewLM deliberately does not own.

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
npm run gen:types -- --check   # fails if LewLM's contract has drifted
npm run loc:budget             # fails if hand-written integration code grew
npm run skin:check             # fails if a skin leaked out of the shell
npm run typecheck
```

`npm run proof` is deliberately browser-free: it proves the transport layer
independently of React, so a UI bug can never masquerade as an integration bug.
It finds a usable model by probing rather than trusting `chat_ready`, which is a
registry-level claim: on this host five models report it and only two load.

## Layout

```
packages/lewlm/   @chap/lewlm — the entire integration surface. Zero runtime
                  dependencies, no React, isomorphic.
  src/generated/  from LewLM's contract. Checked in: the diff IS the record of
                  contract drift.
server/           Hono. Proxies /v1 to LewLM and /dk to DocKtizo. A byte pipe —
                  it must never transform a payload.
web/              Vite + React + Tailwind v4. The showroom.
docs/             lewlm-gaps.md, skins.md, transport.md
scripts/          gen-types, proof, loc-budget, dev
```
