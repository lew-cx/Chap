/**
 * The layout slots both skins fill, and the only place a skin is chosen.
 *
 * Bench and Showroom genuinely differ in DOM structure — a three-column grid
 * with a status strip versus a centred column with floating chrome — and CSS
 * alone would be contorted. Confining that difference to two ~70-line shells is
 * the honest cost. Everything below this file is skin-blind.
 */

import type { ReactNode } from 'react';

import { useSkin } from '../store/skin.ts';
import { BenchShell } from './BenchShell.tsx';
import { ShowroomShell } from './ShowroomShell.tsx';

export interface ShellSlots {
  /** Primary navigation between Chat, Ops, Lab and Settings. */
  nav: ReactNode;
  /**
   * The active screen. Both shells give this slot a **definite height** inside a
   * flex column, and the screen owns its own internal scrolling. Screens may
   * rely on that; a screen must not assume the page scrolls.
   */
  main: ReactNode;
  /** Live telemetry. Persistent in Bench; a drawer in Showroom. */
  rail: ReactNode;
  /** Connection and runtime summary. A strip in Bench; a pill in Showroom. */
  status: ReactNode;
}

export function AppShell(slots: ShellSlots) {
  const skin = useSkin((state) => state.skin);
  return skin === 'bench' ? <BenchShell {...slots} /> : <ShowroomShell {...slots} />;
}
