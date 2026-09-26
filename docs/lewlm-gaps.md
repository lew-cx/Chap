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

Verified against LewLM `0.4.2` (branch `windows-linux-lanes` at `86713e1`, plus
the uncommitted G40 follow-up in its working tree) on 2026-09-26, on Windows 11,
using `scripts/lewlm-fixture.py` — LewLM's fake backend with two engines, a
fallback alias and a control port — and against a native Windows LewLM serving
Gemma 4 E2B on llama.cpp CPU:

```
  fixture          21 passed · 0 failed · 1 gaps confirmed · 28 gaps fixed upstream
  native Windows   20 passed · 0 failed · 3 gaps confirmed · 23 gaps fixed upstream
```

On the fixture, the one `gap` line is G30, which a bridge cannot exercise (see
below). The native line predates the G40 follow-up and has no harness, so the
three engine-down probes skip, and G1/G34/G39 read *not observable*: CORS was
allowed only for Chap's production origin, and packaged llama.cpp streams no
native tool deltas.

G34–G40 were opened on 2026-09-25 by working through LewLM's own Chap UI
checklist, and closed upstream the next day — G40 in two steps, the second for
Windows. Chap deleted the
workarounds the same day. What each cost and what replaced it is in the Closed
table. The checklist record is [chap-validation.md](chap-validation.md).

The Settings → Gaps screen is generated from the proofs by `npm run gen:gaps`,
so it cannot claim a gap the proof does not confirm or miss one it does. It used
to be a hand-kept array and had drifted from both this document and the proof.

**It has not been regenerated since G33.** `gen:gaps` runs every proof,
DocKtizo's included, and DocKtizo was not running on the Windows host; it
refuses rather than publish a half-run, as it should. Run it with DocKtizo up,
and with `LEWLM_BASE_URL`/`LEWLM_FIXTURE_CONTROL` pointing at the fixture
harness, to bring the screen level with this document.

**The score line is host-dependent, and the gap count is not.** On the earlier
2026-08-24 run the same proof on Windows reported `20 passed · 1 failed`, because
LewLM serves audio only through `mlx_audio` and MLX is Apple silicon only, so the
speech and transcription probes had no model to run against. Contract parity was
identical. `npm run gen:gaps` is only meaningful with every upstream running; it
refuses rather than writing gaps an incomplete host invented. See
[cross-platform.md](cross-platform.md).

The 2026-09-22 update had closed the three integration gaps open before it:

- G13: event frames now carry cursors, reconnects replay through
  `Last-Event-ID`, and `events.resumed` reports exact or unknowable loss.
- G32: both response transports now publish `finish_reason`.
- G33: `GET /v1/audio/voices` publishes formats, completeness, and the model's
  default encoding.

Chap deleted its synthetic reconnect-loss marker, its invented response outcome,
and its hard-coded audio-format list. The Settings screen is refreshed from the
same proof run.

---

## Open

