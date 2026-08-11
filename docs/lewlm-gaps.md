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

Verified against LewLM `0.4.1a0` on 2026-07-30.

```
  23 passed · 0 failed · 2 gaps confirmed · 15 gaps fixed upstream
```

**Two gaps remain.** G13 is a subsystem — a ring buffer with `Last-Event-ID`
semantics — and should not be designed off a P2 note. G29 is what G28 turned
into: the streamed text is now correct, but on the MLX path it is not
incremental.

G28 was fixed the day it was filed. The fix was a prompt-formatting mismatch
rather than anything in the decoder — the non-streaming path templated the
messages through the backend and the streaming path did not, so the model saw no
turn structure and continued raw text. All three entrypoints now build one
prompt for one conversation, and both MLX bundles answer "Blue" on both paths.

The three audio gaps this document opened yesterday were closed within a day of
being written, along with G24 and G19, and each one deleted code from Chap. See
**Closed** for what came out — that list is the actual argument of this project.

The second `gap` line in the proof run is G5, which is not a contract gap. The
probe reports that the runtime Chap happened to route to honors none of the
sampling controls it was sent; the contract reports that faithfully, which is the
behaviour G5 asked for.

---

## Open

### G29 · streamed text is correct but not incremental on the MLX runtime

G28's fix made the streamed answer right. It did not make it arrive in pieces.
Same model, `max_tokens: 48`, counting the `token.delta` events:

```
"Count to twenty."                 ->  13 deltas over 1.0s
"Count slowly from one to fifty."  ->   1 delta  at the end
"Write one sentence about the sea." -> 16 deltas over 0.6s
```

Deterministic and prompt-dependent: the middle row reproduces on every attempt,
on both MLX bundles, and the one delta carries the entire reply. The llama.cpp
model on this host emits one delta per token for all three. So this is the MLX
path, and it is not about length — the collapsed reply is the *longest* of the
three.

The text is correct, which is why G28's probe passes and this needed its own.
`stream: true` is being honoured as a transport and not as a behaviour:
time-to-first-token equals time-to-last-token.

**Proposed.** Find what withholds the text — most likely a streaming detokenizer
holding an unflushed segment until a boundary that this output never produces
(the collapsed reply is `"One...\n\ntwo...\n\nthree..."`, newline-separated with
no leading-space word boundaries, where the two that stream fine are
space-separated). If that is it, the flush condition needs a length or
end-of-generation escape rather than a boundary it may never see.

**Cost.** Three things Chap builds on incremental delivery degrade to nothing on
these two models, silently, because the reply is correct when it lands:

- **Spoken replies.** The composer's `speak` toggle cuts the reply into sentences
  as tokens arrive and synthesizes each one when it closes, so audio starts about
  a sentence in. With one delta the first sentence closes at the same moment as
  the last, and the feature degrades to a plain turn-late read-aloud — the exact
  latency it was built to avoid.
- **Cancellation.** Nothing to abort mid-stream; the stream is over before the
  first event. The abort probe was keyed to the third text delta and reported
  cancellation broken when cancellation was fine — the probe now aborts on the
  first event of any kind, which is what it always meant to test.
- **Token rate.** `usage.measured` still reports, but a rate computed over a
  single delta describes the transport, not the decode.

**Also seen once, not reproduced.** During one full `npm run proof` the server
aborted the whole process from llama.cpp's sampler:

```
llama-sampler.cpp:850: GGML_ASSERT(logits != nullptr) failed
  llama_sampler_sample  <-  from a streaming generator
```

Repeated streaming on the llama.cpp model, and MLX/llama.cpp interleaved, did not
reproduce it; a later identical proof run left the server healthy. Recorded
because a `GGML_ASSERT` takes the process down rather than failing a request, so
it is worth knowing about even unreproduced — but it is not a filed gap on this
evidence.

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

It is now the only gap left, and the only one that still costs Chap real code.

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
| **G25** audio capability per runtime | the model select on both audio lab surfaces and in the speech drawer, the two `ModelPin` controls behind them, and the candidate-probing loops in `npm run proof` | `audio_roles` on the manifest, inferred from the identifiers that already decide the audio modality. `capability_availability[]` names one model per audio capability, so `useCapability` picks it. A bundle that names no side still claims both, so the change can only narrow a claim that was wrong. |
| **G26** transcription multipart body absent | the hand-written field names — and, before that, a `payload_json` body this route never read | `AudioTranscriptionMultipartRequest` as a named component via `openapi_extra`. `file`, `model`, `language` and `prompt` are generated. |
| **G27** voices unlistable | the free-text voice box and the caveat under it, in the lab and the composer both | `GET /v1/audio/voices?model=` returning `AudioVoiceInventory`: 54 voices here, each naming its file and whether it came from the bundle or the backend cache. `enumerable` says whether LewLM could enumerate at all, so the picker degrades to free entry honestly rather than by guess. |
| **G24** scan rewrote silently | the warning on the Ops rescan button, and the habit of copying `metadata.sqlite3` first | the whole manifest is compared minus discovery timestamps, so a rewritten field reports `updated`; a directory carrying `lewlm.quantization_profile.json` is recognized as LewLM's own conversion output. The two cache bundles came back `mlx` / runnable, and this host went from 2 chat-ready models to 4. |
| **G28** streaming changed the answer | the composer's default-model choice was meeting a broken model first; nothing to delete, because the workaround would have been to hide two of four chat-ready models | one prompt for one conversation across all three MLX entrypoints. The streaming path decoded the untemplated blob verbatim while the batch path templated it internally, so the model saw no turn structure and continued raw text; both now render the real message list through the backend's own chat template. Superseded by G29, which is the same path delivering correct text all at once. |
| **G19** no serving-profile listing | the "recommendation from the run you just triggered" framing in Ops | `GET /v1/serving-profiles` with `model` / `capability` / `limit`. Listing only — pin and delete were left as a real design decision rather than guessed at. |
| Kokoro-shaped bundles undiscoverable | copying `kokoro-v1_0.safetensors` to `weights.safetensors` in the models directory | published-bundle discovery: `config.json` + model-named weights + no tokenizer or processor is MLX/runnable. The bundle is used as published. |
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
