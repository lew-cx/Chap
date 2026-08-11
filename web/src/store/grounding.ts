/**
 * Chunks handed to the next chat turn.
 *
 * This is the whole seam between a retrieval surface and LewLM's grounding:
 * retrieve somewhere, jump to Chat with the winning chunks already loaded as
 * citation context.
 *
 * It is a store rather than a prop because the sender is a module and the
 * receiver is core. Neither is allowed to import the other, so the handover has
 * to happen through something both may reach — see server/src/modules.ts for the
 * rule and scripts/module-check.mjs for the enforcement.
 */

import { create } from 'zustand';

import type { DocumentChunk } from '@chap/lewlm';

import { useNav } from './nav.ts';

interface GroundingState {
  chunks: DocumentChunk[] | null;
  /** Hand chunks to Chat and go there. Grounding is always a navigation. */
  ground: (chunks: DocumentChunk[]) => void;
  /** Called by Chat once the chunks are loaded, so a second visit is not a replay. */
  clear: () => void;
}

export const useGrounding = create<GroundingState>((set) => ({
  chunks: null,

  ground: (chunks) => {
    set({ chunks });
    useNav.getState().go('chat');
  },

  clear: () => set({ chunks: null }),
}));
