/**
 * The chat surface.
 *
 * Everything below the composer is state and layout; the contract work happens
 * in two places only — `buildRequest` turns this screen's state into a payload,
 * and `chat`/`respond` turn either LewLM surface into one event sequence. That
 * is why the streaming toggle and the surface toggle each cost one line here
 * rather than a second code path.
 *
 * Skin-blind: this file must not mention `data-skin` or import useSkin.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  buildMultipart,
  chat,
  isAbort,
  LewLMApiError,
  respond,
  type ChatCompletionRequest,
  type CompletionUsage,
  type ExecutionMetadata,
  type ReasoningOutput,
  type ReasoningVisibility,
  type ResponseCreateRequest,
  type SamplingControlReport,
  type ServingProfileApplication,
  type RequestCancellationRecord,
} from '@chap/lewlm';

import { Labelled, Stat } from '../components/Field.tsx';
import { FilePicker } from '../components/FilePicker.tsx';
import { Markdown } from '../components/Markdown.tsx';
import { lewlm } from '../lib/client.ts';
import { useModels, type ModelOption } from '../lib/useModels.ts';
import { refreshPolled } from '../lib/usePolled.ts';
import { useDictation } from '../lib/useDictation.ts';
import { useSpeech } from '../lib/useSpeech.ts';
import { useStructuredSupport, useToolCallingSupport } from '../lib/useStructuredSupport.ts';
import { useTokenCount } from '../lib/useTokenCount.ts';
import { useGrounding } from '../store/grounding.ts';
import { ContextPanel } from './ContextPanel.tsx';
import { DictationPanel } from './DictationPanel.tsx';
import { FormatPanel } from './FormatPanel.tsx';
import { Message } from './Message.tsx';
import { RunInspectors, type RunResult, type ToolResult } from './RunInspectors.tsx';
import { SessionsPanel } from './SessionsPanel.tsx';
import { SamplingPanel } from './SamplingPanel.tsx';
import { SpeechPanel } from './SpeechPanel.tsx';
import { ToolsPanel } from './ToolsPanel.tsx';
import {
  buildRequest,
  INITIAL_FORMAT,
  MAX_TOKENS,
  parseFormat,
  parseTools,
  TEMPERATURE,
  type Attachment,
  type ComposerState,
  type Turn as HistoryTurn,
} from './request.ts';

const VISIBILITIES: ReasoningVisibility[] = ['hidden', 'summarized', 'raw_model_emitted'];
type Drawer =
  | 'sampling'
  | 'context'
  | 'format'
  | 'system'
  | 'tools'
  | 'sessions'
  | 'speech'
  | 'dictation'
  | null;

interface Turn {
  role: 'user' | 'assistant' | 'tool';
  text: string;
  /** Attachment filenames, shown on the user turn that carried them. */
  files: string[];
  reasoning: string | null;
  metadata: ExecutionMetadata | null;
  usage: CompletionUsage | null;
  servingProfile: ServingProfileApplication | null;
  result: RunResult | null;
  /** The ids this turn's request was sent under, to hold LewLM's echo against. */
  identity: { requestId: string; correlationId: string } | null;
  /** On a `tool` turn: the call it answers. */
  toolCallId: string | null;
}

interface RetryDraft {
  text: string;
  attachments: Attachment[];
  /** How many turns the failed exchange appended, all of which a retry removes. */
  appended: number;
}

const EMPTY_TURN: Omit<Turn, 'role' | 'text'> = {
  files: [],
  reasoning: null,
  metadata: null,
  usage: null,
  servingProfile: null,
  result: null,
  identity: null,
  toolCallId: null,
};

/**
 * A turn as the model should see it again. A turn that called tools goes back
 * with its calls as calls, and with LewLM's `remaining_text` — the reply outside
 * the call — as its text, so a sync reply's `{"tool_calls": ...}` content is not
 * sent twice. A tool result names the call it answers.
 */
function historyTurn(turn: Turn): HistoryTurn {
  const parsed = turn.result?.toolCalls;
  const calls = parsed?.tool_calls ?? [];
  if (turn.role === 'assistant' && calls.length > 0) {
    return {
      role: 'assistant',
      text: parsed?.remaining_text ?? turn.text,
      toolCalls: calls.map((call) => ({
        id: call.call_id,
        type: 'function',
        function: { name: call.name, arguments: call.arguments },
      })),
    };
  }
  return { role: turn.role, text: turn.text, ...(turn.toolCallId ? { toolCallId: turn.toolCallId } : {}) };
}

