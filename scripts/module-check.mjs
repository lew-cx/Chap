#!/usr/bin/env node
/**
 * Enforce the rule that keeps the module system honest.
 *
 * Chap is a LewLM client. Everything else — a document service, a vector store,
 * whatever comes next — attaches through two registry files and may be deleted
 * by removing two lines. That claim is only true while core stays blind to what
 * is installed, and blindness is not something a codebase keeps by intention.
 * The first `if (module.id === 'docktizo')` in a core file goes unnoticed, the
 * second is precedent, and within a month Chap is a bespoke console again.
 *
 * Four things are checked, in the order they tend to break:
 *
 *   1. Core names no module. Only server/src/modules.ts and web/src/modules.ts
 *      may mention one.
 *   2. The halves stay apart. A module's `./server` closure must never reach
 *      React; its `./web` closure must never reach Hono or node:*. This is what
 *      the two subpath exports buy, so it is checked rather than assumed.
 *   3. Modules depend on core in one direction, through a small surface, and
 *      never by reaching into core's source with a relative path.
 *   4. Every module package has the shape the registries expect.
 *
 * A violation here is a design bug, not a lint nit — see server/src/modules.ts.
 */

import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGES = join(ROOT, 'packages');

/** The two files allowed to name a module. Everything else in core is blind. */
const REGISTRIES = new Set(['server/src/modules.ts', 'web/src/modules.ts']);

/** What a module's browser half may reach in core, and nothing else. */
const MODULE_MAY_IMPORT = [/^@chap\/lewlm$/, /^@\/(components|lib|store)\//];

/**
 * One exception, stated rather than hidden. `Documents.tsx` is LewLM's ingest
 * panel — 200 lines of LewLM contract, correctly core, and a Lab tab in its own
 * right. A retrieval module embeds it because ingest is LewLM's job and only
 * "keep these chunks" is the module's. Moving it under components/ to satisfy
 * this rule would be worse than the exception.
 */
const MODULE_MAY_ALSO_IMPORT = new Set(['@/lab/Documents.tsx']);

/** Reaching either of these from the wrong half means the exports split is a fiction. */
const HALVES = {
  server: { forbidden: [/^react(-dom)?$/, /\.tsx$/], label: 'react' },
  web: { forbidden: [/^hono$/, /^@hono\//, /^node:/], label: 'hono or node:' },
};

/**
 * Blank out comments so a file may *describe* the rule without violating it.
 * Replaces with spaces rather than deleting, to keep line numbers accurate.
 */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/.*$/gm, (_match, prefix) => prefix);
}

async function* files(dir, extensions = /\.(ts|tsx)$/) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path, extensions);
    else if (extensions.test(entry.name)) yield path;
  }
}

