/**
 * Skin state.
 *
 * One of exactly four files permitted to know a skin exists. The other three
 * are AppShell, BenchShell and ShowroomShell. Nothing under components/, chat/,
 * ops/ or lab/ may import this — see docs/skins.md.
 */

import { create } from 'zustand';

export type Skin = 'bench' | 'showroom';

const STORAGE_KEY = 'chap.skin';
const TRANSITION_MS = 320;

function readInitial(): Skin {
  // index.html already resolved this before first paint; trust its answer so
  // React never disagrees with what is on screen.
  const applied = document.documentElement.dataset['skin'];
  return applied === 'showroom' ? 'showroom' : 'bench';
}

interface SkinState {
  skin: Skin;
  setSkin: (skin: Skin) => void;
  toggle: () => void;
}

export const useSkin = create<SkinState>((set, get) => ({
  skin: readInitial(),

  setSkin: (skin) => {
    if (get().skin === skin) return;

    // Animate only across the switch. A permanent global transition would make
    // every ordinary interaction feel laggy.
    const root = document.documentElement;
    root.dataset['skinTransitioning'] = '';
    root.dataset['skin'] = skin;
    window.setTimeout(() => delete root.dataset['skinTransitioning'], TRANSITION_MS);

    try {
      localStorage.setItem(STORAGE_KEY, skin);
    } catch {
      // Private browsing. The skin still applies for this session.
    }
    set({ skin });
  },

  toggle: () => get().setSkin(get().skin === 'bench' ? 'showroom' : 'bench'),
}));

/** `Cmd/Ctrl + \` — a showroom has to switch in one keystroke, mid-sentence. */
export function registerSkinShortcut(): () => void {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === '\\' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      useSkin.getState().toggle();
    }
  };
  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}
