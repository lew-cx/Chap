/**
 * Conversions, jobs and autotune — the long-running work.
 *
 * Everything here is asynchronous in LewLM, so everything here polls: plan a
 * conversion, start it, watch the job record change state. Autotune produces a
 * serving profile that the chat screen's `apply_serving_profile` then consumes,
 * which is the loop worth being able to close inside one GUI.
 */

import { useState } from 'react';

import type {
  ConversionPlan,
  JobRecord,
  ModelInventory,
  ServingProfileRecommendation,
  ServingProfileInventory,
} from '@chap/lewlm';

import { Disclosure } from '../components/Disclosure.tsx';
import { Labelled, Stat } from '../components/Field.tsx';
import { Json } from '../components/Json.tsx';
import { Missing, Section } from '../components/Screen.tsx';
import { lewlm } from '../lib/client.ts';
import { shortModelId } from '../lib/useModels.ts';
import { usePolled } from '../lib/usePolled.ts';

export function Jobs() {
  const { data: inventory } = usePolled<ModelInventory>('/v1/models', 30_000);
  const [modelId, setModelId] = useState('');
  const [plan, setPlan] = useState<ConversionPlan | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [tune, setTune] = useState<ServingProfileRecommendation | null>(null);
  const [preset, setPreset] = useState<'interactive' | 'throughput'>('interactive');
  const [busy, setBusy] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  // Once a job exists, poll it. `usePolled(null)` is the idle state.
  const job = usePolled<JobRecord>(jobId ? `/v1/jobs/${jobId}` : null, 2000);
  const profiles = usePolled<ServingProfileInventory>('/v1/serving-profiles', 15_000);

  const act = async (label: string, work: () => Promise<unknown>) => {
    setBusy(label);
    setFailure(null);
    try {
      await work();
    } catch (cause) {
      setFailure(`${label}: ${cause instanceof Error ? cause.message : String(cause)}`);
    } finally {
      setBusy(null);
    }
  };

  const needConversion = (inventory?.items ?? []).filter(
    (item) => item.conversion_status !== 'runnable',
  );

  // The target the run button will actually send. LewLM normally makes its
  // default the convertible one, but the contract does not promise that, so the
  // button is enabled by the target it sends rather than by any target at all.
  const convertible =
    (plan?.targets ?? []).find(
      (target) => target.target_id === plan?.default_target_id && target.can_convert,
    ) ?? (plan?.targets ?? []).find((target) => target.can_convert);

  return (
    <>
      <Section title="conversion" hint={`${needConversion.length} models need one`}>
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <Labelled label="model">
            <select
              className="field max-w-96 truncate"
              value={modelId}
              onChange={(event) => {
                setModelId(event.target.value);
                setPlan(null);
              }}
            >
              <option value="">select a model</option>
              {(inventory?.items ?? []).map((item) => (
                <option key={item.model_id} value={item.model_id} title={item.model_id}>
                  {shortModelId(item.display_name || item.model_id)}
                  {item.conversion_status === 'runnable' ? ' (runnable)' : ''}
                </option>
              ))}
            </select>
          </Labelled>

          <button
            type="button"
            className="btn"
            disabled={!modelId || busy != null}
            onClick={() =>
              void act('plan', async () => {
                setPlan(
                  await lewlm.request<ConversionPlan>('POST', '/v1/lewlm/conversions/plan', {
                    json: { model_id: modelId },
                  }),
                );
              })
            }
          >
            plan
          </button>

          <button
            type="button"
            className="btn"
            disabled={!convertible || busy != null}
            onClick={() =>
              void act('convert', async () => {
                const record = await lewlm.request<JobRecord>('POST', '/v1/lewlm/conversions', {
                  json: { model_id: modelId, target_id: convertible?.target_id },
                });
                setJobId(record.job_id);
              })
            }
          >
            run conversion
          </button>
        </div>

        {plan && (
          <>
            <div className="panel mb-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="source" value={plan.source_format} />
              <Stat label="status" value={plan.conversion_status} />
              <Stat label="default target" value={plan.default_target_id ?? '—'} />
              <Stat label="targets" value={(plan.targets ?? []).length} />
            </div>
            <Disclosure label="conversion targets" hint={plan.targets?.[0]?.reason}>
              <Json value={plan.targets} maxHeight="20rem" />
            </Disclosure>
          </>
        )}
      </Section>

      <Section title="job" hint={jobId ?? 'none started'}>
        {job.data ? (
          <>
            <div className="panel mb-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="type" value={job.data.job_type} />
              <Stat label="status" value={job.data.status} />
              <Stat label="created" value={job.data.created_at?.slice(11, 19) ?? '—'} />
              <Stat label="updated" value={job.data.updated_at?.slice(11, 19) ?? '—'} />
            </div>
            <Disclosure label="job record">
              <Json value={job.data} maxHeight="20rem" />
            </Disclosure>
          </>
        ) : (
          <Missing>plan and run a conversion to watch a job record change state</Missing>
        )}
      </Section>

      <Section title="autotune">
        {/* Produces a serving-profile recommendation the chat screen can apply. */}
        <Labelled label="preset">
          <select className="field mb-2" value={preset} onChange={(event) => setPreset(event.target.value as typeof preset)}>
            <option value="interactive">interactive · latency first</option>
            <option value="throughput">throughput</option>
          </select>
        </Labelled>
        <button
          type="button"
          className="btn"
          disabled={!modelId || busy != null}
          onClick={() =>
            void act('autotune', async () => {
              setTune(
                await lewlm.request<ServingProfileRecommendation>('POST', '/v1/benchmarks/autotune', {
                  json: { model_id: modelId, prompt: 'Benchmark ping', capability: 'chat', preset },
                }),
              );
            })
          }
        >
          autotune the selected model
        </button>

        {tune ? (
          <div className="mt-2">
            <Disclosure label="recommendation" open>
              <Json value={tune} maxHeight="20rem" />
            </Disclosure>
          </div>
        ) : (
          <p className="micro-label mt-2">
            run autotune to inspect a recommendation for the selected model
          </p>
        )}
      </Section>

      <Section title="serving profiles" hint={`${profiles.data?.count ?? 0} persisted`}>
        <Disclosure label="measured profiles" open>
          <Json value={profiles.data ?? { count: 0, items: [] }} maxHeight="24rem" />
        </Disclosure>
      </Section>

      {busy && <p className="micro-label">{busy}…</p>}
      {failure && (
        <p className="numeric" style={{ color: 'var(--skin-danger)' }}>
          {failure}
        </p>
      )}
    </>
  );
}
