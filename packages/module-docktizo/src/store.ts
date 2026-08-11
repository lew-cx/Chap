/**
 * What the four tabs hand each other.
 *
 * The module's own state, not Chap's — core has no idea this exists. Sources are
 * kept for the length of a session only: DocKtizo owns the durable record and
 * re-listing it here would be Chap keeping a second, worse copy.
 */

import { create } from 'zustand';

import type { DocumentTypeDetail, SourceSummary } from './types.ts';

interface WorkbenchState {
  /** Chosen in the types tab, used by the generate tab. */
  documentType: DocumentTypeDetail | null;
  /** Created this session. The ids exist to be ticked in the generate tab. */
  sources: SourceSummary[];
  /** Submitted in the generate tab, watched by the generation tab. */
  generationId: string | null;

  select: (documentType: DocumentTypeDetail) => void;
  addSource: (source: SourceSummary) => void;
  watch: (generationId: string) => void;
}

export const useWorkbench = create<WorkbenchState>((set) => ({
  documentType: null,
  sources: [],
  generationId: null,

  select: (documentType) => set({ documentType }),
  addSource: (source) => set((state) => ({ sources: [source, ...state.sources] })),
  watch: (generationId) => set({ generationId }),
}));