/**
 * A short tag for an unusable model. LewLM's `reason` is a full sentence meant
 * for a panel, not a `<select>`; the whole sentence is the option's title.
 */
function blockedLabel(option: ModelOption): string {
  if (option.engineState === 'failed' || option.engineState === 'stale') return `engine ${option.engineState}`;
  if (!option.reason) return 'not chat-capable';
  if (option.reason.includes('requires_conversion')) return 'needs conversion';
  return 'not chat-capable';
}

/**
 * What is wrong with the chosen model's engine, if anything, in LewLM's terms.
 * `null` when there is nothing to say — a packaged runtime, or an engine LewLM
 * reports `advertised`. LewLM's reason names the engine's error and, when one
 * would answer, the fallback alias.
 */
function engineNotice(option: ModelOption): string | null {
  const engine = `${option.engineProfile ?? 'engine'}@${option.endpointId ?? '?'}`;
  if (!option.endpointId || option.engineState === 'advertised' || option.engineState === 'packaged') return null;
  return `${engine} is ${option.engineState ?? 'unknown'}${option.reason ? ` — ${option.reason}` : ''}`;
}

/** What the reasoning disclosure should say, given what LewLM returned. */
function reasoningText(reasoning: ReasoningOutput): string | null {
  if (reasoning.visibility === 'hidden') return null;
  if (reasoning.available === false) {
    return 'requested, but this runtime emitted no reasoning for the run.';
  }
  return reasoning.summary ?? reasoning.content ?? null;
}

