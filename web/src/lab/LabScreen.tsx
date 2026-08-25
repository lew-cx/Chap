/**
 * The lab: every LewLM surface that is not chat.
 *
 * These exist so the bench can exercise the whole contract, not just the part a
 * chat window happens to touch — and because the semantic surfaces are what M9's
 * vector store will sit behind.
 */

import { useState } from 'react';

import type { DocumentChunk } from '@chap/lewlm';

import { Screen, Section } from '../components/Screen.tsx';
import { moduleTabs } from '../modules.ts';
import { useGrounding } from '../store/grounding.ts';
import { Audio } from './Audio.tsx';
import { Documents } from './Documents.tsx';
import { Semantic } from './Semantic.tsx';

/**
 * Ingest, then a route from it to a grounded chat turn.
 *
 * `Documents` takes an `onChunks` handoff and the knowledge module supplies one;
 * without this the standalone tab produced exactly the chunks `citation_context`
 * wants and had nowhere to send them. Grounding from here skips the store — the
 * chunks go to the composer as they came back, which is the shortest honest path
 * from a file to a cited answer.
 *
 * A button rather than an automatic handover: grounding is a navigation, and
 * ingesting a file to read its provenance or round-trip it back to markdown is a
 * perfectly good reason to be on this tab. Leaving on every upload would take
 * the tab away from anyone using it for what it is for.
 */
function DocumentsTab() {
  const ground = useGrounding((state) => state.ground);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);

  return (
    <>
      <Documents onChunks={(ingest) => setChunks(ingest.chunks ?? [])} />
      {chunks.length > 0 && (
        <Section title="ground a chat turn" hint={`${chunks.length} chunks ready`}>
          <button type="button" className="btn" onClick={() => ground(chunks)}>
            hand these chunks to the composer
          </button>
          <p className="micro-label mt-2">
            They arrive as `citation_context`, not as text in the prompt — so LewLM grounds the
            answer and resolves its citations back to these ids.
          </p>
        </Section>
      )}
    </>
  );
}

export function LabScreen() {
  return (
    <Screen
      // Module tabs first: a retrieval module's tab is the one you want open
      // when there is one, and the first tab in the list is the default.
      tabs={[
        ...moduleTabs('lab'),
        { id: 'semantic', component: Semantic },
        { id: 'documents', component: DocumentsTab },
        { id: 'audio', component: Audio },
      ]}
    />
  );
}
