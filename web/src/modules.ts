/**
 * What a module is, in the browser, and the registry of them.
 *
 * This and server/src/modules.ts are the only two files in Chap that may name a
 * module. Everything else — App, the three core screens, every component —
 * renders whatever the registry holds without knowing what it is.
 * `scripts/module-check.mjs` fails the build if that stops being true.
 *
 * A module's *readiness* is not declared here. It comes from the backend, over
 * `/_chap/health`, so a module that cannot work still appears and says why in
 * the upstream's own words. Same principle as lib/useCapability.ts: the only
 * thing registered client-side is existence.
 */

import { createElement, type ComponentType } from 'react';

import { collections } from '@chap/module-collections/web';
import { docktizo } from '@chap/module-docktizo/web';

import { ModuleGate } from './components/ModuleGate.tsx';
import type { ScreenTab } from './components/Screen.tsx';

/** The screens Chap owns. A module may add tabs to any of them. */
export type HostScreen = 'chat' | 'ops' | 'lab' | 'settings';

export interface WebModule {
  id: string;
  label: string;
  /** A top-level nav entry, owned entirely by the module. */
  screen?: ComponentType;
  /** Tabs added to a screen Chap owns. */
  tabs?: readonly (ScreenTab & { screen: HostScreen })[];
}

/** The registry. One line per module. */
export const MODULES: WebModule[] = [collections, docktizo];

/**
 * Wrap once, here at module scope. Building the wrapper inside `moduleTabs()`
 * would give it a fresh component identity on every render of the parent screen,
 * which remounts the tab and throws away its state on every keystroke.
 */
const gate =
  (id: string, component: ComponentType): ComponentType =>
  () =>
    createElement(ModuleGate, { id, component });

const TABS = MODULES.flatMap((module) =>
  (module.tabs ?? []).map((tab) => ({ ...tab, component: gate(module.id, tab.component) })),
);

const SCREENS = MODULES.filter((module) => module.screen != null).map((module) => ({
  id: module.id,
  label: module.label,
  component: gate(module.id, module.screen!),
}));

export const moduleTabs = (screen: HostScreen): ScreenTab[] =>
  TABS.filter((tab) => tab.screen === screen);

export const moduleScreens = () => SCREENS;
