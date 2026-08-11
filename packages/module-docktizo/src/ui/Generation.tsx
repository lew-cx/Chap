/**
 * Watch one generation from `accepted` to an artifact.
 *
 * This file is the largest in the module and almost all of it is here because
 * DocKtizo has no streaming. LewLM publishes `/v1/events` and @chap/lewlm
 * subscribes in 41 lines; DocKtizo publishes a durable log you have to walk with
 * a cursor, so the poll loop, the cursor bookkeeping and the terminal-state
 * detection below are all Chap's. See docs/docktizo-gaps.md, D3.
 *
 * The poll is local rather than `usePolled` on purpose: that hook goes through
 * the LewLM client and reports `LewLMApiError`, and coercing DocKtizo's envelope
 * into LewLM's error type would be exactly the kind of paraphrase Chap refuses
 * to do anywhere else.
 */

import { useEffect, useState } from 'react';

import { Disclosure } from '@/components/Disclosure.tsx';
import { Stat } from '@/components/Field.tsx';
import { Json } from '@/components/Json.tsx';
import { StatusDot } from '@/components/Nav.tsx';
import { Missing, Section } from '@/components/Screen.tsx';
import { Table } from '@/components/Table.tsx';

import { artifactDownloadUrl, docktizo } from '../client.ts';
import { useWorkbench } from '../store.ts';
import {
  PIPELINE,
  TERMINAL,
  type ArtifactMetadata,
  type GenerationEvent,
  type GenerationStatus,
} from '../types.ts';

const POLL_MS = 2000;

export function Generation() {
  const generationId = useWorkbench((state) => state.generationId);
  const watch = useWorkbench((state) => state.watch);
  const [entered, setEntered] = useState('');

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
  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const [events, setEvents] = useState<GenerationEvent[]>([]);
  const [checkpoint, setCheckpoint] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<ArtifactMetadata[]>([]);
  const [failure, setFailure] = useState<string | null>(null);

  const terminal = status != null && TERMINAL.includes(status.state);

  // One loop for status and the event log. It stops itself at a terminal state
  // rather than polling a finished generation forever.
  useEffect(() => {
    let live = true;
    let cursor: string | null = null;

    const read = async () => {
      try {
        const next = await docktizo.generations.get(generationId);
        if (!live) return;
        setStatus(next);

        // Walk every page that has appeared since the last read. `has_more` is
        // the only thing that says whether the log has caught up.
        for (;;) {
          const page = await docktizo.generations.events(generationId, cursor);
          if (!live) return;
          if (page.items.length > 0) setEvents((current) => [...current, ...page.items]);
          setCheckpoint(page.checkpoint ?? null);
          cursor = page.next_cursor ?? cursor;
          if (!page.has_more) break;
        }

        if (TERMINAL.includes(next.state)) {
          clearInterval(timer);
          const found = await Promise.all(next.artifact_ids.map((id) => docktizo.artifacts.get(id)));
          if (live) setArtifacts(found);
        }
      } catch (cause) {
        if (live) setFailure(cause instanceof Error ? cause.message : String(cause));
      }
    };

    void read();
    const timer = setInterval(() => void read(), POLL_MS);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [generationId]);

  if (!status) {
    return <Missing>{failure ?? `reading ${generationId}…`}</Missing>;
  }

  return (
    <>
      <Section title="state" hint={generationId}>
        <div className="panel mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="workflow" value={status.workflow_id} />
          <Stat label="stage" value={status.stage ?? '—'} />
          <Stat label="attempts" value={status.attempt_count} />
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
            <button
              type="button"
              className="chip"
              onClick={() => void docktizo.generations.cancel(generationId).catch(() => undefined)}
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
      </Section>

      <Section
        title="events"
        hint={`${events.length} · polled every ${POLL_MS / 1000}s · checkpoint ${checkpoint ?? '—'}`}
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
          empty="none yet — an API running without `python -m docktizo.worker` never emits any"
        />
      </Section>

      <Section title="artifacts" hint={`${status.artifact_ids.length} produced`}>
        {artifacts.length === 0 ? (
          <Missing>
            {terminal ? 'none' : 'artifacts appear once the generation reaches a terminal state'}
          </Missing>
        ) : (
          <div className="flex flex-col gap-2">
            {artifacts.map((artifact) => (
              <Disclosure
                key={artifact.artifact_id}
                label={artifact.output_format}
                hint={`${artifact.file_name} · ${artifact.size_bytes} bytes`}
              >
                {/* A plain link. The proxy holds the bearer, so the browser can
                    fetch this the way it fetches anything else. */}
                <a className="btn-accent" href={artifactDownloadUrl(artifact.artifact_id)} download>
                  download
                </a>
                <div className="mt-2">
                  <Json value={artifact} maxHeight="14rem" />
                </div>
              </Disclosure>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

/** Where the run got to. `repairing` is a loop back into validating, not a step. */
function Pipeline({ state }: { state: GenerationStatus['state'] }) {
  const reached = PIPELINE.indexOf(state as (typeof PIPELINE)[number]);

  return (
    <div className="flex flex-wrap gap-1">
      {PIPELINE.map((step, index) => (
        <span
          key={step}
          className="chip"
          aria-pressed={step === state}
          style={{
            opacity: reached === -1 || index <= reached ? 1 : 0.4,
          }}
        >
          {step}
        </span>
      ))}
    </div>
  );
}
