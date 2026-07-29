import { useEffect, useState } from 'react';

import type { DocumentChunk, HealthResponse } from '@chap/lewlm';

import { NavItem, StatusDot } from './components/Nav.tsx';
import { ChatScreen } from './chat/ChatScreen.tsx';
import { LabScreen } from './lab/LabScreen.tsx';
import { OpsScreen } from './ops/OpsScreen.tsx';
import { SettingsScreen } from './settings/SettingsScreen.tsx';
import { lewlm } from './lib/client.ts';
import { AppShell } from './shell/AppShell.tsx';
import { TelemetryRail } from './shell/TelemetryRail.tsx';
import { registerSkinShortcut } from './store/skin.ts';

type Screen = 'chat' | 'ops' | 'lab' | 'settings';

const SCREENS: { id: Screen; label: string }[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'ops', label: 'Ops' },
  { id: 'lab', label: 'Lab' },
  { id: 'settings', label: 'Settings' },
];

export function App() {
  const [screen, setScreen] = useState<Screen>('chat');
  /**
   * Chunks handed over from the Lab's knowledge base. This is the whole seam
   * between Chap's vector store and LewLM's grounding: retrieve in the Lab,
   * jump to Chat with the winning chunks already loaded as citation context.
   */
  const [grounding, setGrounding] = useState<DocumentChunk[] | null>(null);

  useEffect(registerSkinShortcut, []);

  return (
    <AppShell
      nav={SCREENS.map(({ id, label }) => (
        <NavItem key={id} label={label} active={screen === id} onSelect={() => setScreen(id)} />
      ))}
      main={
        screen === 'chat' ? (
          <ChatScreen grounding={grounding} onGroundingUsed={() => setGrounding(null)} />
        ) : screen === 'ops' ? (
          <OpsScreen />
        ) : screen === 'lab' ? (
          <LabScreen
            onGround={(chunks) => {
              setGrounding(chunks);
              setScreen('chat');
            }}
          />
        ) : (
          <SettingsScreen />
        )
      }
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
