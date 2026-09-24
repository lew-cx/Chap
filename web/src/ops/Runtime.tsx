/**
 * Host, runtime and cache state.
 *
 * `/v1/runtime/stats` returns a great deal — 30-odd top-level sections. Chap
 * promotes the numbers a bench watches while working and leaves the rest as
 * inspectable JSON rather than inventing a layout for every field LewLM might
 * add. That way a new section in LewLM shows up here without a Chap change.
 */

import type { CacheStats, HealthResponse, RuntimeInfo, RuntimeStats } from '@chap/lewlm';

import { Disclosure } from '../components/Disclosure.tsx';
import { Stat } from '../components/Field.tsx';
import { Json } from '../components/Json.tsx';
import { Section } from '../components/Screen.tsx';
import { usePolled } from '../lib/usePolled.ts';

const bytes = (value: number | undefined | null): string =>
  value == null ? '—' : value > 1e9 ? `${(value / 1e9).toFixed(2)}G` : `${(value / 1e6).toFixed(1)}M`;

export function Runtime() {
  const { data: info } = usePolled<RuntimeInfo>('/v1/runtime', 5000);
  const { data: stats } = usePolled<RuntimeStats>('/v1/runtime/stats', 4000);
  const { data: cache } = usePolled<CacheStats>('/v1/cache/stats', 8000);
  const { data: health } = usePolled<HealthResponse>('/v1/health', 5000);

  const metrics = stats?.request_metrics;
  const hits = (cache?.cache_hits ?? 0) + (cache?.block_cache_hits ?? 0);
  const misses = (cache?.cache_misses ?? 0) + (cache?.block_cache_misses ?? 0);
  const hitRate = hits + misses > 0 ? `${((hits / (hits + misses)) * 100).toFixed(0)}%` : '—';

  return (
    <>
      <Section title="host" hint={info?.status}>
        <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="version" value={info?.version ?? '—'} />
          <Stat label="build" value={typeof info?.build === 'string' ? info.build : '—'} />
          <Stat label="hostname" value={info?.hostname ?? '—'} />
          <Stat label="pid" value={info?.process_id ?? '—'} />
          <Stat label="platform" value={String(stats?.platform ?? '—')} />
          <Stat label="policy" value={stats?.runtime_policy ?? '—'} />
          <Stat label="loaded models" value={info?.loaded_model_count ?? '—'} />
          <Stat label="active requests" value={info?.active_request_count ?? '—'} />
        </div>
      </Section>

      <Section title="requests">
        <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="total" value={metrics?.total_requests ?? '—'} />
          <Stat label="failed" value={metrics?.failure_count ?? '—'} />
          <Stat label="queue depth" value={stats?.queue_depth ?? '—'} />
          <Stat label="active jobs" value={stats?.active_jobs ?? '—'} />
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
          <Stat label="sessions" value={stats?.active_sessions ?? '—'} />
          <Stat label="max body" value={bytes(stats?.request_max_bytes)} />
        </div>
      </Section>

      <Section title="cache" hint={`hit rate ${hitRate}`}>
        <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="total size" value={bytes(cache?.total_size_bytes)} />
          <Stat label="files" value={cache?.file_count ?? '—'} />
          <Stat label="artifacts" value={cache?.artifact_count ?? '—'} />
          <Stat label="blocks" value={cache?.block_cache_count ?? '—'} />
          <Stat label="block bytes" value={bytes(cache?.block_cache_bytes)} />
          <Stat label="hits" value={hits} />
          <Stat label="misses" value={misses} />
          <Stat label="conversions" value={cache?.conversion_cache_hits ?? '—'} />
        </div>
      </Section>

      <Section title="residency">
        <Disclosure label="loaded models" hint={stats?.current_loaded_models ?? 0} open>
          <Json value={stats?.residencies ?? []} maxHeight="18rem" />
        </Disclosure>
      </Section>

      <Section title="startup and environment">
        <div className="flex flex-col gap-2">
          <Disclosure label="startup phases" hint={`${info?.startup?.engines?.length ?? 0} engines`} open>
            <Json value={info?.startup} maxHeight="20rem" />
          </Disclosure>
          <Disclosure label="container and storage">
            <Json value={{ container: health?.install_profiles.container, storage_access: health?.install_profiles.storage_access }} maxHeight="16rem" />
          </Disclosure>
          <Disclosure label="external endpoints">
            <Json value={health?.install_profiles.external_endpoints ?? []} maxHeight="18rem" />
          </Disclosure>
        </div>
      </Section>

      {/* Everything else LewLM reports, unabridged. A section Chap does not know
          about is still visible here the day LewLM adds it. */}
      <Section title="full snapshot">
        <div className="flex flex-col gap-2">
          <Disclosure label="runtimes" hint={Object.keys(stats?.runtimes ?? {}).length}>
            <Json value={stats?.runtimes} />
          </Disclosure>
          <Disclosure label="readiness">
            <Json value={stats?.readiness} />
          </Disclosure>
          <Disclosure label="schedulers">
            <Json value={{ request: stats?.request_scheduler, load: stats?.load_scheduler }} />
          </Disclosure>
          <Disclosure label="serving core">
            <Json value={stats?.serving_core} />
          </Disclosure>
          <Disclosure label="feature packs">
            <Json value={{ feature_packs: stats?.feature_packs, runtime_packs: stats?.runtime_packs }} />
          </Disclosure>
          <Disclosure label="cache detail">
            <Json value={cache} />
          </Disclosure>
        </div>
      </Section>
    </>
  );
}
