#!/usr/bin/env node
/**
 * Enforce the rule that keeps the dual-skin architecture honest.
 *
 * Exactly five files may know a skin exists: AppShell, BenchShell,
 * ShowroomShell, store/skin.ts and shell/SkinPanel.tsx (the skin control and
 * token inspector). Everything else reads the token layer and renders
 * identically in both skins.
 *
 * Without this check, the first `skin === 'bench' ? … : …` in a component goes
 * unnoticed, the second is precedent, and within a month there are two apps.
 * A violation here is a design bug, not a lint nit — see docs/skins.md.
 */

import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Both trees that render. A module's UI is outside web/src and would otherwise
 * be the one place in Chap where a skin branch could appear unchallenged.
 */
const TREES = [join(ROOT, 'web/src'), ...(await moduleSources())];

async function moduleSources() {
  const entries = await readdir(join(ROOT, 'packages'), { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('module-'))
    .map((entry) => join(ROOT, 'packages', entry.name, 'src'));
}

const ALLOWED = new Set([
  'web/src/shell/AppShell.tsx',
  'web/src/shell/BenchShell.tsx',
  'web/src/shell/ShowroomShell.tsx',
  'web/src/store/skin.ts',
  // The skin control and the token inspector. The rule is that no *screen* may
  // branch on the skin; the control surface for a setting necessarily knows the
  // setting, so it lives in the shell and Settings composes it.
  'web/src/shell/SkinPanel.tsx',
]);

/** Signals that a file is branching on the skin rather than reading tokens. */
const FORBIDDEN = [
  { pattern: /useSkin/, label: 'useSkin()' },
  { pattern: /data-skin|dataset\.skin|dataset\['skin'\]/, label: 'data-skin' },
  { pattern: /['"]showroom['"]|['"]bench['"]/, label: 'a skin name' },
];

/** Escape hatches are fine in small numbers; unbounded use defeats the tokens. */
const VARIANT_BUDGET = 25;

/**
 * Blank out comments so a file may *describe* the rule without violating it.
 * Replaces with spaces rather than deleting, to keep line numbers accurate.
 */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/.*$/gm, (_match, prefix) => prefix);
}

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (/\.(ts|tsx|css)$/.test(entry.name)) yield path;
  }
}

async function* trees() {
  for (const tree of TREES) yield* files(tree);
}

/**
 * A repo-relative path in one spelling, on every platform. `relative()` returns
 * backslashes on Windows, and every literal this script compares against — and
 * every path it prints — is written with forward slashes.
 */
const relPath = (path) => relative(ROOT, path).replaceAll('\\', '/');

const violations = [];
let variantUses = 0;

for await (const path of trees()) {
  const rel = relPath(path);
  const source = await readFile(path, 'utf8');

  // Count `bench:` / `showroom:` Tailwind variants wherever they appear.
  variantUses += (source.match(/\b(?:bench|showroom):[a-z[]/g) ?? []).length;

  // tokens.css defines the skins; it is the token layer, not a component.
  if (ALLOWED.has(rel) || rel.endsWith('styles/tokens.css')) continue;

  const code = stripComments(source);
  for (const { pattern, label } of FORBIDDEN) {
    code.split('\n').forEach((line, index) => {
      if (pattern.test(line)) violations.push({ rel, line: index + 1, label, text: line.trim() });
    });
  }
}

if (violations.length > 0) {
  console.error('\n  skin leaked out of the shell:\n');
  for (const { rel, line, label, text } of violations) {
    console.error(`  ${rel}:${line}  references ${label}`);
    console.error(`    ${text.slice(0, 100)}`);
  }
  console.error(
    '\n  These files must render identically in both skins. If you need a\n' +
      '  difference, add a --skin-* token and a recipe in styles/recipes.css.\n' +
      '  See docs/skins.md.\n',
  );
  process.exit(1);
}

console.log(`\n  skin-blind: ${ALLOWED.size} shell files know the skin, nothing else does`);
console.log(`  variant escape hatches: ${variantUses}/${VARIANT_BUDGET}\n`);

if (variantUses > VARIANT_BUDGET) {
  console.error(
    `  Over the escape-hatch budget. Each bench:/showroom: variant is a place\n` +
      `  the token layer did not reach. Prefer a token.\n`,
  );
  process.exit(1);
}
