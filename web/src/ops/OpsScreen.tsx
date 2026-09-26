/**
 * The operations console.
 *
 * Six tabs over ~15 LewLM routes. Every panel is a `usePolled` call and a
 * layout — there is no ops logic in Chap, because LewLM already computes
 * everything an operator needs and Chap's job is to show it without editorializing.
 */

import { Screen } from '../components/Screen.tsx';
import { useModuleTabs } from '../modules.ts';
import { Events } from './Events.tsx';
import { Jobs } from './Jobs.tsx';
import { Models } from './Models.tsx';
import { Overview } from './Overview.tsx';
import { Runtime } from './Runtime.tsx';

export function OpsScreen() {
  const moduleTabs = useModuleTabs('ops');
  return (
    <Screen
      tabs={[
        { id: 'overview', component: Overview },
        { id: 'models', component: Models },
        { id: 'runtime', component: Runtime },
        { id: 'events', component: Events },
        { id: 'jobs', component: Jobs },
        ...moduleTabs,
      ]}
    />
  );
}
