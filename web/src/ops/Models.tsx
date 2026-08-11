/**
 * The model registry, and the lifecycle actions against it.
 *
 * `GET /v1/models` answers "what exists" and "what can run" in one request —
 * `capability_availability[]` carries `chat_ready`, `ready_capabilities`,
 * `blocked_capabilities` and a human `reason`. Chap prints the reason; it never
 * invents one.
 *
 * Every write here is a real lifecycle operation against a live runtime, so each
 * reports what LewLM said it did (`backend_operation_performed`,
 * `joined_existing_operation`) rather than assuming it worked.
 */

import { useState } from 'react';

import type {
  ModelCapabilityReport,
  ModelInventory,
  ModelLifecycleResponse,
  ModelResidencySnapshot,
  ModelScanSummary,
} from '@chap/lewlm';

import { Disclosure } from '../components/Disclosure.tsx';
import { Stat } from '../components/Field.tsx';
import { Json } from '../components/Json.tsx';
import { Missing, Section } from '../components/Screen.tsx';
import { lewlm } from '../lib/client.ts';
import { usePolled } from '../lib/usePolled.ts';
import { Table, type Column } from '../components/Table.tsx';

type Item = ModelInventory['items'][number];

export function Models() {
  const inventory = usePolled<ModelInventory>('/v1/models', 15_000);
  const [selected, setSelected] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [scan, setScan] = useState<ModelScanSummary | null>(null);
  const [busy, setBusy] = useState(false);

  const items = inventory.data?.items ?? [];
  const availability = new Map(
    (inventory.data?.capability_availability ?? []).map((entry) => [entry.model_id, entry]),
  );

  const run = async (label: string, work: () => Promise<unknown>) => {
    setBusy(true);
    setAction(`${label}…`);
    try {
      const result = await work();
      setAction(`${label}: ${summarize(result)}`);
      inventory.refresh();
    } catch (cause) {
      setAction(`${label} failed: ${cause instanceof Error ? cause.message : String(cause)}`);
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<Item>[] = [
    { key: 'name', label: 'model', render: (row) => row.display_name || row.model_id },
    { key: 'family', label: 'family', render: (row) => row.architecture_family },
    { key: 'format', label: 'format', render: (row) => row.format_type },
    { key: 'quant', label: 'quant', render: (row) => row.quantization ?? '—' },
    {
      key: 'runtime',
      label: 'runtime',
      render: (row) => (row.runtime_affinity ?? []).join(', ') || '—',
    },
    {
      key: 'mem',
      label: 'mem',
      numeric: true,
      render: (row) => (row.estimated_memory_mb ? `${(row.estimated_memory_mb / 1024).toFixed(1)}G` : '—'),
    },
    {
      key: 'ready',
      label: 'chat',
      render: (row) => {
        const status = availability.get(row.model_id);
        return (
          <span
            className="numeric"
            title={status?.reason ?? undefined}
            style={{ color: status?.chat_ready ? 'var(--skin-ok)' : 'var(--skin-faint)' }}
          >
            {status?.chat_ready ? 'ready' : row.conversion_status}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <Section
        title="registry"
        hint={
          inventory.data
            ? `${inventory.data.count} models · ${inventory.data.chat_ready_count ?? 0} chat-ready · ${inventory.data.servable_count ?? 0} servable`
            : 'loading'
        }
      >
        <Table
          columns={columns}
          rows={items}
          onSelect={(row) => setSelected(row.model_id === selected ? null : row.model_id)}
          selected={(row) => row.model_id === selected}
          empty="no models discovered"
        />
      </Section>

      {selected && (
        <ModelDetail
          modelId={selected}
          busy={busy}
          onAction={run}
          reason={availability.get(selected)?.reason ?? null}
        />
      )}

      <Section title="registry scan">
        <button
          type="button"
          className="btn"
          disabled={busy}
          onClick={() =>
            void run('scan', async () => {
              const summary = await lewlm.request<ModelScanSummary>('POST', '/v1/models/scan', {
                json: {},
              });
              setScan(summary);
              return summary;
            })
          }
        >
          rescan model roots
        </button>

        {scan && (
          <div className="panel mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="discovered" value={scan.discovered_count} />
            <Stat label="new" value={scan.new_count} />
            <Stat label="updated" value={scan.updated_count} />
            <Stat label="unchanged" value={scan.unchanged_count} />
            <Stat label="removed" value={scan.removed_count} />
          </div>
        )}
      </Section>

      {action && (
        <p className="numeric" style={{ color: 'var(--skin-muted)' }}>
          {action}
        </p>
      )}
    </>
  );
}

function ModelDetail({
  modelId,
  busy,
  onAction,
  reason,
}: {
  modelId: string;
  busy: boolean;
  onAction: (label: string, work: () => Promise<unknown>) => Promise<void>;
  reason: string | null;
}) {
  const capabilities = usePolled<ModelCapabilityReport>(
    `/v1/models/${encodeURIComponent(modelId)}/capabilities`,
  );
  const residency = usePolled<ModelResidencySnapshot>(
    `/v1/models/${encodeURIComponent(modelId)}/residency`,
    4000,
  );

  const lifecycle = (verb: 'warm' | 'drain' | 'unload') =>
    onAction(verb, () =>
      lewlm.request<ModelLifecycleResponse>(
        'POST',
        `/v1/models/${encodeURIComponent(modelId)}/${verb}`,
        { json: {} },
      ),
    );

  const report = capabilities.data;
  const snapshot = residency.data;
  const matrix = report?.capabilities ?? [];

  return (
    <Section title={modelId}>
      {reason && (
        <p className="mb-2 text-sm" style={{ color: 'var(--skin-muted)' }}>
          {reason}
        </p>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" className="btn" disabled={busy} onClick={() => void lifecycle('warm')}>
          warm
        </button>
        <button type="button" className="btn" disabled={busy} onClick={() => void lifecycle('drain')}>
          drain
        </button>
        <button type="button" className="btn" disabled={busy} onClick={() => void lifecycle('unload')}>
          unload
        </button>
      </div>

      <div className="panel mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="state" value={snapshot?.state ?? '—'} />
        <Stat label="runtime" value={snapshot?.runtime ?? '—'} />
        <Stat label="in use" value={snapshot?.active_usage_count ?? '—'} />
        <Stat label="load attempts" value={snapshot?.load_attempt_count ?? '—'} />
        <Stat
          label="resident"
          value={snapshot?.estimated_memory_mb ? `${(snapshot.estimated_memory_mb / 1024).toFixed(1)}G` : '—'}
        />
        <Stat label="loaded at" value={snapshot?.loaded_at?.slice(11, 19) ?? '—'} />
        <Stat label="pending unload" value={snapshot?.pending_unload ? 'yes' : 'no'} />
        <Stat label="conversion" value={report?.conversion_status ?? '—'} />
      </div>

      {/* The load failure LewLM recorded, if any — the field that made the
          gemma4 routing bug legible instead of a mystery. */}
      {snapshot?.failure != null && (
        <div className="mb-3">
          <Json value={snapshot.failure} maxHeight="10rem" />
        </div>
      )}

      {report && (
        <>
          <Disclosure
            label="capability matrix"
            hint={`${matrix.filter((entry) => entry.supported).length}/${matrix.length} supported`}
          >
            <Table
              columns={[
                { key: 'cap', label: 'capability', render: (row) => row.capability },
                {
                  key: 'ok',
                  label: 'supported',
                  render: (row) => (
                    <span style={{ color: row.supported ? 'var(--skin-ok)' : 'var(--skin-faint)' }}>
                      {row.supported ? 'yes' : 'no'}
                    </span>
                  ),
                },
                { key: 'runtime', label: 'runtime', render: (row) => row.runtime_name ?? '—' },
                { key: 'path', label: 'support', render: (row) => row.support_path ?? '—' },
                { key: 'why', label: 'reason', render: (row) => row.reason ?? '—' },
              ]}
              rows={matrix}
            />
          </Disclosure>

          {/*
           * Whether a model can enforce a schema at decode time is knowable here
           * before you spend a generation finding out — which is exactly what
           * gap G18 asked for.
           */}
          <div className="mt-2">
            <Disclosure label="structured output support" hint={report.structured_output ? 'reported' : 'not reported'}>
              {report.structured_output ? (
                <Json value={report.structured_output} maxHeight="14rem" />
              ) : (
                <Missing>
                  this build does not state decode-time enforcement up front —
                  docs/lewlm-gaps.md#g18
                </Missing>
              )}
            </Disclosure>
          </div>

          <div className="mt-2">
            <Disclosure label="runtime candidates" hint={(report.runtime_candidates ?? []).length}>
              <Json value={report.runtime_candidates} maxHeight="14rem" />
            </Disclosure>
          </div>
        </>
      )}
    </Section>
  );
}

function summarize(result: unknown): string {
  if (!result || typeof result !== 'object') return 'done';
  const record = result as Record<string, unknown>;
  if (typeof record['status'] === 'string') {
    const joined = record['joined_existing_operation'] ? ' (joined an operation already running)' : '';
    const performed = record['backend_operation_performed'] === false ? ' — no backend work needed' : '';
    return `${record['status']}${performed}${joined}`;
  }
  if (typeof record['discovered_count'] === 'number') {
    return `${record['discovered_count']} discovered, ${record['updated_count']} updated`;
  }
  return 'done';
}
