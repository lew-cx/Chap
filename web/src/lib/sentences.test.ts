import assert from 'node:assert/strict';
import test from 'node:test';

import { SentenceSplitter } from './sentences.ts';

test('splits streamed prose without reading markdown markers', () => {
  const splitter = new SentenceSplitter();
  assert.deepEqual(splitter.push('## Hello world.'), []);
  assert.deepEqual(splitter.push(' Next sentence!'), ['Hello world.']);
  assert.deepEqual(splitter.flush(), ['Next sentence!']);
});

test('keeps abbreviations together and drops fenced code', () => {
  const splitter = new SentenceSplitter();
  assert.deepEqual(
    splitter.push('Dr. Rivera arrived.\n\n\`\`\`ts\nconst hidden = true;\n\`\`\`\n'),
    ['Dr. Rivera arrived.'],
  );
  assert.deepEqual(splitter.flush(), []);
});
