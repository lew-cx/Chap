/**
 * The lab: every LewLM surface that is not chat.
 *
 * These exist so the bench can exercise the whole contract, not just the part a
 * chat window happens to touch — and because the semantic surfaces are what M9's
 * vector store will sit behind.
 */

import { Screen } from '../components/Screen.tsx';
import { moduleTabs } from '../modules.ts';
import { Audio } from './Audio.tsx';
import { Documents } from './Documents.tsx';
import { Semantic } from './Semantic.tsx';

export function LabScreen() {
  return (
    <Screen
      // Module tabs first: a retrieval module's tab is the one you want open
      // when there is one, and the first tab in the list is the default.
      tabs={[
        ...moduleTabs('lab'),
        { id: 'semantic', component: Semantic },
        { id: 'documents', component: Documents },
        { id: 'audio', component: Audio },
      ]}
    />
  );
}
