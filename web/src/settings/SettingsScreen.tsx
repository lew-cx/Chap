/**
 * Settings, and the two panels that make Chap's claims checkable.
 *
 * Skin-blind, like every other screen: the skin control and the token inspector
 * live in `shell/SkinPanel.tsx`, because only the shell is allowed to know a
 * skin exists. This file renders that panel and knows nothing about it.
 *
 * The **contract badge** compares the version Chap's types were generated from
 * against the version answering right now. A test bench that silently runs
 * against a contract it was not built for is worse than useless.
 */

import { CONTRACT, EVENT_TYPES, ERROR_CODES, type HealthResponse } from '@chap/lewlm';

import { Disclosure } from '../components/Disclosure.tsx';
import { OPEN_GAPS, PROOF_SUITES } from '../generated/proof.ts';
import { Stat } from '../components/Field.tsx';
import { StatusDot } from '../components/Nav.tsx';
import { Screen, Section } from '../components/Screen.tsx';
import { Table } from '../components/Table.tsx';
import { useDormantCompanions, useModuleList } from '../lib/useModules.ts';
import { usePolled } from '../lib/usePolled.ts';
import { useModuleTabs } from '../modules.ts';
import { SkinPanel } from '../shell/SkinPanel.tsx';

export function SettingsScreen() {
  const moduleTabs = useModuleTabs('settings');
  return (
    <Screen
      tabs={[
        { id: 'appearance', component: SkinPanel },
        { id: 'contract', component: Contract },
        { id: 'modules', component: Modules },
        { id: 'gaps', component: Gaps },
        ...moduleTabs,
      ]}
    />
  );
}

function Contract() {
  const { data: health } = usePolled<HealthResponse>('/v1/health', 10_000);
  const drifted = health != null && health.version !== CONTRACT.lewlmVersion;

  return (
    <>
      <Section title="generated from">
        <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="lewlm version" value={CONTRACT.lewlmVersion} />
          <Stat label="live version" value={health?.version ?? '—'} />
          <Stat label="generated" value={CONTRACT.generatedAt?.slice(0, 10) ?? '—'} />
          <div className="flex flex-col gap-0.5">
            <span className="micro-label">status</span>
            {drifted ? (
              <StatusDot tone="warn">contract drift — run npm run gen:types</StatusDot>
            ) : (
              <StatusDot tone="ok">types match the live contract</StatusDot>
            )}
          </div>
        </div>
      </Section>

      <Section
        title="what is generated"
        hint="none of this is hand-written"
      >
        <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="event types" value={EVENT_TYPES.length} />
          <Stat label="error codes" value={ERROR_CODES.length} />
          <Stat label="bundle format" value={CONTRACT.bundleFormat ?? '—'} />
          <Stat label="sources" value={2} />
        </div>
        <p className="micro-label mt-2">
          Two sources, exactly complementary: the integration bundle carries the
          streaming and request shapes OpenAPI omits, OpenAPI carries every route.
        </p>
      </Section>

      <Section title="source fingerprints">
        <Disclosure label="checked-in contract metadata">
          <pre className="code scroll-thin overflow-auto" style={{ maxHeight: '16rem' }}>
            {JSON.stringify(CONTRACT, null, 2)}
          </pre>
        </Disclosure>
      </Section>
    </>
  );
}

/**
 * What is installed beyond LewLM, and whether it can actually work.
 *
 * The list is the server's, not this file's — Settings does not know which
 * modules exist any more than App does. An unready module names the env keys it
 * reads, because "which variable did I forget" is the question this panel exists
 * to answer.
 */
function Modules() {
  const modules = useModuleList();
  const dormant = useDormantCompanions();

  return (
    <>
      <Section title="installed modules" hint={`${modules.length} · LewLM is core, not a module`}>
        <Table
          columns={[
            { key: 'id', label: 'module', render: (row) => row.label },
            { key: 'prefix', label: 'mounted at', render: (row) => row.prefix },
            {
              key: 'ready',
              label: 'status',
              render: (row) =>
                row.ready ? (
                  <StatusDot tone="ok">ready</StatusDot>
                ) : (
                  <StatusDot tone="warn">{row.reason ?? 'not ready'}</StatusDot>
                ),
            },
            { key: 'env', label: 'reads', render: (row) => row.env.join(' · ') || '—' },
          ]}
          rows={modules}
          empty="none installed — Chap is a LewLM client and nothing else"
        />
      </Section>
      {dormant.length > 0 && (
        <Section title="companions available" hint="off · other products built on LewLM">
          <p className="text-sm">
            Adapters for testing other LewLM-based products through Chap. Chap does not need
            them. To turn one on, set{' '}
            <span className="numeric">CHAP_COMPANIONS={dormant.join(',')}</span> in{' '}
            <span className="numeric">.env</span> and restart the server.
          </p>
        </Section>
      )}
    </>
  );
}

