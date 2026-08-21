# DocKtizo gaps

What DocKtizo needs so its Chap module can stay thin.

Chap's premise is that a GUI needs almost no application code when the service
behind it does the work. `docs/lewlm-gaps.md` tracks where that breaks for LewLM.
This document tracks the same thing for DocKtizo, and it exists as a separate
file because a module owns its own upstream: if DocKtizo were deleted tomorrow,
this document and `packages/module-docktizo` would go with it and Chap would not
notice.

Each open entry states what Chap needs, what is missing, a proposed shape, and
**the cost of the workaround**, because the cost is the argument. Every entry has
a probe in `npm run proof:dk` that flips from `gap` to `FIXD` when DocKtizo gains
the capability, which is how we learn a workaround can be deleted.

Verified against DocKtizo `0.1.0a0` (`0018_worker_presence`) on 2026-08-10.

```
  2 passed · 0 failed · 0 gaps confirmed · 6 gaps fixed upstream
```

**Nothing is open.** All six entries this document opened on 2026-08-09 were
closed within a day, and each one is recorded below with what Chap deleted.

Two of them — D5 and D6, including the one this document called "the most
serious" — were already fixed at DocKtizo's HEAD when they were filed. Chap had
probed an older build. That is worth recording rather than quietly deleting: a
gap report is only as good as the build it was measured against, and the probe
that would have caught it is the same probe that now proves the fix.

The interesting result is that **closing all six made the module bigger, not
smaller** — 788 lines to 882. The workarounds did shrink; what grew was
everything the fixes made possible. See the note at the end, because it
complicates this project's usual argument and is the more honest finding.

---

## Open

None.

---

## Closed

| | What Chap deleted | What replaced it |
|---|---|---|
| **D1** | A two-call probe — liveness, then an authenticated read of the cheapest route — because `/healthz` checked nothing and could not tell a working service from an unconfigured one. And a guess in an empty-table message: *"an API running without `python -m docktizo.worker` never emits any"*. | One call to `/health/ready`, which is anonymous but tiered, and a `worker_heartbeats` table behind it. Chap now names the component that is down: **`lewlm unavailable — nothing will run`**, or the worker when no process is heartbeating. The failure that was invisible — an API accepting generations that nothing will ever run — is reported in the nav before you click anything. |
| **D2** | A resolution chain that could only reach a *running process*, and a drift gate that compared a vendored snapshot against itself. | `docs/api/openapi.json` and `docs/api/contract.json`, committed and gated by DocKtizo's own `make contract-check`. `gen:types --target docktizo` reads the repo first and vendors both. |
| **D2** | **The hand-maintained state machine.** `types.ts` carried a `PIPELINE` tuple and a `TERMINAL` list because neither was published. The hand-written version was **wrong**: it omitted `changes_requested` from the terminal set, so a generation that came back for changes would have been followed forever. | `generated/contract.ts`, from `contract.json` — `pipeline_order`, `terminal`, `resting`, the full transition table, and the error, event and capability vocabularies. Nothing about the state machine is hand-written now, and the bug went with it. |
| **D3** | The poll loop: a 2-second tick, a `has_more` page walk, its own cursor bookkeeping, and terminal-state detection to decide when to stop. Stage transitions below the tick were simply never displayed. | `GET /v1/generations/{id}/events/stream`, read with **`readSSE` from `@chap/lewlm`** — written for LewLM's chat and event streams, reused for DocKtizo without a line of change, because DocKtizo now speaks the same wire format. Frames carry the paged cursor as `id:`, so the UI shows a resume point and a `stream_completed` reason. |
| **D4** | Nothing — there was no workaround to delete, only a thing Chap could not show. | `/v1/whoami` and an `X-Workspace-ID` echo on every authenticated response. The DocKtizo screen now opens with **acting as**: workspace, subject, method, roles and the full scope list. That last part is not decoration — see the note below. |
| **D5** | Nothing. Chap could not work around it: re-adding a size limit means putting logic into a byte pipe whose header comment forbids exactly that. | The guard counts streamed bytes rather than trusting `content-length`, so a body forwarded by any streaming proxy is enforced like any other. Already fixed at HEAD when filed. |
| **D6** | A generate tab that would happily submit a request that could not succeed, and a failure arriving several stages later with a code describing the symptom. | Submit-time rejection with `provider_capability_missing` and `missing_capabilities` — the option this document argued for — plus per-workflow coverage in the readiness report. Chap now warns *before* the button, through the same `CapabilityNotice` it uses for LewLM. That component was already there; it just finally had something to read. |
| — | `issue_count: N` and no indication of which N. | Index-aligned `issue_locations` and `issue_codes`, values and human messages deliberately withheld. The generate tab renders them as a two-column table: field, problem. Submitting a status report with only `project_name` now says `reporting_period missing · reporting_date missing · facts missing` instead of "3". |
| — | A second way to read the same log. Chap's client had both a paged `events()` and the stream. | Just the stream. The two are interchangeable by design, so keeping both was Chap storing a choice nobody makes. |

---

### The number went up, and that is the honest result

`packages/module-docktizo` was 788 lines with six open gaps and is 882 with none.
That is the opposite of what this project's argument usually predicts, and the
reason is worth stating plainly rather than explaining away.

