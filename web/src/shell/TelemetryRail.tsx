/**
 * Live runtime telemetry.
 *
 * Two sources: polled aggregates from `/v1/runtime/stats`, and the live
 * `/v1/events` ring buffer that the whole app shares. The rail renders the tail
 * of that buffer through the same row component the events explorer uses, so
 * there is one rendering of an event in Chap, not two.
 *
 * Skin-blind — it renders in Bench's persistent column and Showroom's drawer
 * with no knowledge of which.
 */

import type { HealthResponse, RuntimeStats } from '@chap/lewlm';

import { EventRow } from '../components/EventRow.tsx';
import { Stat } from '../components/Field.tsx';
import { VirtualList } from '../components/VirtualList.tsx';
import { usePolled } from '../lib/usePolled.ts';
import { useEvents } from '../store/events.ts';

const STATUS_TONE = {
  connecting: 'var(--skin-warn)',
  open: 'var(--skin-ok)',
  reconnected: 'var(--skin-warn)',
  closed: 'var(--skin-danger)',
} as const;

export function TelemetryRail() {
  const { data: health } = usePolled<HealthResponse>('/v1/health', 5000);
  const { data: stats } = usePolled<RuntimeStats>('/v1/runtime/stats', 4000);

  const events = useEvents((state) => state.events);
  const status = useEvents((state) => state.status);
  const received = useEvents((state) => state.received);
  const dropped = useEvents((state) => state.dropped);

  const metrics = stats?.request_metrics;

  return (
    <div className="flex h-full flex-col gap-4 p-3">
      <section>
        <h2 className="micro-label mb-2">runtime</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="service" value={health?.service ?? '—'} />
          <Stat label="version" value={health?.version ?? '—'} />
          <Stat label="loaded" value={stats?.current_loaded_models ?? '—'} />
          <Stat label="queue depth" value={stats?.queue_depth ?? '—'} />
          <Stat label="sessions" value={stats?.active_sessions ?? '—'} />
          <Stat label="policy" value={stats?.runtime_policy ?? '—'} />
        </div>
      </section>

      <section>
        <h2 className="micro-label mb-2">requests</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="total" value={metrics?.total_requests ?? '—'} />
          <Stat label="failed" value={metrics?.failure_count ?? '—'} />
          <Stat
            label="avg exec"
            value={
              metrics?.average_execution_seconds != null
                ? `${(metrics.average_execution_seconds * 1000).toFixed(0)}ms`
                : '—'
            }
          />
          <Stat
            label="tok/s (avg)"
            value={metrics?.average_completion_tokens_per_second?.toFixed(1) ?? '—'}
          />
        </div>
      </section>

      <section className="flex min-h-0 flex-1 flex-col">
        <h2 className="micro-label mb-2 flex items-center gap-2">
          events
          <span className="dot" style={{ color: STATUS_TONE[status] }} />
          <span className="numeric" style={{ color: 'var(--skin-faint)' }}>
            {received}
            {dropped > 0 ? ` · ${dropped} aged out` : ''}
          </span>
        </h2>

        {events.length === 0 ? (
          <p className="micro-label">idle — send a request and watch it arrive</p>
        ) : (
          <VirtualList items={events} rowHeight={18} follow className="hairline flex-1 border-t pt-1">
            {(record) => <EventRow record={record} compact />}
          </VirtualList>
        )}
      </section>
    </div>
  );
}
