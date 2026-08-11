import { useEffect, useState, type ComponentType } from 'react';

import type { HealthResponse } from '@chap/lewlm';

import { NavItem, StatusDot } from './components/Nav.tsx';
import { ChatScreen } from './chat/ChatScreen.tsx';
import { LabScreen } from './lab/LabScreen.tsx';
import { moduleScreens } from './modules.ts';
import { OpsScreen } from './ops/OpsScreen.tsx';
import { SettingsScreen } from './settings/SettingsScreen.tsx';
import { lewlm } from './lib/client.ts';
import { AppShell } from './shell/AppShell.tsx';
import { TelemetryRail } from './shell/TelemetryRail.tsx';
import { useNav } from './store/nav.ts';
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

  const Main = (SCREENS.find((entry) => entry.id === screen) ?? SCREENS[0]!).component;

  return (
    <AppShell
      nav={SCREENS.map(({ id, label }) => (
        <NavItem key={id} label={label} active={screen === id} onSelect={() => go(id)} />
      ))}
      main={<Main />}
      rail={<TelemetryRail />}
      status={<ConnectionStatus />}
    />
  );
}

function ConnectionStatus() {
  const [health, setHealth] = useState<HealthResponse | null | 'down'>(null);

  useEffect(() => {
    let live = true;
    const poll = () =>
      lewlm
        .request<HealthResponse>('GET', '/v1/health')
        .then((next) => live && setHealth(next))
        .catch(() => live && setHealth('down'));
    void poll();
    const timer = setInterval(poll, 5000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, []);

  if (health === 'down') return <StatusDot tone="danger">LewLM unreachable</StatusDot>;
  if (!health) return <StatusDot tone="warn">connecting</StatusDot>;
  return <StatusDot tone="ok">{`LewLM ${health.version}`}</StatusDot>;
}
