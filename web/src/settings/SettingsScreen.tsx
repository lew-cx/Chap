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
import { Stat } from '../components/Field.tsx';
import { StatusDot } from '../components/Nav.tsx';
import { Screen, Section } from '../components/Screen.tsx';
import { Table } from '../components/Table.tsx';
import { useModuleList } from '../lib/useModules.ts';
import { usePolled } from '../lib/usePolled.ts';
import { moduleTabs } from '../modules.ts';
import { SkinPanel } from '../shell/SkinPanel.tsx';

export function SettingsScreen() {
  return (
    <Screen
      tabs={[
        { id: 'appearance', component: SkinPanel },
        { id: 'contract', component: Contract },
        { id: 'modules', component: Modules },
        { id: 'gaps', component: Gaps },
        ...moduleTabs('settings'),
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

  return (
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
  );
}

/**
 * Open gaps, kept in step with `docs/lewlm-gaps.md` and `npm run proof`.
 *
 * This list is deliberately short and deliberately visible. Chap's premise is
 * that it stays thin; the moment it has to work around something, that shows up
 * here rather than being quietly absorbed into the code.
 */
const OPEN_GAPS: { id: string; title: string; effect: string }[] = [
  {
    id: 'G13',
    title: '/v1/events has no filtering or replay',
    effect:
      'Every token.delta of every request reaches the browser and is filtered here. Chap absorbs it with a 5,000-entry ring, a throttled flush and a virtualized list; a reconnect leaves an explicit gap marker because the window cannot be recovered. The one open gap that costs Chap real code.',
  },
  {
    id: 'G29',
    title: 'streamed text is correct but not incremental on the MLX runtime',
    effect:
      'On some prompts the whole reply arrives as a single delta, so time-to-first-token equals time-to-last-token. Streaming is honoured as a transport but not as a behaviour. Chap reports it rather than hiding it with model-specific routing — it is also why spoken replies lose their head start on that path.',
  },
];

function Gaps() {
  return (
    <Section title="open gaps" hint={`${OPEN_GAPS.length} open · 15 fixed upstream`}>
      <div className="flex flex-col gap-2">
        {OPEN_GAPS.map((gap) => (
          <Disclosure key={gap.id} label={gap.id} hint={gap.title}>
            <p className="text-sm" style={{ color: 'var(--skin-muted)' }}>
              {gap.effect}
            </p>
          </Disclosure>
        ))}
      </div>
      <p className="micro-label mt-3">
        The live proof currently passes 23 checks and confirms the runtime-specific
        gaps it can exercise. G13 is tracked structurally because replay cannot be
        proved from an endpoint that does not offer it. Full detail is in
        docs/lewlm-gaps.md.
      </p>
    </Section>
  );
}
