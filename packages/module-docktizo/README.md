# module-docktizo: the DocKtizo companion

> **What is DocKtizo?** A separate, experimental project by the same author: a
> schema-driven document-generation service that turns source material and
> business rules into validated, reviewable documents (status reports, memos,
> proposals), using LewLM for model execution, retrieval and rendering. It lives at
> [github.com/lew-cx/DocKtizo](https://github.com/lew-cx/DocKtizo), is not
> finished, and may never be.
>
> **Why is it in Chap?** Chap is a test bench for LewLM first. It is also a
> convenient place to exercise *products built on LewLM*, and this package is
> the worked example of one. Chap calls these packages **companions**.
>
> **Do I need it?** No. It is off by default, and nothing in Chap (build,
> typecheck, dev server, `npm run proof`, `npm run gen:gaps`) needs DocKtizo
> installed or running. If you are here to see how a LewLM client works, you can
> skip this package entirely.

## Turning it on

Run DocKtizo's API and worker (see its README), then in Chap's `.env`:

```bash
CHAP_COMPANIONS=docktizo
DOCKTIZO_BASE_URL=http://127.0.0.1:8090
DOCKTIZO_TOKEN=<at least 32 characters, no whitespace>
# DOCKTIZO_WORKSPACE_ID=   only if the token grants more than one workspace
```

Restart `npm run dev`. A **DocKtizo** entry appears in the nav. If DocKtizo is
unreachable or misconfigured, the screen shows DocKtizo's own readiness message
rather than five tabs that fail on click. Settings → modules lists the env keys
it reads.

```bash
npm run proof:docktizo                        # headless proof against DocKtizo directly
npm run gen:gaps                              # now includes this proof as well as LewLM's
npm run gen:types -- --target docktizo        # refresh src/generated from DocKtizo's contract
```

`gen:types --target docktizo` reads `../DocKtizo` (or `$DOCKTIZO_HOME`), then
falls back to the vendored `vendor/docktizo-*.json`. The generated output is
committed, so nobody else needs a DocKtizo checkout to build Chap.

## What it shows

One top-level screen with five tabs, in lifecycle order: add sources, choose a
document type, generate, watch the run, then review, revise or migrate the
document it produced.

DocKtizo's own pipeline ends at `awaiting_review`. The document tab opens on
the durable document the run produced, which has a head revision, a review state
and a version history, rather than on the finished run. It offers what DocKtizo
offers against that document:

- **Review.** Approve, reject, or request changes, with the decision history
  above the buttons. The buttons stay live in every state. DocKtizo owns the
  transition table and answers an illegal decision with
  `invalid_approval_transition`, which is shown as it arrived. Greying them out
  would mean restating that table in TypeScript, and it would drift.
- **Revise.** A targeted revision names the fields to redo and gives the workflow
  instructions. A manual override supplies the values outright and runs no model.
  Both create new immutable revisions and never rewrite the one above.
- **Migrate.** A `status_report.v1` document stays on `status_report.v1` until
  someone asks to move it. Nothing resolves to "the latest". Asking starts with a
  preview: DocKtizo runs the registered mapping, validates the candidate under the
  target version's complete rules, writes nothing, and reports every consequence
  as a coded notice. The notices that must be acknowledged are checkboxes, taken
  from DocKtizo's `required_acknowledgements` list rather than inferred by Chap.

```
  policy     status_report.v1-to-v2.1.0     loses content  no
  template   workflow_default               candidate      invalid

  status_report.v2 would reject this document: schema_too_short

  warning  overall_status  v1 records no headline judgement, so overall_status  [x]
                           was derived from the migrated milestones and risks
  info     template_id     v1 templates are not compatible with v2              —
```

## What it cost

```
                       integration     ui      budgets
    module-docktizo            288    1221     340 / 1400
```

The integration half is about the same size as `module-collections`. The UI is
six times larger because it reaches into review, revision and migration. Every
gap found against DocKtizo, with what each one cost and how it closed, is in
[GAPS.md](GAPS.md).

## Removing it

Delete this directory, `vendor/docktizo-*.json`, the `docktizo` entries in
`server/src/modules.ts` and `web/src/modules.ts`, the `proof:docktizo` script in
the root `package.json`, and the DocKtizo section of `scripts/gen-types.mjs`.
Then run `npm install`. `npm run module:check` confirms nothing else knew it
existed.
