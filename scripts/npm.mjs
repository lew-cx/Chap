/**
 * How to invoke npm from a script, on every platform.
 *
 * `spawn('npm')` finds nothing on Windows: the executable there is `npm.cmd`,
 * and since Node 18.20 a `.cmd` cannot be spawned without `shell: true` — which
 * then hands you the job of quoting every argument, including temp paths that
 * routinely contain a space. Both traps disappear by running npm's own CLI
 * under the node process we are already inside.
 *
 * `npm_execpath` is set by npm for every script it runs, and these scripts are
 * only ever reached through `npm run`. The literal is a fallback for someone
 * invoking a file directly with `node scripts/dev.mjs`, where at least the
 * failure is visible and immediate rather than silently platform-specific.
 *
 * This lives in one file because a subtle Windows workaround copied into two
 * scripts is how one of them drifts.
 */

const execpath = process.env['npm_execpath'];

/** The command to spawn, and the arguments that must precede `run`. */
export const NPM = execpath
  ? { command: process.execPath, prefix: [execpath] }
  : { command: process.platform === 'win32' ? 'npm.cmd' : 'npm', prefix: [] };

/** Arguments for one npm invocation, with whatever prefix this platform needs. */
export const npmArgs = (...args) => [...NPM.prefix, ...args];
