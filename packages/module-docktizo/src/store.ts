/**
 * What the tabs hand each other.
 *
 * The module's own state, not Chap's — core has no idea this exists. Nothing
 * durable lives here: DocKtizo owns the record, and a second, worse copy of it
 * in the browser is exactly the application code this repo is trying not to
 * write. What is kept is the thread of one session's work — which workflow you
 * are on, what you made, and what you are watching.
 */

import { create } from 'zustand';

import { docktizo } from './client.ts';
import type { DocumentTypeDetail, SourceSummary, Whoami } from './types.ts';

interface WorkbenchState {
  /** Installed workflows. Read once — a registry cannot change under a running service. */
  types: DocumentTypeDetail[];
  catalogFailure: string | null;
  /** The workflow every tab is acting in. Chosen once, in the screen's header. */
  documentType: DocumentTypeDetail | null;
  /** Created this session. The ids exist to be ticked in the generate tab. */
  sources: SourceSummary[];
  /** Submitted in the generate tab, watched by the generation tab. */
  generationId: string | null;
  /** What a generation produced. Reviewed, revised and migrated in the document tab. */
  documentId: string | null;
  /** What the token resolved to. Read once; it cannot change without a restart. */
  whoami: Whoami | null;

  load: () => void;
  select: (workflowId: string) => void;
  addSource: (source: SourceSummary) => void;
  watch: (generationId: string) => void;
  open: (documentId: string | null) => void;
}

export const useWorkbench = create<WorkbenchState>((set, get) => ({
  types: [],
  catalogFailure: null,
  documentType: null,
  sources: [],
  generationId: null,
  documentId: null,
  whoami: null,

  /**
   * Everything that answers the same way for the whole session, fetched once.
   *
   * Both reads are about the environment rather than the work: which workflows
   * are installed, and what this token may do with them. Every tab calls this on
   * mount and all but the first call is a no-op.
   */
  load: () => {
    if (get().whoami || get().types.length > 0) return;
    void docktizo.whoami().then((whoami) => set({ whoami })).catch(() => undefined);
    void docktizo.documentTypes
      .list()
      .then(({ items }) => set({ types: items, documentType: items[0] ?? null }))
      .catch((cause: unknown) =>
        set({ catalogFailure: cause instanceof Error ? cause.message : String(cause) }),
      );
  },

  select: (workflowId) =>
    set((state) => ({
      documentType: state.types.find((type) => type.workflow_id === workflowId) ?? state.documentType,
    })),
  addSource: (source) => set((state) => ({ sources: [source, ...state.sources] })),
  watch: (generationId) => set({ generationId }),
  open: (documentId) => set({ documentId }),
}));
