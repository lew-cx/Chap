/**
 * What the four tabs hand each other.
 *
 * The module's own state, not Chap's — core has no idea this exists. Sources are
 * kept for the length of a session only: DocKtizo owns the durable record and
 * re-listing it here would be Chap keeping a second, worse copy.
 */

import { create } from 'zustand';

import { docktizo } from './client.ts';
import type { DocumentTypeDetail, SourceSummary, Whoami } from './types.ts';

interface WorkbenchState {
  /** Chosen in the types tab, used by the generate tab. */
  documentType: DocumentTypeDetail | null;
  /** Created this session. The ids exist to be ticked in the generate tab. */
  sources: SourceSummary[];
  /** Submitted in the generate tab, watched by the generation tab. */
  generationId: string | null;
  /** What the token resolved to. Read once; it cannot change without a restart. */
  whoami: Whoami | null;

  select: (documentType: DocumentTypeDetail) => void;
  addSource: (source: SourceSummary) => void;
  watch: (generationId: string) => void;
  identify: () => void;
}

export const useWorkbench = create<WorkbenchState>((set, get) => ({
  documentType: null,
  sources: [],
  generationId: null,
  whoami: null,

  select: (documentType) => set({ documentType }),
  addSource: (source) => set((state) => ({ sources: [source, ...state.sources] })),
  watch: (generationId) => set({ generationId }),

  identify: () => {
    if (get().whoami) return;
    void docktizo.whoami().then((whoami) => set({ whoami })).catch(() => undefined);
  },
}));