The workaround code did shrink. The hand-maintained state machine is gone, the
poll loop is gone, the two-call probe is one call, and the duplicate log reader
is gone. What replaced them is larger, because six fixes each made something
possible that had not been worth building before:

- readiness that names a component, so the module reports *why* rather than *that*
- an identity panel, which needed an endpoint that would answer it
- a pre-submit capability warning, which needed a vocabulary the two services shared
- located validation issues, which needed the locations
- a resume checkpoint and a completion reason, which needed a stream

None of that is a workaround. All of it is the module doing more because the
contract reaches further. The budget moved 850 → 950 to hold it, which is the
right reason to move a budget and the only one this repo accepts.

The lesson for `docs/lewlm-gaps.md`'s framing: a closed gap does not always
return lines. Sometimes it returns *capability*, and the line count goes up while
the amount of guessing goes down. The count of things Chap has to know that its
upstream will not tell it — which is what these documents actually measure — went
from six to zero.

---

### Notes from standing DocKtizo up

Findings that are not contract gaps but cost time, recorded so they cost it once.

**The scope list is longer than it looks.** `events:read` and `artifacts:download`
are separate authorization actions from `generations:read` and `artifacts:read`. A
token with the obvious scopes gets `403 authorization_denied` on both the paged
event read and the stream, and the envelope does not name the action that was
denied — so the symptom is a screen that works until the moment it doesn't. This
is the specific thing the **acting as** panel now exists to prevent: the scope
list is on screen, in the first tab, before anything is submitted.

The development configuration Chap's bench uses:

```
DOCKTIZO_AUTH_PROVIDER=none          # yes, `none`, while authentication is on
DOCKTIZO_AUTH_LOCAL_ENABLED=true
DOCKTIZO_AUTH_LOCAL_TOKEN=<at least 32 characters, no whitespace>
DOCKTIZO_AUTH_LOCAL_WORKSPACE_IDS=["bench"]
DOCKTIZO_AUTH_LOCAL_SCOPES=[... including "events:read" and "artifacts:download"]
```

**Enabling authentication is still spelled `auth_provider=none`.**
`DOCKTIZO_AUTH_PROVIDER` accepts only `none` or `external`; `local` is a startup
validation error. Local bearer auth is a separate flag. It reads as a bug every
time.

**The database is not migrated on startup**, and `alembic upgrade head` against a
database created by an older revision can fail outright rather than upgrading —
migration `0018_worker_presence` did on a schema left over from `0015`. A fresh
file was faster than a repair.

**The request field is `title`; the response field is `display_name`.** `POST
/v1/sources` is `additionalProperties: false`, so echoing the response's spelling
back is a 422 — one that now tells you which field, which is how this stopped
being a five-minute problem.

**`structured_generation_failed` on this host is LewLM crashing, not a weak
model.** This note previously said the local model was not good enough to produce
a valid status report. That was wrong, and the way it was wrong is worth keeping.

What is actually true:

- This host has two GGUF models on llama.cpp, and
  `/v1/models/{id}/capabilities` reports `json_schema` with
  `enforcement: decode_time`, `decoder_enforced: true`, `fallback_used: false`.
  Given a small schema, `gemma-4-e4b-hauhau-agg-q8-k-p` returns valid,
  schema-conforming JSON on the first try.
- With no `DOCKTIZO_LEWLM_MODEL` pinned, LewLM routes to an MLX model, where
  structured output is prompt-guided only. It returns prose, DocKtizo rejects it,
  and the error is `structured_generation_failed` with `retryable: false`.
- With the GGUF model pinned, DocKtizo spends ~25 seconds in `generating` doing
  real grammar-constrained work and then fails with `retryable: true` — because
  **LewLM dies mid-request**. `StatusReportSpec` has seven string fields at
  `maxLength: 5000`, and LewLM compiles each into one nested GBNF rule per
  permitted character until llama.cpp's grammar parser refuses and the process
  exits. One property at `maxLength: 2000` is enough. See
  `docs/lewlm-gaps.md`, **G30**.

So the blocker is upstream of DocKtizo and upstream of the model, and neither of
the two things this note originally blamed was responsible. The lesson is the
one this repo keeps relearning: `retryable: true` was the tell, and it was there
in the first run.

**No artifact has been rendered end to end on this host yet.** Everything up to
the model's output is verified: submit, idempotent replay, the 409 on a changed
body, the worker claiming the row, the state machine advancing through six event
types, the event stream with resumable cursors, cancellation, and typed terminal
errors. Only the render and the download link are unexercised, and the reason is
now a numbered LewLM gap with a one-line reproducer rather than a shrug about
model quality.

**G30 was fixed in LewLM on 2026-08-11**, which removes that blocker: a schema
shaped like `StatusReportSpec` — seven fields at `maxLength: 5000` — compiles to
a grammar llama.cpp accepts, and a bound too large for a grammar parser comes
back named in `structured_output.grammar_relaxations` and validated after
generation rather than killing the server. Nothing here has been re-run since, so
this note describes the last run and not the next one: `npm run proof:dk` with
the GGUF model pinned is what turns the paragraph above into a rendered artifact
or into the next real finding.
