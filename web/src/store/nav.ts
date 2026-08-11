/**
 * Which top-level screen is showing.
 *
 * A store rather than `useState` in App because a module may contribute a screen
 * and may need to switch to one — and a module cannot be handed a setter by a
 * core component that is not allowed to know the module exists. `screen` is a
 * plain string for the same reason: the union of valid values is not knowable at
 * compile time once modules can add to it.
 */

import { create } from 'zustand';

interface NavState {
  screen: string;
  go: (screen: string) => void;
}

export const useNav = create<NavState>((set) => ({
  screen: 'chat',
  go: (screen) => set({ screen }),
}));
