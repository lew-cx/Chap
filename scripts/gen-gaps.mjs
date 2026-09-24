#!/usr/bin/env node
/**
 * Generate the gap list the Settings screen shows, from a real proof run.
 *
 * The list used to be a hand-maintained array in TypeScript, and it drifted from
 * both `docs/lewlm-gaps.md` and the proof it claimed to summarise: it named two
 * gaps that had closed, omitted the two that were open, and quoted tallies that
 * no longer matched. That screen is the one a visitor reads to judge whether the
 * project's central claim is honest, so it is the last place a duplicated copy
 * of a fact belongs.
 *
 * Same argument that generated `PIPELINE_ORDER` from DocKtizo's contract after
 * the hand-written copy turned out to be wrong: if a number can be observed, it
 * should not also be typed.
 *
 * Every upstream is proved the same way, so every upstream contributes here —
 * this script names no proof of its own, it runs the ones package.json declares.
 *
 * Usage:
 *   node scripts/gen-gaps.mjs            # run every proof, write the module
 *   node scripts/gen-gaps.mjs --check    # regenerate and diff; CI drift gate
 */

import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { NPM, npmArgs } from './npm.mjs';

const execFileAsync = promisify(execFile);

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'web/src/generated/proof.ts');

/** Every `proof*` script in package.json, in declaration order. */
async function proofScripts() {
  const manifest = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'));
  return Object.keys(manifest.scripts).filter((name) => /^proof(:|$)/.test(name));
}

/** Run one proof and read back the JSON it emitted. */
async function run(script, workDir) {
  const target = join(workDir, `${script.replace(/[:/]/g, '-')}.json`);
  try {
    await execFileAsync(NPM.command, npmArgs('run', '--silent', script, '--', '--emit', target), {
      cwd: ROOT,
      maxBuffer: 1024 * 1024 * 16,
    });
  } catch (cause) {
    // A proof exits non-zero only on FAIL, and a failing probe is still a fact
    // worth reporting. The emitted file is what matters, not the exit code.
    if (!cause.stdout?.includes('run written to')) {
      throw new Error(`${script} did not complete: ${cause.stderr || cause.message}`);
    }
  }
  return { script, run: JSON.parse(await readFile(target, 'utf8')) };
}

const BANNER = [
  '/**',
  ' * DO NOT EDIT.',
  ' *',
  " * Generated from a live proof run by `npm run gen:gaps`. It is what the",
  ' * Settings screen reports, so that screen cannot claim a gap the proof does',
  ' * not confirm, or miss one it does.',
  ' *',
  ' * Regenerate against the services you are pointing at, not from memory.',
  ' */',
  '',
].join('\n');

function emit(runs) {
  const entries = [];
  const suites = [];

  for (const { script, run } of runs) {
    suites.push({
      script,
      ranAt: run.ranAt,
      passed: run.passed,
      failed: run.failed,
      gaps: run.gaps,
      fixed: run.fixed,
    });
    for (const result of run.results) {
      if (!result.id) continue;
      entries.push({
        id: result.id,
        suite: script,
        title: result.name,
        // The upstream's own words about what is still missing, observed rather
        // than paraphrased.
        note: result.note,
        open: result.status === 'GAP',
      });
    }
  }

  return [
    BANNER,
    '/** One gap probe, as the proof reported it. */',
    'export interface ProofGap {',
    '  id: string;',
    '  /** Which proof script confirmed it — one per upstream. */',
    '  suite: string;',
    '  title: string;',
    '  /** What the probe observed. Never a paraphrase written here. */',
    '  note: string;',
    '  /** `false` means the upstream fixed it and Chap can drop its workaround. */',
    '  open: boolean;',
    '}',
    '',
    '/** The score line of each proof, verbatim. */',
    'export interface ProofSuite {',
    '  script: string;',
    '  ranAt: string;',
    '  passed: number;',
    '  failed: number;',
    '  gaps: number;',
    '  fixed: number;',
    '}',
    '',
    `export const PROOF_SUITES: readonly ProofSuite[] = ${JSON.stringify(suites, null, 2)} as const;`,
    '',
    `export const PROOF_GAPS: readonly ProofGap[] = ${JSON.stringify(entries, null, 2)} as const;`,
    '',
    '/** Gaps still confirmed open, which is what the Settings screen lists. */',
    'export const OPEN_GAPS: readonly ProofGap[] = PROOF_GAPS.filter((entry) => entry.open);',
    '',
  ].join('\n');
}

