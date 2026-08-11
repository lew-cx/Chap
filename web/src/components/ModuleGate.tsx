/**
 * A module's contribution, degraded honestly when the backend says it cannot work.
 *
 * Every module screen and tab is wrapped in this. An unreachable or
 * misconfigured module still appears in the nav — hiding it would turn an
 * environment fact into a missing feature, which is the failure mode this whole
 * pattern exists to avoid.
 */

import type { ComponentType } from 'react';

import { useModule } from '../lib/useModules.ts';
import { CapabilityNotice } from './CapabilityNotice.tsx';

export function ModuleGate({ id, component: Body }: { id: string; component: ComponentType }) {
  const status = useModule(id);

  // `null` is "health has not answered yet", not "not ready". Render the module.
  if (status != null && !status.ready) {
    return <CapabilityNotice title={`${status.label} is not available`} status={status} />;
  }

  return <Body />;
}