/**
 * Open gaps, generated from the proof rather than kept in step with it by hand.
 *
 * This list is deliberately short and deliberately visible. Chap's premise is
 * that it stays thin; the moment it has to work around something, that shows up
 * here rather than being quietly absorbed into the code.
 *
 * The list and the tallies come from `web/src/generated/proof.ts`, written by
 * `npm run gen:gaps` from a live run of every proof. The hand-written array this
 * replaced had drifted from both the doc and the proof — it named two gaps that
 * had closed and omitted the two that were open, on the one screen a visitor
 * reads to judge whether the project's central claim is honest.
 *
 * What is NOT generated is the cost of each workaround, below: a probe can
 * observe that a capability is missing, not what its absence costs Chap. An id
 * with no entry here still lists, with the upstream's own note and nothing
 * invented to fill the space.
 */
const WORKAROUND_COST: Record<string, string> = {
  G1: 'An environment fact, not a contract gap. This server was started without CORS, so a browser cannot call LewLM directly and chap-server proxies every request. Chap would keep the proxy regardless — it is where the API key lives — so the cost here is zero and the probe exists to keep that honest.',
  G30: 'A fixture limitation, not a current contract gap. The fake bridge cannot exercise llama.cpp decode-time grammar enforcement; LewLM\'s real-runtime proof covers the fix.',
};

function Gaps() {
  const totals = PROOF_SUITES.reduce(
    (sum, suite) => ({
      passed: sum.passed + suite.passed,
      gaps: sum.gaps + suite.gaps,
      fixed: sum.fixed + suite.fixed,
    }),
    { passed: 0, gaps: 0, fixed: 0 },
  );

  return (
    <>
      <Section
        title="open gaps"
        hint={`${OPEN_GAPS.length} open · ${totals.fixed} fixed upstream`}
      >
        {/*
         * The collapsed line is the probe's OBSERVATION, not its title. A gap
         * probe is named for the capability it tests — "CORS is available",
         * "sampling controls are applied" — which reads as a claim rather than a
         * lack when it is listed under "open gaps". What the probe saw says the
         * true thing in the upstream's own words and needs no rewording here.
         */}
        <div className="flex flex-col gap-2">
          {OPEN_GAPS.map((gap) => (
            <Disclosure key={gap.id} label={gap.id} hint={gap.note} flagged>
              {/* Every probe is named for the capability it tests, so this line
                  is what Chap is asking the upstream for. */}
              <p className="text-sm" style={{ color: 'var(--skin-ink)' }}>
                Asks for: {gap.title}.
              </p>
              <p className="numeric mt-1" style={{ color: 'var(--skin-faint)' }}>
                confirmed open by `npm run {gap.suite}`
              </p>
              {WORKAROUND_COST[gap.id] && (
                <p className="mt-2 text-sm" style={{ color: 'var(--skin-muted)' }}>
                  {WORKAROUND_COST[gap.id]}
                </p>
              )}
            </Disclosure>
          ))}
        </div>
        {OPEN_GAPS.length === 0 && (
          <p className="micro-label">
            no gaps confirmed by the last proof run — every workaround has been deleted
          </p>
        )}
      </Section>

      <Section title="the run this is generated from" hint="npm run gen:gaps">
        <Table
          columns={[
            { key: 'script', label: 'proof', render: (row) => row.script },
            { key: 'ran', label: 'ran', render: (row) => row.ranAt.slice(0, 16).replace('T', ' ') },
            { key: 'passed', label: 'passed', numeric: true, render: (row) => row.passed },
            { key: 'failed', label: 'failed', numeric: true, render: (row) => row.failed },
            { key: 'gaps', label: 'gaps', numeric: true, render: (row) => row.gaps },
            { key: 'fixed', label: 'fixed upstream', numeric: true, render: (row) => row.fixed },
          ]}
          rows={[...PROOF_SUITES]}
        />
        <p className="micro-label mt-3">
          {totals.passed} checks pass against live services and {totals.gaps}{' '}
          {totals.gaps === 1 ? 'gap is' : 'gaps are'} confirmed. This screen cannot claim a gap the
          proof does not, or miss one it does — the list is generated from the run above rather than
          written here. Full detail is in docs/lewlm-gaps.md.
        </p>
      </Section>
    </>
  );
}
