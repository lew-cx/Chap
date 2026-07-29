/**
 * The operations console.
 *
 * Six tabs over ~15 LewLM routes. Every panel is a `usePolled` call and a
 * layout — there is no ops logic in Chap, because LewLM already computes
 * everything an operator needs and Chap's job is to show it without editorializing.
 */

import { useState } from 'react';

import { Screen } from '../components/Screen.tsx';
import { Events } from './Events.tsx';
import { Jobs } from './Jobs.tsx';
import { Models } from './Models.tsx';
import { Overview } from './Overview.tsx';
import { Runtime } from './Runtime.tsx';

const TABS = ['overview', 'models', 'runtime', 'events', 'jobs'] as const;
type Tab = (typeof TABS)[number];

export function OpsScreen() {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <Screen tabs={TABS} active={tab} onSelect={setTab}>
      {tab === 'overview' && <Overview />}
      {tab === 'models' && <Models />}
      {tab === 'runtime' && <Runtime />}
      {tab === 'events' && <Events />}
      {tab === 'jobs' && <Jobs />}
    </Screen>
  );
}
