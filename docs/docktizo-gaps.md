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

Verified against DocKtizo `0.1.0a0` (`0021_workflow_version_migrations`) on
2026-08-24.

```
  6 passed · 0 failed · 0 gaps confirmed · 8 gaps fixed upstream
```

**Nothing is open, again.** DocKtizo grew a second half between `0018` and
`0021` — `executive_memo.v1`, `proposal.v1`, a genuinely different
`status_report.v2`, and explicit workflow-version migration — and reaching all of
it opened two gaps. Both were the same shape: DocKtizo knew an answer, used it
internally, and published no way to ask for it. Both were closed within hours,
and this time both **returned lines** rather than costing them.

All eight entries this document has opened are closed, and each is recorded below
with what Chap deleted.

Two of them — D5 and D6, including the one this document called "the most
serious" — were already fixed at DocKtizo's HEAD when they were filed. Chap had
probed an older build. That is worth recording rather than quietly deleting: a
gap report is only as good as the build it was measured against, and the probe
that would have caught it is the same probe that now proves the fix.

The interesting result is that **closing all six made the module bigger, not
smaller** — 788 lines to 882. The workarounds did shrink; what grew was
everything the fixes made possible. See the note at the end, because it
complicates this project's usual argument and is the more honest finding. The
same thing happened again in this pass, at four times the size.

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
| **D7** | The migrate panel's target chooser, which offered *every other installed version of the same document type* — a superset — because the registered source-to-target pairs were not published. It could present a migration that could not happen, and the user found out from a `422 unsupported_workflow_migration` after choosing. `npm run proof:dk` carried the same guess as a loop that submitted previews until one was not refused. | `migration_targets` on `DocumentTypeResponse`, which is `WorkflowMigrationRegistry.targets_for()` — the table DocKtizo was already consulting. The chooser reads it, the proof reads it, and a published target the preview then refuses is now a **failure** rather than a skipped candidate, because the two disagreeing is worth knowing. |
| **D8** | The document tab's opening screen: a box asking you to paste a `document_id`. Reloading the page made the work unreachable unless the id had been written down. | `GET /v1/documents`, cursor-paged and workspace-scoped. The tab opens on a catalogue — title, workflow, revision, review state — and a row is the way in. The proof also stopped depending on a working model: its lifecycle section can now prove against any document the workspace already holds rather than only one it just made. |

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

### It happened again, at four times the size

`packages/module-docktizo` is now 1,521 lines, and the budget moved 950 → 1,550
to hold it. No gap forced any of it.

Between `0018_worker_presence` and `0021_workflow_version_migrations`, DocKtizo
grew a second half: `executive_memo.v1`, `proposal.v1`, a `status_report.v2`
whose contract is genuinely different from v1's, and explicit workflow-version
migration. The module's covered surface went from 12 of DocKtizo's operations to
23 of 31. Line count roughly doubled; so did reach. Per DocKtizo operation the
module went from 78 lines to 66 — it got *cheaper* per unit of upstream it
fronts, which is the only per-unit direction this project treats as a good sign.

What the new lines are:

- **the document, not the run.** A generation is one execution; a document is the
  durable thing with a head revision, a review state and a version history. The
  module used to stop at the run, which is why `awaiting_review` was a wall — the
  stepper reached it and nothing could act on it.
- **review.** Approve, reject, request changes, with the decision history. The
  buttons stay live in every state because DocKtizo owns the transition table and
  answers an illegal decision with `invalid_approval_transition`; greying them out
  would be Chap restating that table and being wrong about it eventually.
- **revision.** Targeted (name the fields, hand the workflow instructions) and
  manual override (supply the values, run no model). Both are new immutable
  revisions through the same durable executor, so both come back as a generation
  to watch.
- **migration.** The preview is the feature: DocKtizo maps the document under the
  target version, validates the candidate against that version's complete rules,
  writes nothing, and reports every consequence as a coded notice.
  `required_acknowledgements` is rendered as checkboxes exactly as it arrives.

Three things got *smaller* in the same pass, and all three are the same move —
stop restating something DocKtizo already says:

| What went | Why |
|---|---|
| The document-type discovery fallback in the generate tab, and its own copy of the catalogue | The workflow is standing context for the whole screen now that four are installed, so it is one picker in the header and one read in the store. |
| `artifactDownloadUrl(id)`, which assembled `/v1/artifacts/{id}/download` | `ArtifactResponse.download_url` is that path. It was the only route in the module Chap built by hand from a shape it had agreed to elsewhere. |
| A regex splitting `status_report.v2` into `status_report` and a version | `DocumentResponse.document_type` is the family. Chap was parsing an identifier grammar that is published as two fields. |

