import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { VectorStore, type StoredChunk } from './vectors.ts';

function store(): VectorStore {
  return new VectorStore(join(mkdtempSync(join(tmpdir(), 'chap-vectors-')), 'vectors.sqlite'));
}

function chunk(overrides: Partial<StoredChunk> = {}): StoredChunk {
  return {
    chunk_id: 'chunk-1',
    text: 'old text',
    source_id: 'source-old',
    section_id: 'section-old',
    source_label: 'old source',
    section_label: 'old section',
    ...overrides,
  };
}

test('upsert replaces all chunk metadata', () => {
  const vectors = store();
  vectors.put('docs', [chunk()], [[1, 0]]);
  vectors.put(
    'docs',
    [
      chunk({
        text: 'new text',
        source_id: 'source-new',
        section_id: 'section-new',
        source_label: 'new source',
        section_label: 'new section',
      }),
    ],
    [[0, 1]],
  );

  assert.deepEqual(vectors.search('docs', [0, 1], 1)[0], {
    ...chunk({
      text: 'new text',
      source_id: 'source-new',
      section_id: 'section-new',
      source_label: 'new source',
      section_label: 'new section',
    }),
    score: 1,
  });
});

test('put refuses missing or mixed-dimension embeddings', () => {
  const vectors = store();
  assert.throws(() => vectors.put('docs', [chunk()], []), /count mismatch/);
  assert.throws(
    () => vectors.put('docs', [chunk(), chunk({ chunk_id: 'chunk-2' })], [[1, 0], [1]]),
    /mixed/,
  );

  vectors.put('docs', [chunk()], [[1, 0]]);
  assert.throws(() => vectors.put('docs', [chunk()], [[1, 0, 0]]), /uses 2 dimensions/);
  assert.throws(() => vectors.search('docs', [1, 0, 0], 1), /dimension mismatch/);
});
