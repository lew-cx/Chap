/**
 * The first screen of the console: is LewLM healthy, what can it serve, what is
 * it doing right now.
 *
 * Deliberately answers those three questions and stops. The detail lives one tab
 * away; an overview that shows everything shows nothing.
 */

import type {
  ClusterStatus,
  HealthResponse,
  LewLMCapabilities,
  ModelInventory,
  RuntimeStats,
} from '@chap/lewlm';

import { Disclosure } from '../components/Disclosure.tsx';
import { Stat } from '../components/Field.tsx';
import { Json } from '../components/Json.tsx';
import { StatusDot } from '../components/Nav.tsx';
import { Section } from '../components/Screen.tsx';
import { usePolled } from '../lib/usePolled.ts';
import { useEvents } from '../store/events.ts';

export function Overview() {
  const { data: health, error } = usePolled<HealthResponse>('/v1/health', 5000);
  const { data: stats } = usePolled<RuntimeStats>('/v1/runtime/stats', 5000);
  const { data: inventory } = usePolled<ModelInventory>('/v1/models', 30_000);
  const { data: capabilities } = usePolled<LewLMCapabilities>('/v1/lewlm/capabilities', 60_000);
  const { data: cluster } = usePolled<ClusterStatus>('/v1/cluster/status', 15_000);

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
          {(health?.engines ?? []).map((engine) => (
            <div key={engine.endpoint_id} className="panel grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Stat label="endpoint" value={engine.endpoint_id} />
              <Stat label="profile" value={engine.profile} />
              <Stat label="state" value={engine.state} />
              <Stat label="advertised models" value={engine.advertised_model_count} />
              <Stat label="inventory age" value={engine.inventory_age_seconds == null ? '—' : `${engine.inventory_age_seconds.toFixed(1)}s`} />
              {engine.inventory_error && (
                <p className="col-span-2 sm:col-span-5 text-sm" style={{ color: 'var(--skin-danger)' }}>
                  {engine.inventory_error}
                </p>
              )}
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
