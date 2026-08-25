#!/usr/bin/env node
/**
 * Is this machine able to run Chap?
 *
 * Chap depends on two Node features that arrived mid-22 and are easy to be
 * fractionally short of: `node:sqlite` (module-collections' whole store) and
 * `--env-file-if-exists` (how the server and both proofs read `.env`). A Node
 * that is merely close enough fails later, inside a module, as something that
 * reads like a Chap bug.
 *
 * So this asks the runtime rather than trusting `engines`: it runs the features
 * in a child process and reports what actually happened. A version comparison
 * would only be as right as the constant someone typed.
 *
 * Blockers exit non-zero — `npm run dev` runs this first. Advisories are things
 * a fresh checkout is simply missing yet, and they never stop the app.
 */

import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const blockers = [];
const advisories = [];

// --- the runtime ------------------------------------------------------------

/**
 * One child process proves both features at once: the flag has to be accepted
 * on the command line, and the import has to resolve without
 * `--experimental-sqlite`. `--no-warnings` keeps the experimental notice out of
 * a report whose whole job is to be readable.
 */
async function runtimeIsCapable() {
  try {
    await execFileAsync(
      process.execPath,
      ['--no-warnings', '--env-file-if-exists=.env.nonexistent', '--input-type=module', '--eval',
        "import('node:sqlite').then((m) => { if (!m.DatabaseSync) process.exit(1); });"],
      { cwd: ROOT },
    );
    return true;
  } catch {
    return false;
  }
}

/** Which of the two failed, asked separately, so the report can name it. */
async function diagnoseRuntime() {
  const tried = async (args) => {
    try {
      await execFileAsync(process.execPath, args, { cwd: ROOT });
      return true;
    } catch {
      return false;
    }
  };

  const sqlite = await tried(['--no-warnings', '--input-type=module', '--eval',
    "import('node:sqlite').then((m) => { if (!m.DatabaseSync) process.exit(1); });"]);
  const envFile = await tried(['--env-file-if-exists=.env.nonexistent', '--eval', '0']);

  if (!sqlite) {
    blockers.push(
      'node:sqlite is not available unflagged — module-collections cannot open its store.',
    );
  }
  if (!envFile) {
    blockers.push(
      '--env-file-if-exists is not supported — the server and both proofs read .env with it.',
    );
  }
  if (sqlite && envFile) {
    blockers.push('the runtime check failed for a reason this script did not anticipate.');
  }
}

// --- the checkout -----------------------------------------------------------

const manifest = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'));
const wanted = manifest.engines?.node ?? '(none declared)';

if (!(await runtimeIsCapable())) {
  await diagnoseRuntime();
  blockers.push(`this is Node ${process.version}; Chap declares "${wanted}".`);
}

if (!existsSync(join(ROOT, 'node_modules'))) {
  blockers.push('dependencies are not installed — run `npm install`.');
}

if (!existsSync(join(ROOT, 'packages/lewlm/src/generated'))) {
  advisories.push(
    'the generated LewLM contract is missing — run `npm run gen:types`.\n' +
      '      It falls back to the committed vendor/openapi.json, so no LewLM checkout is needed.',
  );
}

if (!existsSync(join(ROOT, '.env'))) {
  advisories.push(
    'no .env — defaults apply (LewLM on 127.0.0.1:8080, Chap on 127.0.0.1:8787).\n' +
      '      Copy .env.example to .env to point somewhere else or supply a key.',
  );
}

// Reachability, not correctness: the one question a fresh machine actually has.
const baseUrl = process.env['LEWLM_BASE_URL'] ?? 'http://127.0.0.1:8080';
try {
  await fetch(`${baseUrl}/v1/health`, { signal: AbortSignal.timeout(1500) });
} catch {
  advisories.push(
    `nothing answered at ${baseUrl} — start LewLM before expecting the chat surface to work.`,
  );
}

// --- report -----------------------------------------------------------------

console.log(`\n  node ${process.version} on ${process.platform}/${process.arch}\n`);

for (const line of advisories) console.log(`  note  ${line}`);
if (advisories.length > 0) console.log('');

if (blockers.length > 0) {
  for (const line of blockers) console.error(`  STOP  ${line}`);
  console.error('');
  process.exit(1);
}

console.log('  ready\n');
