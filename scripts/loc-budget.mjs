#!/usr/bin/env node
/**
 * Count the hand-written code and fail if it grows past budget.
 *
 * Chap's claim is that a full chat and operations GUI needs very little
 * application code when the services it fronts do the work. This turns that
 * claim into a number that CI can check.
 *
 * Every package under packages/ carries its own budget, declared in its own
 * package.json, so this script names none of them and adding a module never
 * edits it. The per-package split is the interesting part: it is what makes
 * "this upstream's contract is thinner than that one's" a difference you can see.
 *
 * TWO BUDGETS, because they answer different questions.
 *
 *   integration  what it costs to TALK to the upstream — the client, the store,
 *                the server half, the types. This is the number that carries
 *                Chap's argument: it should barely move when a screen is added,
 *                and it should rise when a contract is thin enough to force a
 *                workaround.
 *
 *   ui           what it costs to SHOW the upstream. This is product surface. A
 *                module that reaches further into what it fronts needs more of
 *                it, and that is a decision about scope rather than a symptom of
 *                a bad contract.
 *
 * They used to be one number, and that number said the wrong thing. The DocKtizo
 * companion's integration is 288 lines against module-collections' 268 — nearly
 * the same — while its UI is six times the size, because it reaches into review,
 * revision and migration and collections reaches into one search box. Summed, it
 * looked three times as expensive to integrate. It is not. Splitting the budget
 * is what stops "we added a tab" from reading as contract debt.
 *
 * The split is by extension, not by directory: a file that renders is `.tsx`,
 * and a file that talks is `.ts`. Nothing to keep tidy, and nothing to argue
 * about — JSX cannot hide in a `.ts` file.
 *
 * A package with no `ui` budget declared may have no UI at all. That is checked
 * rather than assumed, so a module cannot grow a screen without saying so.
 *
 * Generated files and tests do not count — they are contract or verification,
 * not the surface Chap ships. Blank lines and comment-only lines do not count
 * either; comments explaining why an upstream behaves a certain way are the most
 * valuable lines in a package and should never be discouraged.
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

/** A file that renders is UI; a file that talks is integration. */
const kindOf = (path) => (path.endsWith('.tsx') ? 'ui' : 'integration');

/** Accepts a bare number as an integration-only budget, for a package with no UI. */
function budgetsOf(manifest, name) {
  const declared = manifest.chap?.budget;
  if (typeof declared === 'number') return { integration: declared, ui: null };
  if (declared && typeof declared.integration === 'number') {
    return {
      integration: declared.integration,
      ui: typeof declared.ui === 'number' ? declared.ui : null,
    };
  }
  console.error(
    `  packages/${name}/package.json needs "chap": { "budget": { "integration": N, "ui": M } }\n`,
  );
  process.exit(1);
}

const over = [];
const undeclared = [];
const grand = { integration: 0, ui: 0 };

console.log('\n  hand-written code\n');

for (const name of packages) {
  const manifest = JSON.parse(await readFile(join(PACKAGES, name, 'package.json'), 'utf8'));
  const budget = budgetsOf(manifest, name);

  const rows = [];
  const total = { integration: 0, ui: 0 };
  for await (const path of sourceFiles(join(PACKAGES, name, 'src'))) {
    const loc = countCode(await readFile(path, 'utf8'));
    const kind = kindOf(path);
    rows.push({ file: relative(ROOT, path).replaceAll('\\', '/'), loc, kind });
    total[kind] += loc;
  }
  rows.sort((a, b) => b.loc - a.loc);

  for (const { file, loc, kind } of rows) {
    console.log(`  ${String(loc).padStart(5)}  ${kind === 'ui' ? 'ui  ' : '    '}  ${file}`);
  }
  console.log(`  ${'-'.repeat(5)}`);
  console.log(
    `  ${String(total.integration).padStart(5)}          ${name} integration   (budget ${budget.integration})`,
  );
  if (budget.ui !== null || total.ui > 0) {
    console.log(
      `  ${String(total.ui).padStart(5)}          ${name} ui            (budget ${budget.ui ?? 'none declared'})`,
    );
  }
  console.log('');

  grand.integration += total.integration;
  grand.ui += total.ui;

  if (total.integration > budget.integration) {
    over.push({ name, kind: 'integration', total: total.integration, budget: budget.integration });
  }
  if (budget.ui === null && total.ui > 0) undeclared.push({ name, total: total.ui });
  else if (budget.ui !== null && total.ui > budget.ui) {
    over.push({ name, kind: 'ui', total: total.ui, budget: budget.ui });
  }
}

console.log(`  ${String(grand.integration).padStart(5)}          talking to upstreams`);
console.log(`  ${String(grand.ui).padStart(5)}          showing them`);
console.log(`  ${String(grand.integration + grand.ui).padStart(5)}          everything Chap hand-wrote\n`);

for (const { name, total } of undeclared) {
  console.error(
    `  ${name} has ${total} lines of UI and no "ui" budget. A module that grows a\n` +
      `  screen has to say so — add "ui": N beside "integration".\n`,
  );
}

if (over.length > 0) {
  for (const { name, kind, total, budget } of over) {
    console.error(`  ${name} ${kind} is OVER BUDGET by ${total - budget} lines.`);
  }
  console.error(
    '\n  For integration: either the code can be simpler, or an upstream gap is\n' +
      '  forcing a workaround. If it is a gap, record it in that upstream\'s gaps\n' +
      '  doc under docs/ before raising the budget.\n' +
      '\n  For ui: this is product surface, so the question is only whether the\n' +
      '  screen earns its size. Raising it is a scope decision, not a concession.\n',
  );
}

if (over.length > 0 || undeclared.length > 0) process.exit(1);