/** Every module specifier in a file, comments already removed. */
function importsIn(code) {
  return [...code.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
}

/**
 * A repo-relative path in one spelling, on every platform. `relative()` returns
 * backslashes on Windows, and every literal this script compares against — and
 * every path it prints — is written with forward slashes.
 */
const relPath = (path) => relative(ROOT, path).replaceAll('\\', '/');

const violations = [];
const note = (rel, line, message) => violations.push({ rel, line, message });

// Module ids come from the filesystem, so this script names no module either.
const moduleDirs = (await readdir(PACKAGES, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('module-'))
  .map((entry) => entry.name);
const moduleIds = moduleDirs.map((name) => name.slice('module-'.length));

// --- 1. core names no module ------------------------------------------------

const forbiddenInCore = [
  { pattern: /@chap\/module-/, label: 'a module package' },
  ...moduleIds.map((id) => ({ pattern: new RegExp(`\\b${id}\\b`, 'i'), label: `the module "${id}"` })),
];

for (const root of ['server/src', 'web/src']) {
  for await (const path of files(join(ROOT, root))) {
    const rel = relPath(path);
    if (REGISTRIES.has(rel)) continue;
    const code = stripComments(await readFile(path, 'utf8'));
    code.split('\n').forEach((line, index) => {
      for (const { pattern, label } of forbiddenInCore) {
        if (pattern.test(line)) note(rel, index + 1, `names ${label}: ${line.trim().slice(0, 80)}`);
      }
    });
  }
}

// --- 2/3. per-module checks -------------------------------------------------

/** Walk relative imports out from one entry point, staying inside the module. */
async function closure(entry) {
  const seen = new Set();
  const queue = [entry];
  const reached = [];

  while (queue.length > 0) {
    const path = queue.pop();
    if (seen.has(path)) continue;
    seen.add(path);

    let source;
    try {
      source = await readFile(path, 'utf8');
    } catch {
      note(relPath(entry), 0, `imports a file that does not exist: ${relPath(path)}`);
      continue;
    }

    for (const specifier of importsIn(stripComments(source))) {
      reached.push({ from: path, specifier });
      if (specifier.startsWith('.')) queue.push(resolve(dirname(path), specifier));
    }
  }
  return reached;
}

for (const dir of moduleDirs) {
  const pkgPath = join(PACKAGES, dir, 'package.json');
  let pkg;
  try {
    pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
  } catch {
    note(relPath(pkgPath), 0, 'missing or unparseable package.json');
    continue;
  }

  // --- 4. shape ---
  const exported = Object.keys(pkg.exports ?? {}).sort().join(',');
  if (exported !== './server,./web') {
    note(relPath(pkgPath), 0, `exports must be exactly "./server" and "./web", found [${exported}]`);
  }
  // Two budgets, because a module pays two different costs: what it takes to
  // talk to its upstream, and what it takes to show it. A module always has a
  // UI — that is what `./web` is — so both are required here, unlike in
  // loc-budget.mjs where a UI-less package like @chap/lewlm may declare one.
  const budget = pkg.chap?.budget;
  if (typeof budget?.integration !== 'number' || typeof budget?.ui !== 'number') {
    note(
      relPath(pkgPath),
      0,
      'missing "chap": { "budget": { "integration": N, "ui": M } } — every module carries its own budgets',
    );
  }

  const home = join(PACKAGES, dir);

  for (const [half, { forbidden, label }] of Object.entries(HALVES)) {
    const entry = join(PACKAGES, dir, 'src', half === 'server' ? 'server.ts' : 'web.tsx');
    for (const { from, specifier } of await closure(entry)) {
      const rel = relPath(from);

      // A relative path out of the package is the loophole in rule 3: it reaches
      // core's source directly and no alias rule would ever see it.
      if (specifier.startsWith('.') && relative(home, resolve(dirname(from), specifier)).startsWith('..')) {
        note(rel, 0, `reaches outside the module with "${specifier}" — use @/ or declare the shape locally`);
      }

      // --- 2. halves stay apart ---
      if (forbidden.some((pattern) => pattern.test(specifier))) {
        note(rel, 0, `the ${half} half reaches ${label} via "${specifier}"`);
      }

      // --- 3. one direction, small surface ---
      if (specifier.startsWith('@/') && !MODULE_MAY_ALSO_IMPORT.has(specifier)) {
        if (!MODULE_MAY_IMPORT.some((pattern) => pattern.test(specifier))) {
          note(rel, 0, `imports "${specifier}" — modules may reach @/components, @/lib and @/store only`);
        }
      }
    }
  }
}

// --- report -----------------------------------------------------------------

if (violations.length > 0) {
  console.error('\n  a module leaked into core, or core leaked into a module:\n');
  for (const { rel, line, message } of violations) {
    console.error(`  ${rel}${line ? `:${line}` : ''}  ${message}`);
  }
  console.error(
    '\n  Core must work with every module deleted. If a module needs something\n' +
      '  from core, it goes through @/components, @/lib or @/store; if core needs\n' +
      '  something from a module, it does not. See server/src/modules.ts.\n',
  );
  process.exit(1);
}

console.log(`\n  module-blind: ${REGISTRIES.size} registry files know a module exists, nothing else does`);
console.log(
  `  ${moduleDirs.length} module${moduleDirs.length === 1 ? '' : 's'} · ` +
    'server halves reach no react · web halves reach no hono\n',
);
