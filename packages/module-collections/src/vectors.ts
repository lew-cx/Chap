/**
 * Chap's vector store — the only domain logic in this repo.
 *
 * It exists because LewLM deliberately owns no vector storage:
 * `/v1/retrieval/context` is stateless and caller-supplied, which is the right
 * call for inference middleware. So retrieval splits cleanly in two — LewLM
 * scores candidates, Chap decides which candidates to offer — and this file is
 * Chap's half.
 *
 * Built on `node:sqlite`, which ships with Node 22, so the store costs zero
 * dependencies. Vectors live as raw Float32 blobs and similarity is computed in
 * process: at bench scale (thousands of chunks, not millions) an exact scan is
 * both faster than an index and impossible to get subtly wrong.
 *
 * Chap never embeds anything itself — vectors come from `/v1/embeddings`.
 */

import { DatabaseSync } from 'node:sqlite';

export interface StoredChunk {
  chunk_id: string;
  text: string;
  source_id: string;
  section_id: string;
  source_label: string;
  section_label: string;
}

export interface Collection {
  name: string;
  chunk_count: number;
  dimensions: number | null;
  updated_at: string;
}

/** A stored chunk plus how well it matched. */
export interface Match extends StoredChunk {
  score: number;
}

function toBlob(vector: number[]): Uint8Array {
  return new Uint8Array(Float32Array.from(vector).buffer);
}

function fromBlob(blob: Uint8Array): Float32Array {
  // Copy rather than view: SQLite may reuse the buffer behind the row.
  return new Float32Array(blob.buffer.slice(blob.byteOffset, blob.byteOffset + blob.byteLength));
}

/** Cosine similarity over vectors whose dimensions have already been validated. */
function similarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) {
    throw new Error('Embedding dimension mismatch: query has ' + a.length + ', chunk has ' + b.length + '.');
  }
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  const magnitude = Math.sqrt(na) * Math.sqrt(nb);
  return magnitude === 0 ? 0 : dot / magnitude;
}

export class VectorStore {
  private readonly db: DatabaseSync;

  constructor(path: string) {
    this.db = new DatabaseSync(path);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chunks (
        collection    TEXT NOT NULL,
        chunk_id      TEXT NOT NULL,
        text          TEXT NOT NULL,
        source_id     TEXT NOT NULL,
        section_id    TEXT NOT NULL,
        source_label  TEXT NOT NULL,
        section_label TEXT NOT NULL,
        embedding     BLOB NOT NULL,
        dimensions    INTEGER NOT NULL,
        updated_at    TEXT NOT NULL,
        PRIMARY KEY (collection, chunk_id)
      );
      CREATE INDEX IF NOT EXISTS chunks_by_source ON chunks (collection, source_id);
    `);
  }

  /** Upsert, so re-ingesting a document replaces its chunks rather than duplicating them. */
  put(collection: string, chunks: StoredChunk[], embeddings: number[][]): number {
    if (chunks.length !== embeddings.length) {
      throw new Error(
        'Embedding response count mismatch: ' + chunks.length + ' chunks, ' + embeddings.length + ' vectors.',
      );
    }

    const dimensions = embeddings[0]?.length ?? 0;
    if (dimensions === 0) throw new Error('Embedding response contained an empty vector.');
    for (const vector of embeddings) {
      if (vector.length !== dimensions) {
        throw new Error(
          'Embedding response mixed ' + dimensions + '- and ' + vector.length + '-dimension vectors.',
        );
      }
      if (!vector.every(Number.isFinite)) throw new Error('Embedding response contained a non-finite value.');
    }

    const existing = this.db
      .prepare('SELECT MIN(dimensions) AS min, MAX(dimensions) AS max FROM chunks WHERE collection = ?')
      .get(collection) as unknown as { min: number | null; max: number | null };
    if (existing.min != null && (existing.min !== dimensions || existing.max !== dimensions)) {
      const current = existing.min === existing.max ? existing.min : 'mixed';
      throw new Error(
        'Collection ' + collection + ' uses ' + current + ' dimensions; received ' + dimensions + '.',
      );
    }

    const statement = this.db.prepare(`
      INSERT INTO chunks (collection, chunk_id, text, source_id, section_id,
                          source_label, section_label, embedding, dimensions, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (collection, chunk_id) DO UPDATE SET
        text = excluded.text, source_id = excluded.source_id,
        section_id = excluded.section_id, source_label = excluded.source_label,
        section_label = excluded.section_label, embedding = excluded.embedding,
        dimensions = excluded.dimensions, updated_at = excluded.updated_at
    `);

    const now = new Date().toISOString();
    this.db.exec('BEGIN');
    try {
      chunks.forEach((chunk, index) => {
        const vector = embeddings[index]!;
        statement.run(
          collection,
          chunk.chunk_id,
          chunk.text,
          chunk.source_id,
          chunk.section_id,
          chunk.source_label,
          chunk.section_label,
          toBlob(vector),
          vector.length,
          now,
        );
      });
      this.db.exec('COMMIT');
    } catch (cause) {
      this.db.exec('ROLLBACK');
      throw cause;
    }
    return embeddings.length;
  }

  /**
   * The `limit` nearest chunks. These become `candidate_chunks` for
   * `/v1/retrieval/context`, which reranks them — so this stage only has to be
   * good enough to put the right answer in the candidate set, not to order it.
   */
  search(collection: string, query: number[], limit: number): Match[] {
    const rows = this.db
      .prepare(
        `SELECT chunk_id, text, source_id, section_id, source_label, section_label, embedding
         FROM chunks WHERE collection = ?`,
      )
      .all(collection) as unknown as (StoredChunk & { embedding: Uint8Array })[];

    const target = Float32Array.from(query);
    return rows
      .map(({ embedding, ...chunk }) => ({ ...chunk, score: similarity(target, fromBlob(embedding)) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  collections(): Collection[] {
    return this.db
      .prepare(
        `SELECT collection AS name, COUNT(*) AS chunk_count,
                MAX(dimensions) AS dimensions, MAX(updated_at) AS updated_at
         FROM chunks GROUP BY collection ORDER BY name`,
      )
      .all() as unknown as Collection[];
  }

  drop(collection: string): number {
    const before = this.db
      .prepare('SELECT COUNT(*) AS n FROM chunks WHERE collection = ?')
      .get(collection) as unknown as { n: number };
    this.db.prepare('DELETE FROM chunks WHERE collection = ?').run(collection);
    return before?.n ?? 0;
  }
}
