/**
 * DocKtizo's contribution to Chap: one top-level screen, four tabs.
 *
 * The screen reuses Chap's own `Screen` frame rather than inventing a second
 * one, which is the whole point of a module having access to `@/components` —
 * a module should look like the app it is installed into, not like a widget
 * bolted onto it.
 *
 * Readiness is not declared here. Core wraps this in a gate that asks the server
 * whether DocKtizo can actually work, so an unconfigured host shows DocKtizo's
 * own error instead of four tabs that all fail on click.
 */

import { Screen } from '@/components/Screen.tsx';

import { DocumentTypes } from './ui/DocumentTypes.tsx';
import { Generate } from './ui/Generate.tsx';
import { Generation } from './ui/Generation.tsx';
import { Sources } from './ui/Sources.tsx';

export const docktizo = {
  id: 'docktizo',
  label: 'DocKtizo',
  screen: () => (
    <Screen
      tabs={[
        { id: 'types', component: DocumentTypes },
        { id: 'sources', component: Sources },
        { id: 'generate', component: Generate },
        { id: 'generation', component: Generation },
      ]}
    />
  ),
};
