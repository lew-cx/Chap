# LewLM gaps

What LewLM needs so Chap can stay thin.

Chap's premise is that a full-featured chat and operations GUI needs almost no
application code when LewLM does the work. This document tracks where that
premise breaks — where Chap has to write code, estimate a number, or hide a
feature because the contract does not reach far enough.

Each open entry states what Chap needs, what is missing (with the LewLM file), a
proposed shape, and **the cost of the workaround**, because the cost is the
argument. Every entry has a probe in `npm run proof` that flips from `gap` to
`FIXD` when LewLM gains the capability, which is how we learn a workaround can be
deleted.

Verified against LewLM `0.4.1a0` on 2026-07-28.

```
  19 passed · 0 failed · 0 gaps confirmed · 11 gaps fixed upstream
```

**Three gaps remain**, all P2. Two need a subsystem rather than a field; the
third is a correctness bug in `models/scan`. Every other entry this document has
ever carried is closed. See **Closed** for what came out of Chap as each was
fixed — that list is the actual argument of this project.

---

## Open

On G13 and G19 the LewLM dev's read is right: both need a subsystem rather than a
field, and neither should be designed off a one-line P2 note. G24 is different —
it is a bug, and it has already cost this host two registry entries.

### G24 · `POST /v1/models/scan` rewrites the registry and reports no change

A scan on this host returned
`{ discovered_count: 7, new_count: 0, updated_count: 0, unchanged_count: 7 }` and
yet the registry changed under it. Two GGUF models correctly became
`architecture_family: gemma4` (the routing patch working); two converted MLX
bundles under `~/.lewlm/cache/conversions/` went from `format_type: mlx` /
`conversion_status: runnable` to `huggingface` / `requires_conversion`. Both
changes persisted across a restart.

Those directories hold MLX-quantized `safetensors`, a
`lewlm.quantization_profile.json` and a `model.safetensors.index.json`, and
`/v1/lewlm/conversions/plan` still offers to convert them with
`already_runnable: false` — so discovery does not recognize its own conversion
output, and the scan overwrote manifests that something else had written
correctly.

**Proposed.** Count a manifest as `updated` when any field changes, and treat a
directory carrying a `lewlm.quantization_profile.json` as an existing conversion
artifact rather than a fresh source.

**Cost.** A scan is not safely idempotent, so the rescan button in Ops ships with
a warning instead of being routine — and after the Gemma 4 patch a rescan is
exactly what you need to pick up corrected `architecture_family` values.

**No probe.** Every other entry has one; this one cannot, because the only way to
observe the behaviour is to mutate the registry, and `npm run proof` has to stay
safe to run against a working host.

---

### G13 · `/v1/events` has no filtering, replay, or backpressure control

`src/lewlm/api/routes/events.py` takes no query parameters and ignores
`Last-Event-ID`.

**Proposed.** `?types=`, `?scope=`, `?request_id=`, `?model_id=` filters, and
`Last-Event-ID` replay from a server-side ring buffer.

**Cost, as built.** The browser receives **every `token.delta` of every request**
and filters client-side. Chap absorbs this with a 5,000-entry ring, a ~10 Hz
throttled flush and a virtualized list — none of which would be needed at this
size if the server could filter. A reconnect silently loses its window, so the
event stream renders an explicit **"reconnected — events in this window were
lost"** marker rather than presenting a continuous timeline it cannot vouch for.

This is the one open gap that costs Chap real code.

---

### G19 · No serving-profile listing

Autotune produces a `ServingProfileRecommendation` and chat consumes one via
`apply_serving_profile`, but there is no `GET /v1/serving-profiles` to list,
inspect, pin or delete stored profiles.

**Cost.** Ops shows the recommendation from the run you just triggered and the
status of the profile a generation applied (`not_found` on this host). It cannot
show what profiles exist, so the tuning loop has no memory in the UI.

---

## Closed

Every entry below was fixed in LewLM, and Chap deleted the corresponding
workaround. Recorded because the point of this document is the cost of a gap,
and these are the costs that went away.

