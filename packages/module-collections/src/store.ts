/**
 * The `/​_chap/collections` routes: Chap's half of retrieval.
 *
 * The division of labour is the point. Chap stores chunks and finds candidates;
 * LewLM embeds the text, scores the candidates and grounds the answer. Neither
 * side does the other's job, and the boundary is `/v1/embeddings` in one
 * direction and `candidate_chunks` in the other.
 *
 * Note what is *not* here: no chunking, no parsing, no OCR. Those come from
 * `/v1/documents/ingest`, which already returns chunks in the exact shape
 * `citation_context` and `/v1/retrieval/context` accept. Chap only has to keep
 * them and hand the right ones back.
 */

import { Hono } from 'hono';

import { VectorStore, type StoredChunk } from './vectors.ts';

/** LewLM, as this module needs it. Core is not imported — see server.ts. */
export interface LewLM {
  baseUrl: string;
  apiKey: string | undefined;
}

interface EmbeddingResponse {
  data: { embedding: number[]; index: number }[];
  model: string;
}

/** Embed through LewLM. This module owns no model and computes no vectors. */
async function embed(config: LewLM, input: string[]): Promise<number[][]> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (config.apiKey) headers['x-api-key'] = config.apiKey;
  headers['x-lewlm-application-id'] = 'chap';

  const res = await fetch(`${config.baseUrl}/v1/embeddings`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ input }),
  });

  if (!res.ok) {
    // Pass LewLM's envelope through untouched — the browser has one error type
    // and it should stay LewLM's, not a paraphrase invented here.
    throw new Response(await res.text(), {
      status: res.status,
      headers: { 'content-type': 'application/json' },
    });
  }

  const body = (await res.json()) as EmbeddingResponse;
  return body.data.sort((a, b) => a.index - b.index).map((datum) => datum.embedding);
}

export function collections(config: LewLM, storePath: string): Hono {
  const store = new VectorStore(storePath);
  const app = new Hono();

  app.get('/', (c) => c.json({ items: store.collections() }));

  /** Store chunks. The body is `documents/ingest` output, passed straight through. */
  app.post('/:name/chunks', async (c) => {
    const name = c.req.param('name');
    const body = await c.req.json<{ chunks: StoredChunk[] }>();
    const chunks = (body.chunks ?? []).filter((chunk) => chunk.text?.trim());
    if (chunks.length === 0) return c.json({ stored: 0, dimensions: null });

    try {
      const embeddings = await embed(config, chunks.map((chunk) => chunk.text));
      const stored = store.put(name, chunks, embeddings);
      return c.json({ stored, dimensions: embeddings[0]?.length ?? null });
    } catch (cause) {
      if (cause instanceof Response) return cause;
      throw cause;
    }
  });

  /**
   * Find candidates for a query. Returns them in the exact shape
   * `/v1/retrieval/context` and `citation_context` expect, so the browser can
   * forward them to LewLM without reshaping anything.
   */
  app.post('/:name/search', async (c) => {
    const name = c.req.param('name');
    const { query, limit = 12 } = await c.req.json<{ query: string; limit?: number }>();
    if (!query?.trim()) return c.json({ candidate_chunks: [], scores: [] });

    try {
      const [vector] = await embed(config, [query]);
      const matches = store.search(name, vector ?? [], limit);
      return c.json({
        candidate_chunks: matches.map(({ score: _score, ...chunk }) => chunk),
        // Kept alongside rather than inside the chunks: LewLM's schema has no
        // field for a caller's own score, and inventing one would be a lie.
        scores: matches.map((match) => ({ chunk_id: match.chunk_id, score: match.score })),
      });
    } catch (cause) {
      if (cause instanceof Response) return cause;
      throw cause;
    }
  });

  app.delete('/:name', (c) => c.json({ removed: store.drop(c.req.param('name')) }));

  return app;
}