/**
 * Refuse to write a screen from a proof that never reached its upstream.
 *
 * A proof run against an absent service still emits a full result set, and it
 * looks like evidence: `proof:dk` with DocKtizo down reports five FAILs whose
 * note is `fetch failed`, then five GAPs noted `not verifiable without a
 * working token`. Written out, those become five *open gaps against DocKtizo*
 * on the Settings screen, and the suite line reads `0 passed · 5 failed`. The
 * same run also flipped LewLM's G27 from fixed to open, because this host has
 * no synthesis model it can load — the audio bundles here are `mlx_audio`, and
 * MLX does not exist off Apple silicon.
 *
 * None of that is a fact about an upstream's contract. It is a fact about this
 * machine, and the screen it would land on is the one a visitor reads to judge
 * whether this project's central claim is honest. `--check` made it worse by
 * telling whoever saw the drift to run `npm run gen:gaps`, which is exactly the
 * command that publishes the false version.
 *
 * So: a suite that passed nothing proved nothing. Every proof opens by
 * establishing liveness, so zero passing probes means the run never got far
 * enough for its GAP lines to mean absence-of-capability rather than
 * absence-of-service. That is refused rather than reported, which is the same
 * rule Chap already applies to itself — it does not invent an upstream's
 * answer, and an unreachable upstream has not given one.
 */
function unreachable(runs) {
  return runs
    .filter(({ run }) => run.passed === 0 && run.results.length > 0)
    .map(({ script, run }) => {
      const first = run.results.find((r) => r.status === 'FAIL') ?? run.results[0];
      return `${script}: ${run.failed} failed, nothing passed — first was "${first.name}: ${first.note}"`;
    });
}

const check = process.argv.includes('--check');
const workDir = await mkdtemp(join(tmpdir(), 'chap-gaps-'));

try {
  const scripts = await proofScripts();
  console.log(`\n  proving against live services: ${scripts.join(', ')}\n`);

  const runs = [];
  for (const script of scripts) runs.push(await run(script, workDir));

  const absent = unreachable(runs);
  if (absent.length > 0) {
    console.error('  a proof did not reach its upstream, so its gaps are not evidence:\n');
    for (const line of absent) console.error(`    ${line}`);
    console.error(
      '\n  Start the service and run again. The gap module is left as it is —\n' +
        '  regenerating from this run would publish gaps this machine invented.\n',
    );
    process.exit(1);
  }

  const next = emit(runs);
  const current = await readFile(OUT, 'utf8').catch(() => '');

  if (check) {
    // The run time differs on every run and is not a fact about the code, so it
    // is displayed but not diffed. What drifts is which gaps are open and what
    // the score line says; those are compared exactly.
    const substance = (source) => source.replace(/"ranAt": "[^"]*"/g, '"ranAt": "<when>"');
    if (substance(current) === substance(next)) {
      console.log('  gap module is in sync with the proofs\n');
      process.exit(0);
    }
    console.error(
      '\n  web/src/generated/proof.ts is out of date.\n' +
        '  Run `npm run gen:gaps` against the services you are pointing at.\n',
    );
    process.exit(1);
  }

  await writeFile(OUT, next);
  const open = runs.flatMap(({ run: one }) => one.results.filter((r) => r.status === 'GAP'));
  console.log(`  wrote ${OUT.replace(`${ROOT}/`, '')} — ${open.length} gap(s) open\n`);
} finally {
  await rm(workDir, { recursive: true, force: true });
}