No LewLM contract gap is currently confirmed. The proof's G30 line stays
visible on the fixture because a bridge cannot exercise decode-time grammar
enforcement; against a packaged llama.cpp runtime it reads fixed.

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
| **G13** events could not resume | the synthetic “everything since disconnect was lost” marker | cursor-bearing frames, replay via `Last-Event-ID`, `exclude_types`, and an `events.resumed` marker whose `lost` count distinguishes continuity, buffer loss, and restart |
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
| **G25** audio capability per runtime | the model select on both audio lab surfaces and in the speech drawer, the two `ModelPin` controls behind them, and the candidate-probing loops in `npm run proof` | `audio_roles` on the manifest, inferred from the identifiers that already decide the audio modality. `capability_availability[]` names one model per audio capability, so `useCapability` picks it. A bundle that names no side still claims both, so the change can only narrow a claim that was wrong. |
| **G26** transcription multipart body absent | the hand-written field names — and, before that, a `payload_json` body this route never read | `AudioTranscriptionMultipartRequest` as a named component via `openapi_extra`. `file`, `model`, `language` and `prompt` are generated. |
| **G27** voices unlistable | the free-text voice box and the caveat under it, in the lab and the composer both | `GET /v1/audio/voices?model=` returning `AudioVoiceInventory`: 54 voices here, each naming its file and whether it came from the bundle or the backend cache. `enumerable` says whether LewLM could enumerate at all, so the picker degrades to free entry honestly rather than by guess. |
| **G24** scan rewrote silently | the warning on the Ops rescan button, and the habit of copying `metadata.sqlite3` first | the whole manifest is compared minus discovery timestamps, so a rewritten field reports `updated`; a directory carrying `lewlm.quantization_profile.json` is recognized as LewLM's own conversion output. The two cache bundles came back `mlx` / runnable, and this host went from 2 chat-ready models to 4. |
| **G28** streaming changed the answer | the composer's default-model choice was meeting a broken model first; nothing to delete, because the workaround would have been to hide two of four chat-ready models | one prompt for one conversation across all three MLX entrypoints. The streaming path decoded the untemplated blob verbatim while the batch path templated it internally, so the model saw no turn structure and continued raw text; both now render the real message list through the backend's own chat template. Superseded by G29, which is the same path delivering correct text all at once. |
| **G29** streamed text was correct but arrived in one delta | nothing — the workaround would have been to stop claiming the composer's spoken replies start early, and the feature was left in place with the caveat written down instead | the MLX path delivers incrementally, so a reply is cut into sentences as it arrives and the first one is synthesized about a sentence in rather than a turn late. Chap deleted no code to collect this, which is the point: the feature was built against the contract and the contract caught up. |
| **G31** a model with no published context length was capped at 4,096 tokens | the bisection, and `DOCKTIZO_LEWLM_STRUCTURED_MAX_OUTPUT_TOKENS=768` in the bench configuration — a value arrived at by halving until requests stopped being refused | `registry/gguf_header.py` reads `<arch>.context_length` from the GGUF header, so a rescan moved both bundles from `null` to `131072` and stamps `context_length_source`. Routing scores against `runtime.serving_context_tokens()` — what the runtime will actually reserve — rather than the advertised window, and the ceiling for a model that is still unmeasured is `LEWLM_UNKNOWN_CONTEXT_TOKEN_LIMIT`, named in the refusal. The request that was `400 routing_error` answers in 3.2s. |
| **G30** a caller-supplied `maxLength` killed the server | the probe's "did LewLM survive" check, which is now an assertion that the request was *answered*, and the restart between proof runs | LewLM keeps the bounds it compiles into a grammar inside llama.cpp's parser ceiling, parses every finished grammar with llama.cpp's own parser before it can reach a decoder, and names what it left out in `structured_output.grammar_relaxations`. A contract the decoder cannot be constrained to at all comes back as `invalid_request` naming the offending rule. |
| **G19** no serving-profile listing | the "recommendation from the run you just triggered" framing in Ops | `GET /v1/serving-profiles` with `model` / `capability` / `limit`. Listing only — pin and delete were left as a real design decision rather than guessed at. |
| **G32** responses had no finish reason | the normalized `null` outcome | `finish_reason` on sync and streamed response terminal payloads, rendered beside every run |
| **G33** speech formats unpublished | the four-value `FORMATS` constant | per-model `formats[]`, `formats_exhaustive`, and `default_format` on the voice inventory |
| **G34** streamed native tool calls unparsed | `ToolDeltaAccumulator` in `stream.ts` (~50 lines of fragment reassembly and JSON parsing, which nothing validated), its unit test, and the inspector notice that owned up to it | the terminal chunk carries LewLM's parsed, schema-validated `tool_calls` on every stream. `stream.ts` passes the verdict through and reassembles nothing: 758 → 711 integration lines. |
| **G35** tool calling unadvertised | nothing to delete — the missing piece was the gate itself | `tool_calling: { support: native \| prompt_guided \| none, parallel, reason }` on the capability report. The tools drawer shows the prediction, and a model predicted `none` is sent no tools. |
| **G36** tool results could not name their call | `historyTurn`'s rewrite of an assistant turn into `{"tool_calls": [...]}` text, and pairing results to calls by order | `tool_calls` on assistant messages and `tool_call_id` on tool messages. A continuation sends the calls as calls, LewLM's `remaining_text` as the text, and each result names its `call_id`. |
| **G37** engine state lagged a refusal | `web/src/store/engines.ts` — the tab's memory of refusals and the logic for forgetting them — plus the "failing · LewLM says advertised" readouts | a refusal marks the endpoint down at once, with the error; Chap re-reads health and the inventory immediately and shows LewLM's state as it is. |
| **G38** a fallback-served model said it could not chat | the rule that hid such a model from the picker | `fallback_model_id` on availability and a reason naming the down engine. The picker offers the model as "engine stale, answered by fallback". |
| **G39** `Last-Event-ID` failed the preflight | nothing — `?after=` stays, because a query needs no preflight at all | `last-event-id` in the default CORS allow-list; a direct browser resume with the header passes. |
| **G40** a stream to a down engine opened before it failed | nothing — Chap handled both shapes; the "nothing delivered" label stays for an engine that accepts a request and fails before its first token | headers are held until the engine has *accepted* the request (`RuntimeStreamEvent(opened=True)`, sent by the bridge when the engine's response headers arrive), its first item, or its failure, bounded at 30 s. The first fix held them for a fixed second, which raced the connect on Windows: a refused loopback connect there takes ~2 s, so the first streamed request to a stopped engine still got `200` and an in-band error. Now both surfaces answer `503` after 2.05 s, and a healthy stream's first byte is unchanged (20 ms). Runtimes with no connection phase keep the one-second window. |
| Kokoro-shaped bundles undiscoverable | copying `kokoro-v1_0.safetensors` to `weights.safetensors` in the models directory | published-bundle discovery: `config.json` + model-named weights + no tokenizer or processor is MLX/runnable. The bundle is used as published. |
| KV-cache default | `LEWLM_KV_CACHE_QUANTIZATION_BITS=16` from the run instructions | default off; quantized KV pairs with `flash_attn` or is refused |
| `int \| None` via env | — | `""` / `null` / `none` / `~` unset any optional setting |

### What G30 actually was

Worth writing down, because this document proposed two fixes and only one of
them was right.

The crash was real and as described: `{"summary": {"type": "string", "maxLength":
2000}}` compiled to a grammar whose bounded string is one nested optional rule
per permitted character, llama.cpp's parser refused it, and the process died. The
death is downstream of the refusal — `llama_sampler_init_grammar` returns a
*null sampler*, the bindings add it to the sampling chain anyway, and the next
sample dereferences it. Nothing throws, so nothing can be caught; the fix has to
be that the grammar never gets there.

**The repetition operator does not help.** This document proposed compiling
`maxLength` to `char{0,n}` instead of nested optionals, on the reasoning that it
"removes the complexity entirely". It does not: llama.cpp expands `{m,n}` into
the same per-item rules internally, and measured against the packaged build,
`char{0,2000}` is refused with the same message as the nested form. The operator
buys smaller grammar *text*, not a smaller grammar. Measured ceiling on this
host: a bounded JSON string parses at 1000 repetitions and is refused by 1020,
whichever spelling is used, and the limit is per rule rather than per grammar —
seven fields at 1000 pass, one field at 2000 does not.

So the bound cannot be enforced at decode time at generator-scale sizes at all,
by any spelling. LewLM now compiles bounds up to 512, drops larger ones from the
grammar, and reports each one in `structured_output.grammar_relaxations` as
`properties.summary.maxLength (5000)`. The structure is still decode-enforced;
the dropped bound is still enforced by `structured_output.validation` after
generation. Nothing is silently unenforced.

The second proposal was right and is what makes the class of bug go away: every
grammar is now parsed by llama.cpp's own parser, and freed again, before it can
reach a decoder. A refusal is returned as `invalid_request` naming the offending
rule instead of taken out on the process — including for a grammar a caller
writes by hand, which reached the same parser and was never checked either.

Verified against a local LewLM on 2026-08-11: `maxLength: 2000` answers 200 with
`decoder_enforced: true` and one relaxation; `root ::= item{0,100000}` answers
422 naming `root`; `maxLength: 200` answers 200 with no relaxation and
`validation: valid`; `/v1/health` is 200 after each.

The shape of DocKtizo's `StatusReportSpec` — seven fields at `maxLength: 5000` —
was checked directly against the packaged llama.cpp and is accepted now where it
was refused before. That removes the blocker; it does not prove the integration
produces a document, so `packages/module-docktizo` and `docs/docktizo-gaps.md`
want a re-run rather than an edit.

### Why the proxy stayed

`server/src/proxy.ts` existed because of G1. With CORS available, Chap could run
as a static bundle — but the server kept two jobs that are Chap's own, not
workarounds: it holds the API key so the browser never does, and it will host the
vector store, which LewLM deliberately does not own. It is no longer a tax.

Direct-to-LewLM now works if you want it: start LewLM with
`LEWLM_CORS_ENABLED=true` and `LEWLM_CORS_ALLOW_ORIGINS='["http://localhost:5173"]'`,
and point the client at it.

### Bringing the audio surfaces up

Recorded because none of it is in the contract, and because what remains is host
setup rather than anything Chap or LewLM does wrong.

The one obstacle that *was* LewLM's — discovery not recognizing a bundle whose
weights are not named `weights.safetensors` or `weights.npz`, which made Kokoro
invisible as published — is fixed. Both bundles are now used exactly as
downloaded.
- **The MLX Whisper repo is not sufficient on its own.** `mlx-community/`
  `whisper-large-v3-mlx` ships only `config.json` and `weights.npz`, but
  `mlx_audio` builds a `WhisperProcessor` from the model directory and fails
  decoding without it — the tokenizer files have to be copied in from
  `openai/whisper-large-v3` alongside the MLX weights.
- **Kokoro needs espeak-ng, and fails late without it.** Its G2P (`misaki`) uses
  espeak to phonemize out-of-dictionary words. `KokoroPipeline` catches the
  missing fallback and only logs a warning, so the model loads clean and then
  dies inside generation on the first unusual word — a proper name is enough. The
  failure surfaces as `not_implemented` / "could not find the expected
  synthesized audio artifact", which points at the artifact rather than the
  cause. `misaki.espeak` looks for the library only at a hard-coded Homebrew
  path, so on a host without it the `espeakng_loader` wheel plus a `.pth` in
  LewLM's venv is what makes it resolve.

### Notes from using the fixes

- **`chat_ready` is now truthful, and Chap deleted a cache because of it.**
  It used to be a registry claim the runtime could contradict — five models
  advertised chat, two survived contact with it, and the rest died with
  `Model type gemma4 not supported`. The Gemma 4 routing patch made
  `supports_manifest` check what the installed runtime packages can actually
  build, so the two that cannot load no longer claim they can. `npm run proof`
  asserts the strong form now: **every chat-ready model streams (2/2)**, and the
  cheap `capability_availability[]` annotation agrees with the authoritative
  per-model report across all 11.
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
