/**
 * Watch one generation from `accepted` to an artifact.
 *
 * This file used to carry a 2-second poll loop, a page walk and its own cursor
 * bookkeeping, because DocKtizo published a durable log and no way to follow it.
 * It now streams: `GET /v1/generations/{id}/events/stream` tails the same log,
 * and every `id:` is the same paged cursor, so a dropped connection resumes
 * exactly where it stopped.
 *
 * The reader is `readSSE` from @chap/lewlm — written for LewLM's chat and event
 * streams, reused here without a line of change because DocKtizo now speaks the
 * same wire format. That is the argument for keeping one client package rather
 * than one per upstream.
 *
 * Where this tab ends is the point: a run that produced a document hands its id
 * to the document tab, which is where review, revision and version migration
 * happen. `awaiting_review` is a resting state, not a terminal one.
 */

import { useEffect, useState } from 'react';

import { readSSE } from '@chap/lewlm';

import { Stat } from '@/components/Field.tsx';
import { StatusDot } from '@/components/Nav.tsx';
import { Missing, Section } from '@/components/Screen.tsx';
import { Table } from '@/components/Table.tsx';

import { docktizo } from '../client.ts';
import { useWorkbench } from '../store.ts';
import {
  PIPELINE_ORDER,
  RESTING,
  TERMINAL,
  type ArtifactMetadata,
  type GenerationEvent,
  type GenerationStatus,
} from '../types.ts';
import { Artifacts } from './Shared.tsx';

/** What `stream_completed` carries when the log is done with us. */
interface StreamCompleted {
  reason: string;
  checkpoint: string;
}

const isIn = (set: readonly string[], state: GenerationStatus['state']) => set.includes(state);

/** How many times a stream may drop without advancing before the watch gives up. */
const RETRIES = 4;
const RETRY_MS = 500;

/** An unknown throw as one line of text. */
const message = (cause: unknown) => (cause instanceof Error ? cause.message : String(cause));

export function Generation() {
  const generationId = useWorkbench((state) => state.generationId);
  const watch = useWorkbench((state) => state.watch);
  const [entered, setEntered] = useState('');

  // There is no `GET /v1/generations`, so a run this session did not submit can
  // only be reached by its id. The document tab has a catalogue instead, because
  // documents are the durable thing and DocKtizo lists those.
  if (!generationId) {
    return (
      <Section title="watch a generation">
        <div className="flex flex-wrap items-end gap-3">
          <input
            className="field code w-96"
            value={entered}
            placeholder="generation_id"
            onChange={(event) => setEntered(event.target.value)}
          />
          <button type="button" className="btn" disabled={!entered.trim()} onClick={() => watch(entered.trim())}>
            watch
          </button>
        </div>
        <p className="micro-label mt-2">Submitting from the generate tab fills this in.</p>
      </Section>
    );
  }

  return <Watch generationId={generationId} />;
}

