# Chap UI validation

LewLM's lanes work (`windows-linux-lanes`) left one item to Chap: the UI
checklist in LewLM's `docs/guides/chap-validation.md`, to be filled in Chap's
repository and "never silently marked complete". This is that record.

Every row comes from `scripts/ui-checklist.mjs`, which drives Chap in a real
browser and writes what it saw. Nothing here is filled in by hand.

## How it was run

| | Fixture | Real engine |
| --- | --- | --- |
| LewLM | `0.4.2`, branch `windows-linux-lanes` at `86713e1`, plus the uncommitted G40 follow-up (re-run after it) | `86713e1`, served natively on Windows |
| Backend | `scripts/lewlm-fixture.py --fallback`: LewLM's fake engine twice (`fixture`, `backup`), an `explicit_alias` fallback from the first to the second, CORS for `http://localhost:5173`, and a control port | llama.cpp CPU (the prebuilt Windows wheel), Gemma 4 E2B Q8_K_P, CORS for `http://127.0.0.1:8788` |
| Chap | `npm run dev` (Vite on 5173 → chap-server → LewLM) | `NODE_ENV=production npm start` (chap-server serves the build) |
| Browser / OS | Chromium 151 (Playwright, headless) on Windows 11 x64 | the same |
| Recorded | 2026-09-26, twice in a row with the same result | 2026-09-26 |

```bash
# fixture: stop, kill and restart an engine from outside
../LewLM/.venv/Scripts/python.exe scripts/lewlm-fixture.py --fallback --port 8081
LEWLM_BASE_URL=http://127.0.0.1:8081 npm run dev
npm run ui:checklist

# real engine: no control port, so the engine-down items are pending
npm run ui:checklist -- --chap http://127.0.0.1:8788 --control http://127.0.0.1:9 \
  --lewlm http://127.0.0.1:8082 --model gemma-4-e2b-hauhau-agg-q8-k-p-a2f0eceed667
```

The harness exists because LewLM's `python -m lewlm.testing.fake_backend` has no
way to reach its engine from outside the process. Four of the thirteen items
need an engine stopped, killed or restarted, so without it they could only be
`pending`.

The real engine is native rather than the `lewlm:cuda` container, which was
still running an image built before `86713e1`. The 2026-09-25 run against that
container (CUDA, pre-fix LewLM) matched this one on every item it could reach,
except the items those fixes changed.

## Results

| # | Item | Fixture | Real engine |
| --- | --- | --- | --- |
| 1 | Model picker | passed | passed |
| 2 | Capability-driven controls | passed | passed |
| 3 | First-token rendering | passed | passed |
| 4 | Stop button | passed | passed |
| 5 | Tool deltas and results | passed | passed |
| 6 | JSON display | passed | passed |
| 7 | Usage | passed | passed |
| 8 | Engine restart | passed | pending |
| 9 | Interrupted stream | passed | pending |
| 10 | Fallback explanation | passed | pending |
| 11 | Identity headers | passed | passed |
| 12 | Browser origin | passed | passed |
| 13 | Events reconnect | passed | pending |

`pending` on the real engine means the item needs the engine stopped, killed or
restarted, which only the harness can do. No item passes because of a Chap
workaround: the seven LewLM gaps the first run found (G34–G40) closed upstream,
Chap deleted what it had written around them, and this is the run after that.
See [lewlm-gaps.md](lewlm-gaps.md).

## What each result rests on

1. **Model picker.** Each model is labelled `profile@endpoint`, plus `warm` when
   `runtime.startup` says so. With the backup engine stopped and rescanned
   (backup is the model no fallback alias covers), it stays listed as
   `— engine stale`, is disabled, and is titled with LewLM's reason, which now
   names the engine and its error. The real host has no unready models to show.
2. **Capability-driven controls.** Before sending, the format drawer shows the
   predicted `structured_output` enforcement (`decode_time` on both backends),
   and the tools drawer shows LewLM's `tool_calling` prediction: `native` on the
   fixture, `prompt_guided` on packaged Gemma. A model predicted `none` is
   flagged and sent no tools.
