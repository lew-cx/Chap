import { useEffect, type ComponentType } from 'react';

import type { HealthResponse } from '@chap/lewlm';

import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { NavItem, StatusDot } from './components/Nav.tsx';
import { ChatScreen } from './chat/ChatScreen.tsx';
import { LabScreen } from './lab/LabScreen.tsx';
import { moduleScreens } from './modules.ts';
import { OpsScreen } from './ops/OpsScreen.tsx';
import { SettingsScreen } from './settings/SettingsScreen.tsx';
import { usePolled } from './lib/usePolled.ts';
import { AppShell } from './shell/AppShell.tsx';
import { TelemetryRail } from './shell/TelemetryRail.tsx';
import { registerNavHistory, useNav } from './store/nav.ts';
import { registerSkinShortcut } from './store/skin.ts';

/**
 * The primary nav. The four screens Chap owns, then whatever the registry adds.
 *
 * The spread is the only thing in this file that knows modules exist, and it
 * knows nothing about which ones — see modules.ts.
 */
const SCREENS: { id: string; label: string; component: ComponentType }[] = [
  { id: 'chat', label: 'Chat', component: ChatScreen },
  { id: 'ops', label: 'Ops', component: OpsScreen },
  { id: 'lab', label: 'Lab', component: LabScreen },
  { id: 'settings', label: 'Settings', component: SettingsScreen },
  ...moduleScreens(),
];

export function App() {
  const screen = useNav((state) => state.screen);
  const go = useNav((state) => state.go);

  useEffect(registerSkinShortcut, []);
  useEffect(registerNavHistory, []);

  const active = SCREENS.find((entry) => entry.id === screen) ?? SCREENS[0]!;
  const Main = active.component;

  return (
    <AppShell
      nav={SCREENS.map(({ id, label }) => (
        <NavItem key={id} label={label} active={active.id === id} onSelect={() => go(id)} />
      ))}
      main={
        /*
         * A render-time throw anywhere below here would otherwise unmount the
         * whole tree and leave a blank page that only a reload recovers from.
         * Keyed by screen so navigating away resets a failed one.
         */
        <ErrorBoundary key={active.id} label={active.label}>
          <Main />
        </ErrorBoundary>
      }
      rail={
        <ErrorBoundary label="telemetry">
          <TelemetryRail />
        </ErrorBoundary>
      }
      status={<ConnectionStatus />}
    />
  );
}

function ConnectionStatus() {
  // The shared poller: the rail and the ops overview read the same path, and
  // this used to be a third hand-rolled interval alongside them.
  const { data: health, error } = usePolled<HealthResponse>('/v1/health', 5000);

  if (error) return <StatusDot tone="danger">LewLM unreachable</StatusDot>;
  if (!health) return <StatusDot tone="warn">connecting</StatusDot>;
  return <StatusDot tone="ok">{`LewLM ${health.version}`}</StatusDot>;
}
