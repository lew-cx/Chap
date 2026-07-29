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

import { useState } from 'react';

import { CONTRACT, EVENT_TYPES, ERROR_CODES, type HealthResponse } from '@chap/lewlm';

import { Disclosure } from '../components/Disclosure.tsx';
import { Stat } from '../components/Field.tsx';
import { StatusDot } from '../components/Nav.tsx';
import { Screen, Section } from '../components/Screen.tsx';
import { usePolled } from '../lib/usePolled.ts';
import { SkinPanel } from '../shell/SkinPanel.tsx';

const TABS = ['appearance', 'contract', 'gaps'] as const;
type Tab = (typeof TABS)[number];

export function SettingsScreen() {
  const [tab, setTab] = useState<Tab>('appearance');

  return (
    <Screen tabs={TABS} active={tab} onSelect={setTab}>
      {tab === 'appearance' && <Appearance />}
      {tab === 'contract' && <Contract />}
      {tab === 'gaps' && <Gaps />}
    </Screen>
  );
}

const Appearance = SkinPanel;

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
    id: 'G24',
    title: 'models/scan rewrites the registry and reports no change',
    effect:
      'The rescan button on the Models tab carries a warning instead of being routine. Discovery does not recognize its own conversion output, so a scan has demoted converted MLX bundles to requires_conversion while reporting updated_count: 0.',
  },
  {
    id: 'G19',
    title: 'no serving-profile listing',
    effect:
      'Ops can show the profile a run applied and the recommendation autotune just produced, but not what profiles exist — so the tuning loop has no memory in the UI.',
  },
];

function Gaps() {
  return (
    <Section title="open gaps" hint={`${OPEN_GAPS.length} open · 11 fixed upstream`}>
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
        Every other entry this project has raised is closed — 19 checks pass and
        11 gaps have been fixed upstream. Each open gap has a probe in `npm run
        proof` that flips from gap to FIXD when LewLM gains the capability, except
        G24, which cannot be probed without mutating the registry. Full detail in
        docs/lewlm-gaps.md.
      </p>
    </Section>
  );
}