function Watch({ generationId }: { generationId: string }) {
  const open = useWorkbench((state) => state.open);
  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const [events, setEvents] = useState<GenerationEvent[]>([]);
  const [checkpoint, setCheckpoint] = useState<string | null>(null);
  const [done, setDone] = useState<StreamCompleted | null>(null);
  const [artifacts, setArtifacts] = useState<ArtifactMetadata[]>([]);
  const [failure, setFailure] = useState<string | null>(null);

  // Two different questions, and DocKtizo publishes a set for each. `resting`
  // is "the run is no longer advancing", which is when the artifacts are all
  // there; `terminal` is "nothing more can happen", which is the only thing
  // cancellation cares about. `awaiting_review` is the state that separates
  // them — resting, artifacts written, and still cancellable.
  const resting = status != null && isIn(RESTING, status.state);
  const terminal = status != null && isIn(TERMINAL, status.state);

  useEffect(() => {
    const controller = new AbortController();
    // Where the next attempt resumes from. A local rather than the state below:
    // a reconnect has to read what the last frame set, not what this closure
    // captured when the effect ran.
    let cursor: string | null = null;

    /** One connection. `false` when it ended without a completion frame. */
    const follow = async (): Promise<boolean> => {
      // Null on the first attempt: start from the beginning of the log. A live
      // generation and one that finished an hour ago replay identically, which
      // is why there is no separate "load history" path.
      const res = await docktizo.generations.stream(generationId, cursor, controller.signal);

      for await (const frame of readSSE(res)) {
        if (frame.event === 'stream_completed') {
          const completion = JSON.parse(frame.data) as StreamCompleted;
          cursor = completion.checkpoint;
          setCheckpoint(cursor);
          setDone(completion);
          return true;
        }
        setEvents((current) => [...current, JSON.parse(frame.data) as GenerationEvent]);
        if (frame.id) {
          cursor = frame.id;
          setCheckpoint(cursor);
        }
      }
      return false;
    };

    const watch = async () => {
      try {
        setStatus(await docktizo.generations.get(generationId));

        // The cursor is used, not just displayed. Resumability is this
        // endpoint's headline, and a `checkpoint` that is written and never read
        // back is a claim rather than a feature: without this loop a dropped
        // connection ended the watch and lost the rest of the run.
        for (let attempt = 0, mark = cursor; !(await follow()); mark = cursor) {
          if (controller.signal.aborted) return;
          // A drop that made progress is not the same as one that made none.
          attempt = cursor === mark ? attempt + 1 : 0;
          if (attempt > RETRIES) throw new Error('the event stream kept dropping');
          // An abort during the wait surfaces as the next connection throwing.
          await new Promise((resolve) => setTimeout(resolve, RETRY_MS * 2 ** attempt));
        }

        const final = await docktizo.generations.get(generationId);
        setStatus(final);
        // The run is over; the document outlives it. Handing the id over here
        // means the review, revision and migration tab is already loaded by the
        // time anyone looks at it, and a run that produced no document — a
        // failure, a cancellation — silently hands over nothing.
        if (final.document_id) open(final.document_id);
        setArtifacts(await Promise.all(final.artifact_ids.map((id) => docktizo.artifacts.get(id))));
      } catch (cause) {
        // An abort is an unmount, not a failure.
        if (!controller.signal.aborted) setFailure(message(cause));
      }
    };

    void watch();
    return () => controller.abort();
  }, [generationId]);

  if (!status) {
    return <Missing>{failure ?? `reading ${generationId}…`}</Missing>;
  }

  return (
    <>
      <Section title="state" hint={generationId}>
        <div className="panel mb-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="workflow" value={status.workflow_id} />
          <Stat label="stage" value={status.stage ?? '—'} />
          <Stat label="attempts" value={status.attempt_count} />
          <Stat label="document" value={status.document_id ? 'in the document tab' : '—'} />
          <div className="flex flex-col gap-0.5">
            <span className="micro-label">status</span>
            {status.state === 'completed' ? (
              <StatusDot tone="ok">{status.state}</StatusDot>
            ) : status.state === 'failed' || status.state === 'rejected' ? (
              <StatusDot tone="danger">{status.state}</StatusDot>
            ) : (
              <StatusDot tone="warn">{status.state}</StatusDot>
            )}
          </div>
        </div>

        <Pipeline state={status.state} />

        {!terminal && (
          <div className="mt-3">
            {/* The refusal is the interesting case — a run past the point of
                cancellation says so, and swallowing that left the button looking
                broken instead. */}
            <button
              type="button"
              className="chip"
              onClick={() => void docktizo.generations.cancel(generationId).catch((cause: unknown) => setFailure(message(cause)))}
            >
              cancel
            </button>
            {status.cancellation_requested_at && (
              <span className="micro-label ml-2">
                cancellation requested {status.cancellation_requested_at.slice(11, 19)}
                {status.cancellation_acknowledged_at ? ' · acknowledged' : ' · not yet acknowledged'}
              </span>
            )}
          </div>
        )}

        {status.error && (
          <div className="panel mt-3" style={{ borderColor: 'var(--skin-danger)' }}>
            <p className="micro-label" style={{ color: 'var(--skin-danger)' }}>
              {status.error.code}
              {status.error.retryable && ' · retryable'}
            </p>
            <p className="mt-1 text-sm">{status.error.message}</p>
          </div>
        )}

        {/* A failure in the watch itself — a refused cancel, a stream that kept
            dropping. Distinct from `status.error`, which is the run's own. */}
        {failure && (
          <p className="numeric mt-3" style={{ color: 'var(--skin-danger)' }}>{failure}</p>
        )}
      </Section>

      <Section
        title="events"
        hint={
          `${events.length} · ${done ? `stream ${done.reason}` : 'streaming'}` +
          ` · resume ${checkpoint?.slice(0, 12) ?? '—'}`
        }
      >
        <Table
          columns={[
            { key: 'seq', label: '#', numeric: true, render: (row) => row.sequence },
            { key: 'when', label: 'at', render: (row) => row.occurred_at.slice(11, 19) },
            { key: 'type', label: 'event', render: (row) => row.event_type },
            { key: 'state', label: 'state', render: (row) => row.state ?? '—' },
            { key: 'stage', label: 'stage', render: (row) => row.stage ?? '—' },
            {
              key: 'progress',
              label: 'progress',
              numeric: true,
              render: (row) => (row.progress != null ? `${Math.round(row.progress * 100)}%` : '—'),
            },
            { key: 'error', label: 'error', render: (row) => row.error_code ?? '—' },
          ]}
          rows={events}
          empty="none yet"
        />
      </Section>

      <Section title="artifacts" hint={`${status.artifact_ids.length} produced`}>
        <Artifacts
          artifacts={artifacts}
          empty={resting ? 'none' : 'artifacts appear once the run stops advancing'}
        />
      </Section>
    </>
  );
}

/**
 * Where the run got to. The order is DocKtizo's, from its published contract.
 *
 * An ordered list with `aria-current="step"`, not toggles. This is a readout,
 * and `aria-pressed` on a plain `<span>` is invalid twice over — the attribute
 * needs `role="button"`, and nothing here is pressable.
 */
function Pipeline({ state }: { state: GenerationStatus['state'] }) {
  const reached = (PIPELINE_ORDER as readonly string[]).indexOf(state);

  return (
    <ol className="flex flex-wrap gap-1">
      {PIPELINE_ORDER.map((step, index) => (
        <li
          key={step}
          className="chip"
          aria-current={step === state ? 'step' : undefined}
          style={{
            opacity: reached === -1 || index <= reached ? 1 : 0.4,
            borderColor: step === state ? 'var(--skin-accent)' : undefined,
            color: step === state ? 'var(--skin-accent)' : undefined,
          }}
        >
          {step}
        </li>
      ))}
    </ol>
  );
}
