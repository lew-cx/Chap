/**
 * Chap's retrieval store, from the browser.
 *
 * Deliberately not in `@chap/lewlm` — these are Chap's own routes, not LewLM's,
 * and mixing them into the client package would blur exactly the line the LOC
 * budget exists to measure.
 */

import type { DocumentChunk } from '@chap/lewlm';

export interface CollectionSummary {
  name: string;
  chunk_count: number;
  dimensions: number | null;
  updated_at: string;
}

export interface SearchResult {
  candidate_chunks: DocumentChunk[];
  /** Chap's own similarity, kept beside the chunks rather than inside them. */
  scores: { chunk_id: string; score: number }[];
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/_chap/collections${path}`, {
    ...init,
    headers: init?.body ? { 'content-type': 'application/json' } : undefined,
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()) as T;
}

export const collections = {
  list: () => call<{ items: CollectionSummary[] }>(''),

  add: (name: string, chunks: DocumentChunk[]) =>
    call<{ stored: number; dimensions: number | null }>(`/${encodeURIComponent(name)}/chunks`, {
      method: 'POST',
      body: JSON.stringify({ chunks }),
    }),

  search: (name: string, query: string, limit = 12) =>
    call<SearchResult>(`/${encodeURIComponent(name)}/search`, {
      method: 'POST',
      body: JSON.stringify({ query, limit }),
    }),

  drop: (name: string) =>
    call<{ removed: number }>(`/${encodeURIComponent(name)}`, { method: 'DELETE' }),
};
