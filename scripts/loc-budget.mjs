#!/usr/bin/env node
/**
 * Count the hand-written integration code and fail if it grows past budget.
 *
 * Chap's claim is that a full chat and operations GUI needs very little
 * application code when LewLM does the work. This turns that claim into a
 * number that CI can check.
 *
 * Generated files do not count — they are LewLM's contract, not Chap's code.
 * Blank lines and comment-only lines do not count either; comments explaining
 * why LewLM behaves a certain way are the most valuable lines in the package
 * and should never be discouraged by a budget.
 *
 * When a LewLM gap forces a workaround, this number rises. That is the point:
 * the cost of a gap becomes a single integer you can watch.
 */

import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = join(ROOT, 'packages/lewlm/src');
const EXCLUDE = new Set(['generated']);
const BUDGET = 900;

async function* sourceFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(path);
    else if (entry.name.endsWith('.ts')) yield path;
  }
}

/** Lines of actual code: no blanks, no comment-only lines, no block comments. */
function countCode(source) {
  let count = 0;
  let inBlock = false;

  for (const raw of source.split('\n')) {
    const line = raw.trim();
    if (inBlock) {
      if (line.includes('*/')) inBlock = false;
      continue;
    }
    if (line === '') continue;
    if (line.startsWith('//')) continue;
    if (line.startsWith('/*')) {
      if (!line.includes('*/')) inBlock = true;
      continue;
    }
    count += 1;
  }
  return count;
}

const rows = [];
let total = 0;

for await (const path of sourceFiles(TARGET)) {
  const loc = countCode(await readFile(path, 'utf8'));
  rows.push({ file: relative(ROOT, path), loc });
  total += loc;
}

rows.sort((a, b) => b.loc - a.loc);

console.log('\n  hand-written LewLM integration code\n');
for (const { file, loc } of rows) {
  console.log(`  ${String(loc).padStart(5)}  ${file}`);
}
console.log(`  ${'-'.repeat(5)}`);
console.log(`  ${String(total).padStart(5)}  total   (budget ${BUDGET})\n`);

if (total > BUDGET) {
  console.error(
    `  OVER BUDGET by ${total - BUDGET} lines.\n\n` +
      '  Either the code can be simpler, or a LewLM gap is forcing a workaround.\n' +
      '  If it is a gap, record it in docs/lewlm-gaps.md before raising the budget.\n',
  );
  process.exit(1);
}