3. **First-token rendering.** On the fixture, the visible reply grew 48 → 110 →
   173 → 236 characters across four samples 350 ms apart; natively, 7 → 46 → 84 →
   117. `readSSE` drops keep-alive comments and role-only chunks before they
   reach the transcript.
4. **Stop button.** The cancel POST names the stream's own `x-request-id`. The
   run ends `finish_reason: cancelled`, the transcript says "stopped", the
   delivered text stays, and Send comes back after `[DONE]`.
5. **Tool deltas and results.** LewLM's parser (`lewlm_strict_tool_parser`)
   drove the tool UI on both backends, including the fixture's native delta
   stream. A result typed into the inspector goes back as an assistant turn
   carrying `tool_calls[call_fixture_1]` and a `tool` message with
   `tool_call_id: call_fixture_1` (`call_1` natively), and the model continues
   from it.
6. **JSON display.** `parsed_output` is rendered when `validation.state` is
   `valid`; otherwise the panel shows `validation.message` and points at the raw
   text. Neither backend produced an invalid reply, so that branch wasn't
   reached.
7. **Usage.** Read from the terminal chunk only. The token count is labelled
   "(estimated)" exactly when `measured` is false, and the cached stat appears
   only when `cached_tokens` does (8 on the fixture; absent on llama.cpp CPU).
   Both were checked against a direct request to the same runtime.
8. **Engine restart.** With the engine stopped, the turn fails with a 503 naming
   `engine endpoint: fixture`, and the model stays listed. LewLM marks the
   engine `stale` on that refusal, so the picker notice and the Ops overview show
   LewLM's own state within the same poll. After restart plus "rescan engines"
   on the Overview, the next turn answers and the notice clears, with no reload.
9. **Interrupted stream.** The engine was killed mid-reply. The partial text
   stays, the error message is shown, and "restore prompt to retry" is offered.
   Nothing was sent automatically in the 2.5 s after.
10. **Fallback explanation.** With its engine down, the primary model is still
    offered, as "engine stale, answered by fallback", because availability names
    `fallback_model_id`. The turn is answered with "answered by fixture-backup…
    @backup, not the fixture-chat… you asked for:" followed by LewLM's
    `fallback_reason`.
11. **Identity headers.** Two turns sent `x-lewlm-application-id: chap`, two
    different request ids, and one correlation id for the whole conversation.
    The metadata echo matches both, and the run readout shows it.
12. **Browser origin.** From Chap's own origin, a preflighted fetch straight to
    LewLM succeeded, `x-request-id` was readable, and a `Last-Event-ID` resume
    passed its preflight. A foreign origin gets no allow-origin. Chap itself goes
    through its same-origin proxy and resumes with `?after=`, which needs no
    preflight at all.
13. **Events reconnect.** The explorer subscribes with
    `exclude_types=token.delta`. A filter change reopens with `?after=<cursor>`,
    and the `lost: 0` marker is drawn as an ordinary row. A LewLM restart drops
    the stream; Chap reconnects with its cursor, and the `lost: null` marker is
    drawn as "unknown events lost — server restarted".

## What the checklist found

The first run, on 2026-09-25, turned up the seven LewLM gaps above and these
Chap bugs, all fixed:

- **Tool results couldn't be sent.** A tool-call turn was a dead end, because the
  chat only ever sent user and assistant text.
- **"Stopped" was reported as complete.** A cancelled run showed `complete: yes`.
  An in-band failure with nothing delivered showed "partial output".
- **Correlation id was per turn, not per conversation.** A "new chat" control
  now starts a fresh one.
- **Unmeasured usage was unlabelled**, and `cached` showed `—` when the field
  was absent, which reads like zero.
- **Engine and warmth states weren't shown.** The picker didn't block
  `engine_state: failed`, nothing showed which models were warm, and a 503's
  endpoint wasn't displayed.
- **Events wouldn't reconnect under `npm run dev`.** Vite's proxy didn't pass on
  an upstream drop. Production was unaffected.
- **Ops → Runtime showed `build —` and `platform [object Object]`.** The tab now
  also shows what this host's install can run: install profiles, the llama.cpp
  build with `missing_cpu_features`, and the container flavour.
