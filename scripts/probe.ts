/**
 * The shared harness behind every proof run.
 *
 * Chap proves each upstream the same way, so the primitives live here rather
 * than in whichever proof was written first. `scripts/proof.ts` uses them
 * against LewLM; each module's own `proof.ts` uses them against whatever it
 * fronts.
 *
 * The important primitive is `gap`. A gap probe asserts the CURRENT, BROKEN
 * behaviour of an upstream. When the upstream is fixed the probe flips to
 * `FIXD`, which is the signal that a workaround can be deleted. A gap probe that
 * starts passing is good news, not a failure — which is why `summarize` exits
 * non-zero only on FAIL.
 */

import { writeFileSync } from 'node:fs';

export type Status = 'PASS' | 'FAIL' | 'GAP' | 'FIXED' | 'SKIP';

export interface Result {
  status: Status;
  name: string;
  note: string;
  /** The gap id, on entries that have one. Absent on plain checks. */
  id?: string;
}

const results: Result[] = [];

export function record(status: Status, name: string, note = '', id?: string) {
  results.push(id ? { status, name, note, id } : { status, name, note });
  const mark = { PASS: ' ok ', FAIL: 'FAIL', GAP: 'gap ', FIXED: 'FIXD', SKIP: 'skip' }[status];
  // The id stays a field as well as part of the line: the line is for reading,
  // the field is what `npm run gen:gaps` builds the Settings screen from.
  console.log(`  [${mark}] ${id ? `${id} ` : ''}${name}${note ? `  ${note}` : ''}`);
}

export async function check(name: string, fn: () => Promise<string | void>) {
  try {
    record('PASS', name, (await fn()) || '');
  } catch (error) {
    record('FAIL', name, error instanceof Error ? error.message : String(error));
  }
}

/**
 * A probe for a known gap. `expectBroken` returns a note when the broken
 * behaviour is still present, or null when the upstream has been fixed.
 */
export async function gap(id: string, name: string, expectBroken: () => Promise<string | null>) {
  try {
    const note = await expectBroken();
    if (note === null) {
      record('FIXED', name, 'fixed upstream — Chap can drop its workaround', id);
    } else {
      record('GAP', name, note, id);
    }
  } catch (error) {
    record('FAIL', name, error instanceof Error ? error.message : String(error), id);
  }
}

export interface ProofRun {
  ranAt: string;
  passed: number;
  failed: number;
  gaps: number;
  fixed: number;
  results: Result[];
}

/** The run as data, which is what the gap screen is generated from. */
export function summary(): ProofRun {
  const count = (status: Status) => results.filter((result) => result.status === status).length;
  return {
    ranAt: new Date().toISOString(),
    passed: count('PASS'),
    failed: count('FAIL'),
    gaps: count('GAP'),
    fixed: count('FIXED'),
    results: [...results],
  };
}

/**
 * Print the score line and exit. The line is copied verbatim into a gaps doc.
 *
 * `--emit <path>` also writes the run as JSON. That is what `npm run gen:gaps`
 * reads, so the Settings screen reports a real run rather than a hand-kept list
 * that drifts away from one.
 */
export function summarize(): never {
  const run = summary();

  console.log(
    `\n  ${run.passed} passed · ${run.failed} failed · ` +
      `${run.gaps} gaps confirmed · ${run.fixed} gaps fixed upstream\n`,
  );
  if (run.fixed > 0) console.log('  A FIXD line means Chap can now delete a workaround.\n');

  const target = flag('emit', '');
  if (target) {
    writeFileSync(target, `${JSON.stringify(run, null, 2)}\n`);
    console.log(`  run written to ${target}\n`);
  }

  process.exit(run.failed > 0 ? 1 : 0);
}

/** `--name value` off argv, with a fallback. Every proof takes flags this way. */
export function flag(name: string, fallback: string): string {
  const args = process.argv.slice(2);
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : (args[i + 1] ?? fallback);
}
