/**
 * What a module is, on the server side, and the registry of them.
 *
 * LewLM is core and cannot be removed — it is the thing Chap is a client for.
 * Everything else attaches here: a document service, a vector store, whatever
 * comes next. Core knows this shape and nothing else. It does not know a
 * module's name, its routes, its environment or its upstream, and
 * `scripts/module-check.mjs` fails the build the moment it does.
 *
 * A module is a source folder with an exports map, not a redistributable
 * package: its browser half imports Chap's own components through `@/`, and
 * pretending otherwise would cost a UI-package extraction that buys nothing.
 * The two subpath exports (`./server`, `./web`) exist so this process never
 * loads React and the bundle never loads Hono — also checked, not assumed.
 */

import type { Hono } from 'hono';

import { collectionsModule } from '@chap/module-collections/server';
import { docktizo } from '@chap/module-docktizo/server';

import type { PipeTarget } from './proxy.ts';

/**
 * Everything a module may know about the host.
 *
 * Deliberately not `ChapConfig`. A module gets somewhere to put state, the
 * environment, and LewLM — and reaching LewLM is not a dependency on another
 * module, because LewLM is core.
 */
export interface ModuleContext {
  env: NodeJS.ProcessEnv;
  /** Created by core before the module is built. The module owns the layout inside. */
  dataDir: string;
  lewlm: { baseUrl: string; apiKey: string | undefined };
}

/** Whether a module can work right now, in the upstream's own words. */
export interface ModuleReadiness {
  ready: boolean;
  /** Why not. Never a paraphrase invented here — see web/src/lib/useModules.ts. */
  reason: string | null;
}

export interface ServerModule {
  id: string;
  label: string;
  /** Everything this module serves lives under this path. One prefix, no exceptions. */
  prefix: string;
  /** Routes the module implements itself. */
  mount?: Hono;
  /** An upstream the module fronts. `stripPrefix` is supplied by core. */
  proxy?: Omit<PipeTarget, 'stripPrefix'>;
  /** Env keys the module reads. Reported by `/_chap/health` so Settings can show them. */
  env?: readonly string[];
  probe?: () => Promise<ModuleReadiness>;
}

export type ServerModuleFactory = (context: ModuleContext) => ServerModule;

/** The registry. One line per module; core mentions modules nowhere else. */
export const MODULES: ServerModuleFactory[] = [collectionsModule, docktizo];
