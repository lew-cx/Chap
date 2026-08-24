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
     56  packages/lewlm/src/events.ts     the /v1/events subscription, filtered
     47  packages/lewlm/src/sse.ts        SSE reader
     26  packages/lewlm/src/index.ts
     25  packages/lewlm/src/multipart.ts  attachment parts
  -----
    661  lewlm   (budget 900)
```

That number is checked by `npm run loc:budget`. It buys a full chat surface,
a five-tab operations console, a lab over every non-chat surface, sessions, a live
event explorer, and replies spoken aloud as they stream. Everything else Chap
knows about LewLM — 57 routes, 293 schemas, 55 event types, 41 error codes — is
**generated from LewLM's own published contract**, never hand-written.

## LewLM is core. Everything else attaches.

Chap is a LewLM client, and that is the part you cannot remove. Everything else
is a module, including the vector store that used to be the one piece of real
domain code in this repo:

```
    661  lewlm              (budget 900)
    478  module-collections (budget 500)    retrieval: chunks in node:sqlite
   1521  module-docktizo    (budget 1550)   a document service, 23 of its 31 operations
   2660  everything Chap hand-wrote
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
possible that had not been worth building before.

It happened again, at four times the size. DocKtizo grew a second half —
`executive_memo.v1`, `proposal.v1`, an incompatible `status_report.v2`, and
explicit workflow-version migration — and the module went 936 to 1,521 lines
reaching all of it. Not one of those lines is a workaround. They are review
decisions, revision history, targeted revisions, manual overrides, and a
migration preview that reports what a version change would derive and what it
would drop before anything is written.

Reaching that far opened two new gaps, and both were DocKtizo knowing an answer
and publishing no way to ask for it — which registered version a document may
migrate onto, and what documents a workspace holds. Both were closed within
hours, and this time the fixes came back the other way: the migrate panel stopped
offering migrations that could not happen, the document tab stopped being a box
asking you to paste an id, and the proof stopped needing a working model to have
anything to prove against.

So a closed gap does not always return lines, and neither does a capable
upstream. Sometimes what comes back is reach, and the count of things Chap has to
guess about its upstream — which is what
[docs/docktizo-gaps.md](docs/docktizo-gaps.md) actually measures — is the number
worth watching instead. It has been to zero twice now.

That number goes *down* when LewLM gains a capability. Wiring `tool_calls` into
LewLM deleted ~150 lines Chap would otherwise have written; normalizing its
OpenAPI deleted 60 from the type generator; byte uploads on `documents.ingest`
deleted a whole file-staging subsystem before it was built.

When the number goes up, it is usually because LewLM is missing something. Those
are tracked in [docs/lewlm-gaps.md](docs/lewlm-gaps.md), and each entry has a
probe in `npm run proof` that flips from `gap` to `FIXD` when LewLM gains the
capability — telling us which workaround to delete.

```
  24 passed · 0 failed · 3 gaps confirmed · 17 gaps fixed upstream
```

Two of the three `gap` lines are environment rather than contract — CORS is off
on this server, and the runtime honors none of the sampling controls it was sent,
both reported faithfully. The one real entry is G13, and it is half of what it
was:

`/v1/events` takes `types`, `scope`, `request_id` and `model_id`, applied at the
bus before an event is queued, so the events explorer's filters are now *sent*
rather than applied on arrival and the token flood never crosses the wire.
Replay is still missing: frames carry no `id:`, so a reconnect has no cursor and
Chap still marks the gap in the timeline rather than pretending it was continuous.

G31 closed the same day it was opened. A runnable model whose context length
LewLM never recorded was refused any request it estimated at 4,096 tokens or
more, and DocKtizo's default structured-generation budget is exactly 4,096 — so
every document generation on this host was refused before a prompt was written.
LewLM now reads the window out of the GGUF header (`null` → `131072`), scores
against what the runtime will actually reserve rather than what the model
advertises, and makes the unmeasured ceiling a setting it names in the refusal.

G29 closed earlier the same day: the MLX runtime streams incrementally now, so
spoken replies get the head start they were built for. Chap deleted nothing to
collect that, which is the point — the feature was built against the contract and
the contract caught up. `npm run proof` synthesizes a phrase and transcribes it
back to prove both audio ends in one pass.

## Spoken replies

The `speak` toggle in the composer reads a reply aloud while it is still being
generated. The reply is cut into sentences as the tokens arrive and each one is
synthesized when it closes, so the first words play about a sentence after the
model starts rather than a turn later. Playback is scheduled on the Web Audio
clock so the clips abut without a gap.

That head start is only as good as the stream underneath it, and for a while it
was not: on the two MLX bundles the whole reply arrived in one delta for some
prompts, so every sentence closed at once and the feature degraded to reading a
finished reply. That was G29. It is fixed upstream, and nothing in Chap changed
to collect the fix.

None of it needed a LewLM change — one `POST /v1/audio/speech` per sentence and
the existing typed client. All of it is in `web/`, because segmentation, jitter
and playback are browser concerns rather than contract concerns; that is also why
the integration budget above did not move.

It started with two controls that existed only because of gaps — a model select
and a free-text voice box. Both are gone: LewLM now names the synthesis model
itself (G25) and lists the voices it can use (G27), so the drawer has one control
and a readout.

## The document lifecycle

DocKtizo's own pipeline ends at `awaiting_review`, and for a while so did Chap's
screen: the run finished, the artifact existed, and nothing in the UI could
approve it, send it back, correct it, or move it onto a newer version of its
workflow. All four were routes with no caller.

The document tab is the other half. It opens on the document a generation
produced — not the run, which is over, but the durable thing with a head
revision, a review state and a version history — and offers what DocKtizo offers
against it:

- **Review.** Approve, reject, or request changes, with the decision history
  above the buttons. The buttons stay live in every state; DocKtizo owns the
  transition table and answers an illegal decision with
  `invalid_approval_transition`, which is shown as it arrived. Greying them out
  would be Chap restating that table in TypeScript and being wrong about it
  eventually.
- **Revise.** A targeted revision names the fields to redo and hands the workflow
  instructions; a manual override supplies the values outright and runs no model.
  Both are new immutable revisions, and the one above is never rewritten.
- **Migrate.** `status_report.v1` documents stay on `status_report.v1` until
  someone asks — nothing in DocKtizo resolves to "the latest", and Chap does not
  invent it. Asking is a preview first: DocKtizo runs the registered mapping,
  validates the candidate under the target version's complete rules, writes
  nothing, and reports every consequence as a coded notice. The ones that must be
  acknowledged are checkboxes, and they are *DocKtizo's* list —
  `required_acknowledgements`, not Chap's reading of the severities beside them.

```
  policy     status_report.v1-to-v2.1.0     loses content  no
  template   workflow_default               candidate      invalid

  status_report.v2 would reject this document: schema_too_short

  warning  overall_status  v1 records no headline judgement, so overall_status  [x]
                           was derived from the migrated milestones and risks
  info     template_id     v1 templates are not compatible with v2              —
```

That last line is the argument for previewing at all: the mapping succeeded and
the result still would not pass, so the submit would be refused. Knowing which
rule turns "try again" into "fix this first".

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
