/**
 * The first screen of the console: is LewLM healthy, what can it serve, what is
 * it doing right now.
 *
 * Deliberately answers those three questions and stops. The detail lives one tab
 * away; an overview that shows everything shows nothing.
 *
 * "Healthy" is three facts LewLM keeps apart, and so does this screen: the
 * service is up (`health.status`), an engine is reachable (`engines[].state`),
 * a model is warm (`startup.warm_models`). A 200 from health implies neither of
 * the other two, which is the mistake a single green dot would make.
 */

import { useState } from 'react';

import type {
  ClusterStatus,
  HealthResponse,
  LewLMCapabilities,
  ModelInventory,
  ModelScanSummary,
  RuntimeInfo,
  RuntimeStats,
} from '@chap/lewlm';

import { Disclosure } from '../components/Disclosure.tsx';
import { Stat } from '../components/Field.tsx';
import { Json } from '../components/Json.tsx';
import { StatusDot } from '../components/Nav.tsx';
import { Section } from '../components/Screen.tsx';
import { lewlm } from '../lib/client.ts';
import { refreshPolled, usePolled } from '../lib/usePolled.ts';
import { useEvents } from '../store/events.ts';

const ENGINE_TONE: Record<string, 'ok' | 'warn' | 'danger'> = {
  advertised: 'ok',
  stale: 'warn',
  unknown: 'warn',
  failed: 'danger',
};