export function ChatScreen() {
  const { models, error: modelsError, reportLoadFailure } = useModels();
  const grounding = useGrounding((state) => state.chunks);
  const groundingUsed = useGrounding((state) => state.clear);
  const [state, setState] = useState<ComposerState>({
    surface: 'chat',
    stream: true,
    model: '',
    maxTokens: String(MAX_TOKENS.fallback),
    temperature: String(TEMPERATURE.fallback),
    sampling: {},
    reasoningVisibility: 'hidden',
    applyServingProfile: true,
    includePromptTrace: false,
    systemPrompt: '',
    toolsText: '[]',
    toolChoice: 'auto',
    format: INITIAL_FORMAT,
    context: [],
    sessionId: null,
  });

  const [prompt, setPrompt] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [samplingReport, setSamplingReport] = useState<SamplingControlReport | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  // Not narrowed to `LewLMApiError`: a bug in Chap throws too, and casting one
  // to the other put a value with no `fields` into a banner that reads `fields`,
  // which took the whole app down with it.
  const [error, setError] = useState<Error | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [retryDraft, setRetryDraft] = useState<RetryDraft | null>(null);
  const abort = useRef<AbortController | null>(null);
  const activeRequestId = useRef<string | null>(null);
  /** `x-lewlm-correlation-id` for every request in this conversation. */
  const conversation = useRef(crypto.randomUUID());
  const bottom = useRef<HTMLDivElement>(null);
  /*
   * Part names must be unique within a request, and only within one. Derived
   * from `attachments.length` they were not: removing any file but the last made
   * the count stop tracking the highest suffix in use, so the next attachment
   * collided with one already staged. A counter that only ever goes up cannot.
   */
  const nextUpload = useRef(0);
  const promptTokens = useTokenCount(prompt, state.model);
  const structuredSupport = useStructuredSupport(state.model);
  const toolSupport = useToolCallingSupport(state.model);
  /** LewLM says this model cannot call tools, so none are offered to it. */
  const toolsBlocked = toolSupport?.support === 'none';
  const speech = useSpeech();

  // Leaving Chat must release an in-flight response. The visible Stop control
  // uses named cancellation so it can receive the terminal chunk; an unmount
  // has no UI left to receive one, so closing the fetch is the correct teardown.
  useEffect(() => () => abort.current?.abort(), []);

  // A transcript is appended rather than assigned: an utterance is one more
  // thing said, and clobbering a half-typed prompt would lose work the user can
  // see on screen.
  const dictation = useDictation((text) =>
    setPrompt((current) => (current.trim() ? `${current.trimEnd()} ${text}` : text)),
  );

  // Barge-in. Opening the microphone while a reply is being read aloud has to
  // silence it — the clips are already scheduled on the audio clock, and echo
  // cancellation is not the answer to a machine talking over the person.
  const listen = () => {
    speech.cancel();
    dictation.hold();
  };

  const set = <K extends keyof ComposerState>(key: K, value: ComposerState[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  const formatError = useMemo(() => parseFormat(state.format).error, [state.format]);
  const toolError = useMemo(() => parseTools(state.toolsText).error, [state.toolsText]);

  // Default to a model that can actually chat. Picking models[0] blindly
  // selects an unusable model on this host — four of nine cannot chat.
  useEffect(() => {
    if (state.model) return;
    const ready = models.find((option) => option.selectable);
    if (ready) set('model', ready.id);
  }, [models, state.model]);

  // Retrieved chunks arrive as citation context, not as text in the prompt —
  // so LewLM grounds the answer and resolves citations back to these ids.
  useEffect(() => {
    if (!grounding?.length) return;
    setState((current) => ({
      ...current,
      context: grounding.map((chunk) => ({ label: chunk.source_label, text: chunk.text })),
    }));
    setDrawer('context');
    groundingUsed();
  }, [grounding]);

  useEffect(() => {
    if (turns.length === 0) return;
    // `block: 'nearest'` keeps the scroll inside the transcript container.
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [turns]);

  /**
   * One exchange: append `next` and an assistant turn, stream the reply into it.
   *
   * `next` is either the typed prompt or the results of the tools the model just
   * called; everything after that is the same run. `draft` is what goes back to
   * the composer if the exchange never happened.
   */
  async function run(next: Turn[], sentAttachments: Attachment[], draft: string) {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    const requestId = crypto.randomUUID();
    activeRequestId.current = requestId;

    // Only completed turns are history; what is appended below is this run.
    const history = turns.map(historyTurn);
    const built = buildRequest(
      toolsBlocked ? { ...state, toolsText: '[]' } : state,
      history,
      next.map(historyTurn),
      sentAttachments,
    );
    const appended = next.length + 1;

    // One conversation is many requests — every turn, plus a synthesis per
    // spoken sentence. They share the conversation's correlation id, so LewLM's
    // event stream and audit log show one exchange rather than unrelated calls.
    const correlationId = conversation.current;
    speech.begin(correlationId);

    setError(null);
    setRetryDraft(null);
    setStreaming(true);
    setTurns((current) => [
      ...current,
      ...next,
      { ...EMPTY_TURN, role: 'assistant', text: '', identity: { requestId, correlationId } },
    ]);

    /** Mutate the assistant turn we just appended. */
    const patch = (change: Partial<Turn>) =>
      setTurns((current) =>
        current.map((turn, index) => (index === current.length - 1 ? { ...turn, ...change } : turn)),
      );

    /**
     * LewLM marks an engine down the moment it is refused, so what the picker
     * and the Overview show is already true; re-reading now means they show it
     * without waiting out a poll interval.
     */
    const engineDown = (code: string) => {
      if (code !== 'runtime_unavailable') return;
      for (const path of ['/v1/models', '/v1/health', '/v1/runtime']) refreshPolled(path);
    };

    try {
      const options = {
        signal: controller.signal,
        correlationId,
        requestId,
        ...(built.uploads.length > 0 ? { form: buildMultipart(built.uploads) } : {}),
      };
      const stream =
        built.endpoint === '/v1/responses'
          ? respond(lewlm, built.payload as ResponseCreateRequest, options)
          : chat(lewlm, built.payload as ChatCompletionRequest, options);

      let assembled = '';
      for await (const event of stream) {
        switch (event.type) {
          case 'open':
            patch({ servingProfile: event.servingProfile });
            break;
          case 'text':
            assembled += event.delta;
            patch({ text: assembled });
            // Sentences are spoken as they close, so the first one plays while
            // the rest of the reply is still being generated.
            speech.push(event.delta);
            break;
          case 'reasoning':
            // Replace, never append — LewLM sends the whole object per token.
            patch({ reasoning: reasoningText(event.reasoning) });
            break;
          case 'final': {
            patch({
              metadata: event.metadata,
              usage: event.usage,
              result: {
                finishReason: event.finishReason,
                error: event.error,
                citations: event.citations,
                structuredOutput: event.structuredOutput,
                toolCalls: event.toolCalls,
                promptTrace: event.promptTrace,
                request: built,
              },
            });
            if (event.error) {
              // Delivered text stands and nothing is replayed: the retry below is
              // offered, and only the user can choose it.
              setError(new LewLMApiError({
                code: event.error.code,
                message: event.error.message,
                status: 200,
                details: { ...event.error.details, partial_output: event.error.partial_output, in_band: true },
                requestId,
              }));
              setRetryDraft({ text: draft, attachments: sentAttachments, appended });
              engineDown(event.error.code);
            }
            setSamplingReport(event.metadata?.sampling ?? null);
            break;
          }
          case 'done':
            break;
        }
      }
      // The trailing fragment — the last sentence often has no terminator.
      speech.end();
    } catch (cause) {
      // Both paths abandon the reply, so nothing should keep reading it out.
      speech.cancel();
      if (isAbort(cause)) return;
      const failure = cause instanceof Error ? cause : new Error(String(cause));
      setError(failure);

      // Roll the whole exchange back and hand the prompt to the composer. The
      // turn never happened — leaving it in the transcript would both misreport
      // the conversation and re-send a failed prompt as history on the retry.
      //
      // A reply that streamed some text before failing is rolled back too. It is
      // a fragment of an answer the model never finished; keeping it while the
      // prompt goes back to the composer duplicates the prompt on retry and
      // presents a truncation as if it were the reply.
      setTurns((current) => (current.at(-1)?.role === 'assistant' ? current.slice(0, -appended) : current));
      if (draft) setPrompt((current) => current || draft);
      if (sentAttachments.length > 0) {
        setAttachments((current) => (current.length > 0 ? current : sentAttachments));
      }

      if (failure instanceof LewLMApiError) engineDown(failure.code);

      // `chat_ready` said yes and the runtime said no. LewLM's envelope carries
      // the architecture and the underlying cause, so demote this model with a
      // real reason rather than letting the user pick it again.
      if (failure instanceof LewLMApiError && failure.code === 'model_load_failed' && state.model) {
        const detail = failure.details as { architecture_family?: string; cause?: string };
        reportLoadFailure(
          state.model,
          detail.cause ?? `${detail.architecture_family ?? 'model'} failed to load`,
        );
        set('model', '');
      }
    } finally {
      activeRequestId.current = null;
      setStopping(false);
      setStreaming(false);
    }
  }

  async function send() {
    const text = prompt.trim();
    if ((!text && attachments.length === 0) || streaming || formatError || toolError) return;
    const sent = attachments;
    setPrompt('');
    setAttachments([]);
    await run(
      [{ ...EMPTY_TURN, role: 'user', text, files: sent.map((attachment) => attachment.file.name) }],
      sent,
      text,
    );
  }

  /** The tools the model called have answered; let it continue. */
  async function sendToolResults(results: ToolResult[]) {
    if (streaming || results.length === 0) return;
    await run(
      results.map((result) => ({ ...EMPTY_TURN, role: 'tool' as const, text: result.content, toolCallId: result.callId })),
      [],
      '',
    );
  }

  /** A new conversation: a fresh transcript under a fresh correlation id. */
  function startOver() {
    abort.current?.abort();
    conversation.current = crypto.randomUUID();
    setTurns([]);
    setError(null);
    setRetryDraft(null);
  }

  const canSend = (prompt.trim().length > 0 || attachments.length > 0) && !formatError && !toolError;
  const selected = models.find((option) => option.id === state.model);
  const selectedNotice = selected ? engineNotice(selected) : null;

  return (
    <div className="flex h-full flex-col">
      <div className="scroll-thin flex-1 overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-2">
          {turns.length === 0 && (
            <p className="micro-label flex min-h-64 items-center justify-center text-center">
              no messages — send one to watch the contract work
            </p>
          )}

          {turns.map((turn, index) => (
            <div key={index}>
              <Message
                role={turn.role}
                reasoning={turn.reasoning}
                meta={
                  turn.metadata?.timing?.total_milliseconds != null
                    ? `${turn.metadata.timing.total_milliseconds}ms`
                    : undefined
                }
                files={turn.files}
              >
                {/*
                 * Only the model's side is markdown. What the user typed is
                 * shown exactly as typed — rendering it would hide the asterisks
                 * and backticks that were actually sent to LewLM.
                 */}
                {turn.role !== 'assistant' ? (
                  turn.text
                ) : (
                  <Markdown text={turn.text || (streaming && index === turns.length - 1 ? '…' : '')} />
                )}
              </Message>

              {turn.result && (
                <RunInspectors
                  result={turn.result}
                  // Only the newest reply can be continued: answering an older
                  // call would graft a result onto a conversation that moved on.
                  onToolResults={
                    index === turns.length - 1 && !streaming ? (results) => void sendToolResults(results) : undefined
                  }
                />
              )}
              {turn.metadata && (
                <RunMetadata
                  metadata={turn.metadata}
                  usage={turn.usage}
                  servingProfile={turn.servingProfile}
                  identity={turn.identity}
                />
              )}
            </div>
          ))}

          {error && (
            <ErrorBanner
              error={error}
              onRetry={retryDraft ? () => {
                setTurns((current) => current.slice(0, -retryDraft.appended));
                // A tool continuation has no prompt to restore, and must not
                // clear one the user has started typing since.
                if (retryDraft.text) setPrompt(retryDraft.text);
                if (retryDraft.attachments.length > 0) setAttachments(retryDraft.attachments);
                setRetryDraft(null);
                setError(null);
              } : undefined}
            />
          )}

          <div ref={bottom} />
        </div>
      </div>

      <div className="hairline border-t p-3">
        <div className="mb-2 flex flex-wrap items-end gap-3">
          <Labelled label="model">
            <select
              className="field max-w-56 truncate"
              value={state.model}
              onChange={(event) => set('model', event.target.value)}
              style={modelsError ? { borderColor: 'var(--skin-danger)' } : undefined}
              // An empty picker has two very different causes. Saying which is
              // the same courtesy every other read in this app extends.
              title={
                modelsError
                  ? `the model list could not be read: ${modelsError.code} — ${modelsError.message}`
                  : undefined
              }
            >
              <option value="">
                {modelsError ? 'model list unavailable' : 'let LewLM route'}
              </option>
              {models.map((option) => (
                // Models that cannot chat stay visible but unselectable — a
                // test bench should show what exists and why it is unusable.
                // The reason is LewLM's own; Chap neither guesses nor abbreviates.
                <option
                  key={option.id}
                  value={option.id}
                  disabled={!option.selectable}
                  title={[
                    option.id,
                    option.engineProfile && option.endpointId
                      ? `${option.engineProfile}@${option.endpointId} (${option.engineState ?? 'unknown'})`
                      : null,
                    option.warmth ? option.warmth : 'not loaded',
                    option.reason,
                  ].filter(Boolean).join(' — ')}
                >
                  {option.label}
                  {option.endpointId ? ` · ${option.engineProfile ?? 'engine'}@${option.endpointId}` : ''}
                  {option.warmth ? ` · ${option.warmth}` : ''}
                  {option.selectable
                    ? option.fallbackModelId && !option.chatReady
                      ? ` — engine ${option.engineState ?? 'down'}, answered by fallback`
                      : ''
                    : ` — ${blockedLabel(option)}`}
                </option>
              ))}
            </select>
          </Labelled>

          {/*
           * Both surfaces normalize to the same event union, so this select
           * changes which endpoint is called and nothing else in the screen.
           */}
          <Labelled label="surface">
            <select
              className="field"
              value={state.surface}
              onChange={(event) => set('surface', event.target.value as ComposerState['surface'])}
            >
              <option value="chat">/v1/chat/completions</option>
              <option value="responses">/v1/responses</option>
            </select>
          </Labelled>

          <Labelled label="reasoning">
            <select
              className="field"
              value={state.reasoningVisibility}
              onChange={(event) =>
                set('reasoningVisibility', event.target.value as ReasoningVisibility)
              }
            >
              {VISIBILITIES.map((visibility) => (
                <option key={visibility} value={visibility}>
                  {visibility}
                </option>
              ))}
            </select>
          </Labelled>

          {/* The value is the text as typed; the bounds are applied by
              buildRequest on send, so the field can be emptied and retyped. */}
          <Labelled label="max tokens">
            <input
              className="field numeric w-20"
              type="number"
              min={MAX_TOKENS.min}
              max={MAX_TOKENS.max}
              placeholder={String(MAX_TOKENS.fallback)}
              value={state.maxTokens}
              onChange={(event) => set('maxTokens', event.target.value)}
            />
          </Labelled>

          <Labelled label="temperature">
            <input
              className="field numeric w-20"
              type="number"
              min={TEMPERATURE.min}
              max={TEMPERATURE.max}
              step={0.1}
              placeholder={String(TEMPERATURE.fallback)}
              value={state.temperature}
              onChange={(event) => set('temperature', event.target.value)}
            />
          </Labelled>
        </div>

        {/* The picker hides nothing it could not select; this says why the one
            already chosen may not answer, before a request is spent on it. */}
        {selectedNotice && (
          <p className="numeric mb-2 text-sm" role="status" style={{ color: 'var(--skin-warn)' }}>
            {selectedNotice}
          </p>
        )}

        <div className="mb-2 flex flex-wrap items-center gap-2">
          {turns.length > 0 && (
            <button
              type="button"
              className="chip"
              disabled={streaming}
              title="a new transcript under a new x-lewlm-correlation-id"
              onClick={startOver}
            >
              new chat
            </button>
          )}
          <Toggle
            label="stream"
            on={state.stream}
            onClick={() => set('stream', !state.stream)}
          />
          <Toggle
            label="serving profile"
            on={state.applyServingProfile}
            onClick={() => set('applyServingProfile', !state.applyServingProfile)}
          />
          {/* The trace now rides the terminal chunk, so this is independent of
              the transport — inspect the prompt of the run you actually made. */}
          <Toggle
            label="prompt trace"
            on={state.includePromptTrace}
            onClick={() => set('includePromptTrace', !state.includePromptTrace)}
          />

          {/* Speaking needs no LewLM change beyond a synthesis model existing:
              the reply is cut into sentences here and each one is synthesized as
              it closes. */}
          <Toggle
            label={speech.status.finished ? 'speak' : `speak · ${speech.status.spoken}`}
            on={speech.armed}
            flagged={speech.error != null}
            onClick={() => speech.setEnabled(!speech.enabled)}
          />

          <span className="hairline mx-1 h-4 border-l" />

          {/* Push-to-talk: held for exactly the length of the utterance, so there
              is no endpointing to get wrong. The transcript lands in the composer
              and waits — a mis-heard prompt sent automatically is worse than a
              typed one. */}
          <button
            type="button"
            className="chip"
            aria-pressed={dictation.state === 'listening'}
            disabled={!dictation.available}
            title={dictation.unavailableReason ?? 'hold to speak; release to transcribe'}
            style={
              dictation.error != null
                ? { borderColor: 'var(--skin-danger)', color: 'var(--skin-danger)' }
                : undefined
            }
            onPointerDown={(event) => {
              // Capture the pointer so sliding off the chip mid-sentence does not
              // silently end the utterance.
              event.currentTarget.setPointerCapture(event.pointerId);
              listen();
            }}
            onPointerUp={() => dictation.release()}
            onPointerCancel={() => dictation.release()}
            onKeyDown={(event) => {
              if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
                event.preventDefault();
                listen();
              }
            }}
            onKeyUp={(event) => {
              if (event.key === ' ' || event.key === 'Enter') dictation.release();
            }}
          >
            {dictation.state === 'listening'
              ? `listening ${meter(dictation.level)}`
              : dictation.state === 'transcribing'
                ? 'transcribing…'
                : 'hold to talk'}
          </button>

          <span className="hairline mx-1 h-4 border-l" />

          {(
            ['sampling', 'context', 'format', 'tools', 'system', 'sessions', 'speech', 'dictation'] as const
          ).map((panel) => (
            <Toggle
              key={panel}
              label={panel}
              flagged={
                (panel === 'format' && formatError != null) ||
                (panel === 'tools' && (toolError != null || (toolsBlocked && parseTools(state.toolsText).value.length > 0))) ||
                (panel === 'speech' && speech.error != null) ||
                (panel === 'dictation' && dictation.error != null)
              }
              on={drawer === panel || (panel === 'sessions' && state.sessionId != null)}
              onClick={() => setDrawer(drawer === panel ? null : panel)}
            />
          ))}

          <FilePicker
            label="attach"
            className="chip"
            multiple
            onFiles={(chosen) => {
              // The part name is the join between the JSON body and the
              // multipart part; it only has to be unique within a request.
              const staged = chosen.map((file) => ({
                uploadName: `upload_${nextUpload.current++}`,
                file,
              }));
              setAttachments((current) => [...current, ...staged]);
            }}
          />

          {attachments.map((attachment) => (
            <button
              key={attachment.uploadName}
              type="button"
              className="chip"
              title={`${attachment.file.type || 'unknown type'} · ${attachment.uploadName}`}
              onClick={() =>
                setAttachments((current) =>
                  current.filter((entry) => entry.uploadName !== attachment.uploadName),
                )
              }
            >
              {attachment.file.name} ✕
            </button>
          ))}
        </div>

        {drawer && (
          <div className="panel mb-3">
            {drawer === 'sampling' && (
              <SamplingPanel
                value={state.sampling}
                onChange={(sampling) => set('sampling', sampling)}
                report={samplingReport}
              />
            )}
            {drawer === 'context' && (
              <ContextPanel
                sources={state.context}
                onChange={(context) => set('context', context)}
              />
            )}
            {drawer === 'format' && (
              <FormatPanel
                value={state.format}
                onChange={(format) => set('format', format)}
                error={formatError}
                support={structuredSupport}
              />
            )}
            {drawer === 'sessions' && (
              <SessionsPanel
                sessionId={state.sessionId}
                onAttach={(sessionId) => {
                  set('sessionId', sessionId);
                  // The transcript on screen belongs to the previous context;
                  // keeping it would imply the model can still see it.
                  startOver();
                }}
              />
            )}
            {drawer === 'speech' && <SpeechPanel speech={speech} />}
            {drawer === 'tools' && (
              <ToolsPanel
                support={toolSupport}
                source={state.toolsText}
                choice={state.toolChoice}
                error={toolError}
                onSource={(toolsText) => set('toolsText', toolsText)}
                onChoice={(toolChoice) => set('toolChoice', toolChoice)}
              />
            )}
            {drawer === 'dictation' && <DictationPanel dictation={dictation} />}
            {drawer === 'system' && (
              <Labelled label="system_prompt">
                <textarea
                  className="field scroll-thin min-h-24 w-full resize-y"
                  value={state.systemPrompt}
                  placeholder="Prepended by LewLM's template, not by Chap."
                  onChange={(event) => set('systemPrompt', event.target.value)}
                />
              </Labelled>
            )}
          </div>
        )}

        <div className="flex items-end gap-2">
          <textarea
            className="field scroll-thin min-h-16 flex-1 resize-none"
            placeholder="Ask anything.  ⏎ to send, ⇧⏎ for a new line."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
          />
          <div className="flex flex-col items-end gap-1">
            {/* Exact count from the model's tokenizer — a floor, since the
                compiled prompt adds template and system tokens on top. */}
            <span className="micro-label numeric">
              {promptTokens == null ? ' ' : `${promptTokens} tok +`}
            </span>
            {streaming ? (
              <button
                type="button"
                className="btn"
                disabled={stopping}
                onClick={() => {
                  // Stop means stop: silence the clips already scheduled, not
                  // just the ones not yet synthesized.
                  speech.cancel();
                  const requestId = activeRequestId.current;
                  if (!requestId) return;
                  setStopping(true);
                  void lewlm
                    .request<RequestCancellationRecord>(
                      'POST',
                      `/v1/requests/${encodeURIComponent(requestId)}/cancel`,
                    )
                    .catch((cause: unknown) => {
                      setStopping(false);
                      setError(cause instanceof Error ? cause : new Error(String(cause)));
                    });
                }}
              >
                {stopping ? 'Stopping…' : 'Stop'}
              </button>
            ) : (
              <button
                type="button"
                className="btn-accent"
                disabled={!canSend}
                onClick={() => void send()}
              >
                Send
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Five blocks of input level. Peak rather than RMS: what this has to answer is
 * "is it hearing me at all", and peak moves on the first syllable.
 */
function meter(level: number): string {
  const lit = Math.min(5, Math.round(level * 8));
  return '\u2588'.repeat(lit) + '\u2591'.repeat(5 - lit);
}

function Toggle({
  label,
  on,
  flagged,
  onClick,
}: {
  label: string;
  on: boolean;
  flagged?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="chip"
      aria-pressed={on}
      onClick={onClick}
      style={flagged ? { borderColor: 'var(--skin-danger)', color: 'var(--skin-danger)' } : undefined}
    >
      {label}
    </button>
  );
}

function RunMetadata({
  metadata,
  usage,
  servingProfile,
  identity,
}: {
  metadata: ExecutionMetadata;
  usage: CompletionUsage | null;
  servingProfile: ServingProfileApplication | null;
  identity: Turn['identity'];
}) {
  const timing = metadata.timing;
  const execMs = timing?.execute_milliseconds;

  /*
   * Only shown when LewLM says the counts were measured. An unmeasured `usage`
   * is an estimate, and a rate derived from an estimate is a number a test
   * bench has no business presenting as fact.
   */
  const rate =
    usage?.measured && usage.completion_tokens && execMs
      ? `${((usage.completion_tokens / execMs) * 1000).toFixed(1)}/s`
      : null;

  /*
   * What was sent against what LewLM says it received. The request id is the
   * cancellation handle, so a mismatch would mean Stop names the wrong run.
   */
  const echoed =
    identity == null
      ? null
      : metadata.request_id === identity.requestId && metadata.correlation_id === identity.correlationId;

  return (
    <div className="panel mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="origin" value={metadata.result_origin ?? '—'} />
      <Stat label="runtime" value={metadata.model?.runtime_name ?? '—'} />
      <Stat label="path" value={metadata.routing.modality_path ?? '—'} />
      <Stat label="queue" value={`${timing?.queue_milliseconds ?? 0}ms`} />
      <Stat label="load" value={`${timing?.load_milliseconds ?? 0}ms`} />
      <Stat label="execute" value={`${execMs ?? 0}ms`} />
      <Stat label="total" value={`${timing?.total_milliseconds ?? 0}ms`} />
      {/* `measured: false` means LewLM had no tokenizer to count with and
          estimated; the figure is shown, labelled as what it is. */}
      <Stat
        label={usage && !usage.measured ? 'tokens (estimated)' : 'tokens'}
        value={usage ? `${usage.prompt_tokens}+${usage.completion_tokens}` : '—'}
      />
      {/* Absent means the backend reports no prefix-cache counter, not zero. */}
      {usage?.cached_tokens != null && <Stat label="cached" value={usage.cached_tokens} />}
      <Stat label="tok/s" value={rate ?? (usage ? 'unmeasured' : '—')} />
      <Stat label="batched" value={metadata.serving?.batched ? 'yes' : 'no'} />
      <Stat label="endpoint" value={metadata.model?.endpoint_id ?? 'local'} />
      <Stat label="engine profile" value={metadata.model?.engine_profile ?? '—'} />
      <Stat label="request" value={metadata.request_id.slice(0, 8)} />
      <Stat label="correlation" value={metadata.correlation_id?.slice(0, 8) ?? '—'} />
      <Stat label="ids echoed" value={echoed == null ? '—' : echoed ? 'match' : 'MISMATCH'} />
      {/* The profile is only ever reported on the first chunk, so this is the
          one place its status is knowable. */}
      <Stat label="profile" value={servingProfile?.status ?? '—'} />
      {metadata.routing.fallback_from_model_id && (
        <div className="col-span-2 sm:col-span-4 text-sm" role="status" style={{ color: 'var(--skin-warn)' }}>
          answered by {metadata.model?.resolved_model_id ?? 'another model'}
          {metadata.model?.endpoint_id ? ` @${metadata.model.endpoint_id}` : ''}, not the{' '}
          {metadata.routing.fallback_from_model_id} you asked for:{' '}
          {metadata.routing.fallback_reason ?? 'no reason reported'}
        </div>
      )}
    </div>
  );
}

/**
 * Anything the send path threw.
 *
 * `LewLMApiError` is the expected case and gets the full envelope treatment. A
 * plain `Error` is a bug in Chap, and saying so is the honest report — this used
 * to be cast to `LewLMApiError` unconditionally, and reading `.fields` off a
 * value that had none is what turned a two-line naming bug into a blank page.
 */
function ErrorBanner({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  const api = error instanceof LewLMApiError ? error : null;

  return (
    <div
      className="panel"
      style={{ borderColor: 'var(--skin-danger)', color: 'var(--skin-danger)' }}
      role="alert"
    >
      <div className="micro-label" style={{ color: 'var(--skin-danger)' }}>
        {api ? `${api.code} · ${api.details['in_band'] ? 'stream' : api.status || 'no response'}` : 'chap error · no request made'}
      </div>
      <p className="mt-1 text-sm" style={{ color: 'var(--skin-ink)' }}>
        {error.message}
      </p>
      {/* LewLM names the engine that refused it; the message alone does not. */}
      {typeof api?.details['endpoint_id'] === 'string' && (
        <p className="numeric mt-1">
          engine endpoint: {api.details['endpoint_id']}
          {typeof api.details['runtime'] === 'string' ? ` · ${api.details['runtime']}` : ''}
          {api.details['partial_output'] === true ? ' · the text above is partial output' : ''}
        </p>
      )}
      {api && api.fields.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {api.fields.map((field, index) => (
            <p key={index} className="numeric">
              {field.field}: {field.message}
            </p>
          ))}
        </div>
      )}
      {api?.synthesized && (
        <p className="micro-label mt-2">
          LewLM returned no error envelope — Chap synthesized this. See docs/lewlm-gaps.md#g11
        </p>
      )}
      {!api && (
        <p className="micro-label mt-2">
          This is a fault in Chap, not a response from LewLM.
        </p>
      )}
      {onRetry && (
        <button type="button" className="btn mt-2" onClick={onRetry}>
          restore prompt to retry
        </button>
      )}
    </div>
  );
}
