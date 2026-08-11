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

export type Status = 'PASS' | 'FAIL' | 'GAP' | 'FIXED' | 'SKIP';

const results: { status: Status; name: string; note: string }[] = [];

export function record(status: Status, name: string, note = '') {
  results.push({ status, name, note });
  const mark = { PASS: ' ok ', FAIL: 'FAIL', GAP: 'gap ', FIXED: 'FIXD', SKIP: 'skip' }[status];
  console.log(`  [${mark}] ${name}${note ? `  ${note}` : ''}`);
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
      record('FIXED', `${id} ${name}`, 'fixed upstream — Chap can drop its workaround');
    } else {
      record('GAP', `${id} ${name}`, note);
    }
  } catch (error) {
    record('FAIL', `${id} ${name}`, error instanceof Error ? error.message : String(error));
  }
}

/** Print the score line and exit. The line is copied verbatim into a gaps doc. */
export function summarize(): never {
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const gaps = results.filter((r) => r.status === 'GAP').length;
  const fixed = results.filter((r) => r.status === 'FIXED').length;

  console.log(
    `\n  ${results.filter((r) => r.status === 'PASS').length} passed · ${failed} failed · ` +
      `${gaps} gaps confirmed · ${fixed} gaps fixed upstream\n`,
  );
  if (fixed > 0) console.log('  A FIXD line means Chap can now delete a workaround.\n');
  process.exit(failed > 0 ? 1 : 0);
}

/** `--name value` off argv, with a fallback. Every proof takes flags this way. */
export function flag(name: string, fallback: string): string {
  const args = process.argv.slice(2);
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : (args[i + 1] ?? fallback);
}
