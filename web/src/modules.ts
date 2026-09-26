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
import { useModuleList } from './lib/useModules.ts';
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

/** Built-in modules: features Chap builds on LewLM alone. Always shown. */
export const MODULES: WebModule[] = [collections];

/**
 * Companions: adapters for other products that run on LewLM. Shown only when
 * the server reports one as enabled (`CHAP_COMPANIONS`), so a checkout that has
 * never heard of them looks exactly like one where they were deleted.
 *
 * `docktizo` is DocKtizo, an experimental document-generation service built on
 * LewLM. See packages/module-docktizo/README.md.
 */
export const COMPANIONS: WebModule[] = [docktizo];

/**
 * Wrap once, here at module scope. Building the wrapper inside a hook would
 * give it a fresh component identity on every render of the parent screen,
 * which remounts the tab and throws away its state on every keystroke.
 */
const gate =
  (id: string, component: ComponentType): ComponentType =>
  () =>
    createElement(ModuleGate, { id, component });

const ALL = [
  ...MODULES.map((module) => ({ module, companion: false })),
  ...COMPANIONS.map((module) => ({ module, companion: true })),
];

const TABS = ALL.flatMap(({ module, companion }) =>
  (module.tabs ?? []).map((tab) => ({
    ...tab,
    moduleId: module.id,
    companion,
    component: gate(module.id, tab.component),
  })),
);

const SCREENS = ALL.filter(({ module }) => module.screen != null).map(({ module, companion }) => ({
  id: module.id,
  label: module.label,
  companion,
  component: gate(module.id, module.screen!),
}));

/** Built-ins always; a companion only once the server says it is switched on. */
function useVisible(): (id: string, companion: boolean) => boolean {
  const enabled = new Set(useModuleList().map((module) => module.id));
  return (id, companion) => !companion || enabled.has(id);
}

export function useModuleTabs(screen: HostScreen): ScreenTab[] {
  const visible = useVisible();
  return TABS.filter((tab) => tab.screen === screen && visible(tab.moduleId, tab.companion));
}

export function useModuleScreens(): { id: string; label: string; component: ComponentType }[] {
  const visible = useVisible();
  return SCREENS.filter((screen) => visible(screen.id, screen.companion));
}