| | What Chap deleted | What replaced it |
|---|---|---|
| **G1** no CORS | nothing yet — the proxy stayed, but for its own reasons (see below) | `LEWLM_CORS_ENABLED` + origin allowlist, default-off. Preflight allow-lists every header Chap sends. |
| **G2** tool calls never called | the ~150-line TS parser that would have been written | `tool_calls: ToolCallParseResult` on the response and final chunk. Chap parses nothing. |
| **G3** no cancellation | — | streams close deterministically on abandon; `AbortController` now actually stops the work |
| **G4** streaming loses usage | the delta-counting token proxy | `usage` on the final chunk with `measured: true/false`. Chap shows a rate only when `measured`. |
| **G5** no sampling controls | the disabled controls and the tooltip explaining why | `sampling{…}` plus `metadata.sampling` reporting `applied` / `unsupported` / `deterministic` |
| **G6** no token counting | `text.length / 4` | `POST /v1/tokenize/count`, exact counts from the model's own tokenizer |
| **G7** no client request id | the heuristic time-window matching planned for the event rail | `x-request-id` echoed when sent, minted when not, present on errors. Plus `x-lewlm-correlation-id` for spanning several calls. |
| **G8** ingest paths only | the entire M9 file-staging subsystem — never had to be written | `sources[]` byte upload with caller-owned `source_id`, and `source_results[]` with per-source `error_code` / `retryable` |
| **G9** sessions unrenamable | export → delete → re-import | `PATCH /v1/sessions/{id}` |
| **G11** bare 500s | both synthesized-envelope branches in `errors.ts` | `invalid_request` (422) with `details.fields[]`; envelope on 404/405/500 too |
| **G16** unresolvable OpenAPI | `hoistInlineDefs`, 60 lines of `$defs` hoisting and `$ref` rewriting | a 15-line `assertResolvable` guard, kept only because the failure mode is otherwise dozens of opaque "Can't resolve $ref" lines |
| **G21** inventory readiness | the N+1 capability fan-out | `capability_availability[]` on `/v1/models` |
| **G12** no error catalog | the regex over `core/errors.py` in `gen-types.mjs` | `errors[]` in the bundle: 39 codes with `http_status`, `retryable`, `description`, generated from the exception classes. `npm run proof` asserts the published status matches what the API returns. |
| **G15** streaming shapes absent from OpenAPI | the *dependency* on a coincidence | the six streaming and request schemas are named in `components/schemas` and `$ref`'d by the route bodies. Codegen no longer works only because the bundle happens to cover the gap. |
| **G17** unconstrained `role` | — | `Literal["system","developer","user","assistant","tool"]`, with `developer`/`tool` folded onto a serializable role and the distinction kept in the text |
| **G18** enforcement not knowable up front | the shrug in the format panel | `structured_output` on the capability report, in the *same* `StructuredOutputRuntimeStatus` shape the response carries. The composer predicts, the inspector reports, and a probe asserts they agree. |
| **G20** no single-model route | client-side filtering of the inventory | `GET /v1/models/{id}` returning the manifest plus its readiness annotation |
| **G23** streaming lost `prompt_trace` | the stream-toggle-off coupling in the composer | `prompt_trace` on the terminal chunk of both surfaces, gated on `include_prompt_trace` like `usage` |
| **G14** WS bypassed `RequestGuard` | — (Chap uses SSE) | enforced on the handshake, closing 1008/1013 before accept |
| **G22** tool-call format | the `system_prompt` injection | the prompt states the invocation contract, generated from the parser's own constants |
| KV-cache default | `LEWLM_KV_CACHE_QUANTIZATION_BITS=16` from the run instructions | default off; quantized KV pairs with `flash_attn` or is refused |
| `int \| None` via env | — | `""` / `null` / `none` / `~` unset any optional setting |

### Why the proxy stayed

`server/src/proxy.ts` existed because of G1. With CORS available, Chap could run
as a static bundle — but the server kept two jobs that are Chap's own, not
workarounds: it holds the API key so the browser never does, and it will host the
vector store, which LewLM deliberately does not own. It is no longer a tax.

Direct-to-LewLM now works if you want it: start LewLM with
`LEWLM_CORS_ENABLED=true` and `LEWLM_CORS_ALLOW_ORIGINS='["http://localhost:5173"]'`,
and point the client at it.

### Notes from using the fixes

- **`chat_ready` is now truthful, and Chap deleted a cache because of it.**
  It used to be a registry claim the runtime could contradict — five models
  advertised chat, two survived contact with it, and the rest died with
  `Model type gemma4 not supported`. The Gemma 4 routing patch made
  `supports_manifest` check what the installed runtime packages can actually
  build, so the two that cannot load no longer claim they can. `npm run proof`
  asserts the strong form now: **every chat-ready model streams (2/2)**, and the
  cheap `capability_availability[]` annotation agrees with the authoritative
  per-model report across all 9.
  Chap removed the localStorage cache of load failures that compensated for the
  old behaviour. Caching a runtime's limitation outlives the fix for it — those
  entries would have kept good models greyed out after the patch landed. The
  in-session demotion stays, because a load can still fail for reasons no
  inventory can predict.
- **`tool_calls: null` versus `status: "no_tool_calls"`** — "not asked" versus
  "asked and declined" — is a genuinely useful distinction and Chap relies on it.
  It has its own probe so it stays that way.
- **`metadata.sampling.runtime` reports `"unknown"`** on the llama.cpp path even
  though `metadata.model.runtime_name` says `llamacpp`. Cosmetic, but the
  sampling panel has to special-case it to avoid printing "unknown honored".
- **`tokenize/count` takes raw `text`, not messages.** Exact for a string, but it
  does not see the template, system prompt, declared tools or citation context,
  so the composer meter is a floor for the request rather than its total. Chap
  labels it `N tok +` for that reason.
- **Structured output enforces at decode time on llama.cpp.** The plan assumed
  every local model would fall back to `prompt_guided`; the GGUF path returns
  `enforcement: decode_time`, `decoder_enforced: true`, `fallback_used: false`,
  `validator: full_json_schema`, `state: valid`. The fallback readout in the
  inspector is still the right thing to build — it is the MLX path that will
  exercise it — but the stronger guarantee is real and available today.
- **Citation context resolves without any retrieval store.** A single pasted
  chunk with a caller-owned `chunk_id` comes back as a resolved
  `GeneratedCitationReference` pointing at that id. This is what makes M9 a
  storage problem rather than a grounding problem.
- **`metadata.components[]` is populated for documents but empty for chat.**
  Provenance is exactly what a test bench wants on a generation too — which
  tokenizer, which template — so the Ops screen will show it where it exists.
