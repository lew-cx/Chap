/**
 * The lab: every LewLM surface that is not chat.
 *
 * These exist so the bench can exercise the whole contract, not just the part a
 * chat window happens to touch — and because the semantic surfaces are what M9's
 * vector store will sit behind.
 */

import { useState } from 'react';

import type { DocumentChunk } from '@chap/lewlm';

import { Screen } from '../components/Screen.tsx';
import { Audio } from './Audio.tsx';
import { Documents } from './Documents.tsx';
import { Knowledge } from './Knowledge.tsx';
import { Semantic } from './Semantic.tsx';

const TABS = ['knowledge', 'semantic', 'documents', 'audio'] as const;
type Tab = (typeof TABS)[number];

export function LabScreen({ onGround }: { onGround?: (chunks: DocumentChunk[]) => void }) {
  const [tab, setTab] = useState<Tab>('knowledge');

  return (
    <Screen tabs={TABS} active={tab} onSelect={setTab}>
      {tab === 'knowledge' && <Knowledge onGround={onGround} />}
      {tab === 'semantic' && <Semantic />}
      {tab === 'documents' && <Documents />}
      {tab === 'audio' && <Audio />}
    </Screen>
  );
}