And one correctness fix that came out of reading the contract properly: the
generation tab treated `TERMINAL` as "the run is over". It is not — `RESTING`
is. `awaiting_review` is resting and cancellable at the same time, and it is the
only state where those differ.

---

### The second time, the number came back down

D7 and D8 were closed within hours of being filed. The module is 1,521 lines
against 1,550 of budget and covers one more DocKtizo operation than it did before
the fixes landed.

| | Deleted | Added |
|---|---|---|
| D7 | the superset-and-refusal chooser, and the proof's preview loop | one field read |
| D8 | the paste-an-id screen | a catalogue, which is bigger than what it replaced |

So the ledger is mixed, which is the honest way to report it: one fix shrank the
code, the other grew it, and the net is roughly flat. What is not flat is the
guessing. The chooser can no longer offer a migration that will be refused, and
the tab can no longer be a dead end after a page reload.

One thing came out that neither gap asked for: `Adopt`, a shared component for
"paste an id this session did not create", had two callers and now has one, so it
was inlined back into the generation tab. A shared abstraction with one caller is
a layer, not reuse. The generation tab keeps the box because there is no
`GET /v1/generations` — and that is not filed as a gap, because a generation is a
run and the run is not the durable thing. The document is, and DocKtizo lists
those now.

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

**`structured_generation_failed` has meant three different things on this host,
and none of them was a weak model.** This note is kept in full because the way it
was wrong each time is the useful part.

It first blamed model quality. Then G30 — LewLM dying mid-request compiling
`StatusReportSpec`'s seven `maxLength: 5000` fields into a GBNF grammar
llama.cpp's parser refused. G30 was fixed in LewLM on 2026-08-11 and that
diagnosis was correct for that build.

On `0.4.2` the same error code means something new, and it is
`docs/lewlm-gaps.md` **G31**. LewLM records no `context_length` for either
converted GGUF bundle and refuses any request it estimates at 4,096 tokens or
more. DocKtizo's default `DOCKTIZO_LEWLM_STRUCTURED_MAX_OUTPUT_TOKENS` is 4,096,
so the ceiling is spent before a prompt is written and **every** structured
generation is refused with a `400 routing_error` — which DocKtizo faithfully
reports as `structured_generation_failed`, retryable or not depending on where in
the pipeline it lands. Lowering the bound is what makes generation work at all:

```
DOCKTIZO_LEWLM_STRUCTURED_MAX_OUTPUT_TOKENS=768
DOCKTIZO_LEWLM_TIMEOUT_SECONDS=300   # grammar-constrained work takes ~35s here
```

The 768 matters twice. The repair stage re-sends the prompt *plus* the rejected
candidate and its issues, so a value that fits the first attempt can still refuse
the second — which is exactly what happened at 2,048, and it looked like a
different bug.

Three diagnoses, three builds, and the constant is that the tell was in the first
run each time and the error code named the symptom rather than the cause.

**An artifact now renders end to end on this host.** `npm run proof:dk` submits a
`status_report.v1`, follows the event stream to `awaiting_review`, and the
document tab downloads the rendered `.docx` through the proxy. Approving it
through the UI moves the review state to `approved` and the execution state to
`completed`; approving it a second time comes back
`409 invalid_approval_transition — revision is not awaiting a review decision`,
rendered verbatim. The migration preview reports policy
`status_report.v1-to-v2.1.0` with one acknowledgement required, and an
unacknowledged submit is refused `422 migration_acknowledgement_required`.

A migration completes end to end, and getting there took the module's own
manual-override path. The first run's spec carried only the four required fields,
so the v2 candidate failed v2's `schema_too_short` rule — the preview reported
`candidate_valid: false` and the submit was refused
`422 invalid_migration_candidate`, both of which is the contract working. Adding
milestones, risks and a decision through `revisions/manual-override` produced a
v1 revision the mapping could judge, and the migration went through:

```
1  generated        status_report.v1  completed        approved
2  manual_override  status_report.v1  awaiting_review  awaiting_review
3  migration        status_report.v2  awaiting_review  awaiting_review   head
   from status_report.v1 by policy status_report.v1-to-v2.1.0
```

`WORKFLOW_MIGRATION_APPLIED` is emitted, the document head moves to
`workflow_version: 2`, revision 1 is still v1 and still approved, and revision 3
renders its own artifact through the v2 default template. Every screen above was
driven through Chap rather than curl.