export function Overview() {
  const { data: health, error } = usePolled<HealthResponse>('/v1/health', 5000);
  const { data: stats } = usePolled<RuntimeStats>('/v1/runtime/stats', 5000);
  const { data: inventory } = usePolled<ModelInventory>('/v1/models', 30_000);
  const { data: capabilities } = usePolled<LewLMCapabilities>('/v1/lewlm/capabilities', 60_000);
  const { data: cluster } = usePolled<ClusterStatus>('/v1/cluster/status', 15_000);
  const { data: runtime } = usePolled<RuntimeInfo>('/v1/runtime', 5000);
  const [scan, setScan] = useState<{ busy: boolean; note: string | null }>({ busy: false, note: null });

  /*
   * An engine that came back is not re-advertised until its inventory is read
   * again. Waiting out the TTL works; this is the operator's shortcut, and the
   * same call the Models tab makes.
   */
  const rescan = async () => {
    setScan({ busy: true, note: null });
    try {
      const summary = await lewlm.request<ModelScanSummary>('POST', '/v1/models/scan', { json: {} });
      setScan({ busy: false, note: `${summary.discovered_count} discovered · ${summary.removed_count} removed` });
    } catch (cause) {
      setScan({ busy: false, note: cause instanceof Error ? cause.message : String(cause) });
    }
    for (const path of ['/v1/health', '/v1/models', '/v1/runtime']) refreshPolled(path);
  };

  const warm = runtime?.startup?.warm_models ?? [];
  const loadingModels = runtime?.startup?.loading_models ?? [];

  const status = useEvents((state) => state.status);
  const received = useEvents((state) => state.received);

  return (
    <>
      <Section title="service">
        <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-0.5">
            <span className="micro-label">status</span>
            {error ? (
              <StatusDot tone="danger">unreachable</StatusDot>
            ) : (
              <StatusDot tone={health?.status === 'ok' ? 'ok' : 'warn'}>
                {health?.status ?? 'connecting'}
              </StatusDot>
            )}
          </div>
          <Stat label="version" value={health?.version ?? '—'} />
          <Stat label="host" value={health?.hostname ?? '—'} />
          <Stat label="started" value={health?.started_at?.slice(11, 19) ?? '—'} />
          <div className="flex flex-col gap-0.5">
            <span className="micro-label">event stream</span>
            <StatusDot tone={status === 'open' ? 'ok' : status === 'closed' ? 'danger' : 'warn'}>
              {status} · {received}
            </StatusDot>
          </div>
          <Stat label="api key" value={stats?.api_key_required ? 'required' : 'open'} />
          <Stat label="loaded" value={stats?.current_loaded_models ?? '—'} />
          <Stat label="queue" value={stats?.queue_depth ?? '—'} />
        </div>
      </Section>

      <Section title="engines" hint={`${health?.engines?.length ?? 0} configured`}>
        <div className="flex flex-col gap-2">
          {(health?.engines ?? []).length === 0 && (
            <p className="micro-label">no external engines configured — every model runs in-process</p>
          )}
          {(health?.engines ?? []).map((engine) => {
            return (
              <div key={engine.endpoint_id} className="panel grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Stat label="endpoint" value={engine.endpoint_id} />
                <Stat label="profile" value={engine.profile} />
                <div className="flex flex-col gap-0.5">
                  <span className="micro-label">state</span>
                  {/* A disabled endpoint is never read, so its `unknown` is not a
                      warning — the stock container lists `legacy-default` this way. */}
                  {engine.enabled === false ? (
                    <span className="numeric" style={{ color: 'var(--skin-faint)' }}>disabled</span>
                  ) : (
                    <StatusDot tone={ENGINE_TONE[engine.state] ?? 'warn'}>{engine.state}</StatusDot>
                  )}
                </div>
                <Stat label="advertised models" value={engine.advertised_model_count} />
                <Stat label="inventory age" value={engine.inventory_age_seconds == null ? '—' : `${engine.inventory_age_seconds.toFixed(1)}s`} />
                {engine.inventory_error && (
                  <p className="col-span-2 sm:col-span-5 text-sm" style={{ color: 'var(--skin-danger)' }}>
                    {engine.inventory_error}
                  </p>
                )}
              </div>
            );
          })}
          <div className="flex items-center gap-3">
            <button type="button" className="btn" disabled={scan.busy} onClick={() => void rescan()}>
              {scan.busy ? 'rescanning…' : 'rescan engines'}
            </button>
            {scan.note && <span className="micro-label">{scan.note}</span>}
          </div>
        </div>
      </Section>

      <Section title="warm models" hint={`${warm.length} warm · ${loadingModels.length} loading`}>
        <div className="panel flex flex-col">
          {warm.length + loadingModels.length === 0 && (
            <p className="micro-label">nothing is loaded — the first request to any model pays its load</p>
          )}
          {[
            ...loadingModels.map((entry) => ({ ...entry, loading: true })),
            ...warm.map((entry) => ({ ...entry, loading: false })),
          ].map((entry) => (
            <div
              key={`${entry.model_id}:${entry.runtime}`}
              className="row grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-3 py-1"
            >
              <span className="numeric truncate" title={entry.model_id}>
                {entry.model_id}
              </span>
              <span className="micro-label" style={{ color: 'var(--skin-faint)' }}>
                {entry.runtime}
              </span>
              <StatusDot tone={entry.loading ? 'warn' : 'ok'}>
                {entry.loading
                  ? 'loading'
                  : `warm${entry.load_seconds != null ? ` · loaded in ${entry.load_seconds.toFixed(1)}s` : ''}`}
              </StatusDot>
            </div>
          ))}
        </div>
      </Section>

      <Section title="models">
        <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="discovered" value={inventory?.count ?? '—'} />
          <Stat label="chat-ready" value={inventory?.chat_ready_count ?? '—'} />
          <Stat label="servable" value={inventory?.servable_count ?? '—'} />
          <Stat
            label="need conversion"
            value={
              inventory
                ? inventory.items.filter((item) => item.conversion_status !== 'runnable').length
                : '—'
            }
          />
        </div>
      </Section>

      <Section title="cluster" hint={cluster?.enabled ? cluster.role : 'disabled'}>
        <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="enabled" value={cluster?.enabled ? 'yes' : 'no'} />
          <Stat label="role" value={cluster?.role ?? '—'} />
          <Stat label="ready workers" value={cluster?.ready_worker_count ?? '—'} />
          <Stat label="stale workers" value={cluster?.stale_worker_count ?? '—'} />
        </div>
      </Section>

      <Section title="middleware capabilities">
        <Disclosure
          label="what this LewLM can do"
          hint={capabilities?.service ? `${capabilities.service} · ${capabilities.runnable_model_count ?? 0} runnable` : ''}
        >
          <Json value={capabilities} maxHeight="24rem" />
        </Disclosure>
      </Section>
    </>
  );
}
