#!/usr/bin/env node
/**
 * Count the hand-written integration code and fail if it grows past budget.
 *
 * Chap's claim is that a full chat and operations GUI needs very little
 * application code when the services it fronts do the work. This turns that
 * claim into a number that CI can check.
 *
 * Every package under packages/ carries its own budget, declared in its own
 * package.json, so this script names none of them and adding a module never
 * edits it. The per-package split is the interesting part: it is what makes
 * "LewLM ships a contract and DocKtizo does not" a difference you can see.
 *
 * Generated files and tests do not count — they are contract or verification,
 * not the integration surface Chap ships. Blank lines and comment-only lines do
 * not count either; comments explaining why an upstream behaves a certain way
 * are the most valuable lines in a package and should never be discouraged.
 *
 * A module's UI counts. It is the integration surface, not decoration, and a
 * budget that cannot see it would be theatre.
 */

import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGES = join(ROOT, 'packages');
const EXCLUDE = new Set(['generated']);

async function* sourceFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(path);
    else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) yield path;
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

const packages = (await readdir(PACKAGES, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const over = [];
let grand = 0;

console.log('\n  hand-written integration code\n');

for (const name of packages) {
  const manifest = JSON.parse(await readFile(join(PACKAGES, name, 'package.json'), 'utf8'));
  const budget = manifest.chap?.budget;
  if (typeof budget !== 'number') {
    console.error(`  packages/${name}/package.json has no "chap": { "budget": N }\n`);
    process.exit(1);
  }

  const rows = [];
  let total = 0;
  for await (const path of sourceFiles(join(PACKAGES, name, 'src'))) {
    const loc = countCode(await readFile(path, 'utf8'));
    rows.push({ file: relative(ROOT, path), loc });
    total += loc;
  }
  rows.sort((a, b) => b.loc - a.loc);

  for (const { file, loc } of rows) console.log(`  ${String(loc).padStart(5)}  ${file}`);
  console.log(`  ${'-'.repeat(5)}`);
  console.log(`  ${String(total).padStart(5)}  ${name}   (budget ${budget})\n`);

  grand += total;
  if (total > budget) over.push({ name, total, budget });
}

console.log(`  ${String(grand).padStart(5)}  everything Chap hand-wrote\n`);

if (over.length > 0) {
  for (const { name, total, budget } of over) {
    console.error(`  ${name} is OVER BUDGET by ${total - budget} lines.`);
  }
  console.error(
    '\n  Either the code can be simpler, or an upstream gap is forcing a workaround.\n' +
      '  If it is a gap, record it in that upstream\'s gaps doc under docs/ before\n' +
      '  raising the budget.\n',
  );
  process.exit(1);
}
