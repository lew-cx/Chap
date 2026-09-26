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

/** `0.4.2 · 522cba4+dirty`: the version, and which source it was built from. */
function buildLabel(build: RuntimeInfo['build'] | undefined): string {
  if (!build) return '—';
  const commit = build.source_commit ? ` · ${build.source_commit.slice(0, 7)}${build.source_dirty ? '+dirty' : ''}` : '';
  return `${build.package_version}${commit}`;
}

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
          <Stat label="build" value={buildLabel(info?.build)} />
          <Stat label="hostname" value={info?.hostname ?? '—'} />
          <Stat label="pid" value={info?.process_id ?? '—'} />
          {/* An object, not a string. The release is kept: it is how a Linux
              container running under WSL2 on a Windows host tells you so. */}
          <Stat
            label="platform"
            value={stats?.platform ? `${stats.platform.system} ${stats.platform.machine} · ${stats.platform.release}` : '—'}
          />
          <Stat label="policy" value={stats?.runtime_policy ?? '—'} />
          <Stat label="loaded models" value={info?.loaded_model_count ?? '—'} />
          <Stat label="active requests" value={info?.active_request_count ?? '—'} />
        </div>
      </Section>

      <InstallSection install={health?.install_profiles} />

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

type Install = HealthResponse['install_profiles'];

/**
 * What this host can run, as LewLM reports it about itself.
 *
 * This is the part of the runtime tab that differs by platform. The same Chap
 * points at a Mac with `mlx_local_backend`, a Windows box with a CPU llama.cpp
 * wheel, or a CUDA container, and the only honest way to tell them apart is to
 * show what LewLM found rather than to guess from a user agent.
 */
function InstallSection({ install }: { install: Install | undefined }) {
  const build = install?.llamacpp_build;
  const missing = build?.missing_cpu_features ?? [];
  const container = install?.container;
  const active = new Set(install?.active_profile_ids ?? []);

  return (
    <Section title="this host's install" hint={install?.recommended_profile_id ? `recommends ${install.recommended_profile_id}` : undefined}>
      <div className="flex flex-col gap-2">
        <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="llama.cpp" value={build ? (build.installed ? build.detection_state : 'not installed') : '—'} />
          <Stat
            label="gpu offload"
            value={build?.gpu_offload_supported == null ? 'unknown' : build.gpu_offload_supported ? 'yes' : 'no — CPU build'}
          />
          <Stat label="accelerator hints" value={build?.accelerator_hints?.length ? build.accelerator_hints.join(' ') : 'none'} />
          <Stat
            label="container"
            value={container ? (container.in_container ? `${container.runtime ?? 'yes'}${container.image_flavor ? ` · ${container.image_flavor}` : ''}` : 'native host') : '—'}
          />
          {/*
           * The one line here that predicts a crash. A wheel built for CPU
           * features this host lacks imports fine and dies with an illegal
           * instruction at the first model load; LewLM compares the build's
           * features with the host's so it can be said before that happens.
           */}
          {missing.length > 0 && (
            <p className="col-span-2 sm:col-span-4 text-sm" role="alert" style={{ color: 'var(--skin-danger)' }}>
              this llama.cpp build needs {missing.join(', ')}, which this CPU does not have — the first model load will
              fail. Rebuild it without them (GGML_NATIVE=OFF) or install a wheel built for this host.
            </p>
          )}
          {build?.system_info && (
            <p className="numeric col-span-2 sm:col-span-4 break-all" style={{ color: 'var(--skin-faint)' }}>
              {build.system_info}
            </p>
          )}
        </div>

        <Disclosure label="install profiles" hint={`${active.size} active`} open>
          <div className="flex flex-col">
            {(install?.profiles ?? []).map((profile) => (
              <div key={profile.profile} className="row grid grid-cols-[minmax(0,14rem)_6rem_minmax(0,1fr)] items-baseline gap-3 py-1">
                <span className="numeric truncate" title={profile.install_spec}>
                  {profile.profile}
                </span>
                <span
                  className="micro-label"
                  style={{ color: profile.ready ? 'var(--skin-ok)' : profile.installed ? 'var(--skin-warn)' : 'var(--skin-faint)' }}
                >
                  {profile.ready ? 'ready' : profile.installed ? 'not ready' : 'absent'}
                </span>
                <span className="min-w-0 text-sm" title={(profile.notes ?? []).join(' ') || undefined}>
                  {profile.summary}
                </span>
              </div>
            ))}
          </div>
        </Disclosure>

        <Disclosure label="backend modules" hint={`${(install?.backend_inventory ?? []).filter((entry) => entry.installed).length} importable`}>
          <Json value={install?.backend_inventory ?? []} maxHeight="18rem" />
        </Disclosure>
      </div>
    </Section>
  );
}
