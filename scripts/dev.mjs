#!/usr/bin/env node
/**
 * Run the server and the web dev server together.
 *
 * This exists instead of a task-runner dependency because it is twenty lines
 * and Chap counts its dependencies.
 */

import { spawn, spawnSync } from 'node:child_process';

import { NPM, npmArgs } from './npm.mjs';

const TASKS = [
  { name: 'server', args: ['run', 'dev', '--workspace', '@chap/server'] },
  { name: 'web', args: ['run', 'dev', '--workspace', '@chap/web'] },
];

const children = TASKS.map(({ name, args }) => {
  const child = spawn(NPM.command, npmArgs(...args), {
    stdio: 'inherit',
    env: { ...process.env, CHAP_TASK: name },
  });
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    console.error(`\n[${name}] exited (${signal ?? code}) — stopping everything\n`);
    shutdown(code ?? 1);
  });
  return child;
});

let shuttingDown = false;

/**
 * Stop a task and everything it started.
 *
 * Each task is npm, which starts tsx or Vite beneath it. On POSIX npm forwards
 * the signal. On Windows `kill()` is TerminateProcess on npm alone, so the server
 * or Vite underneath kept running — still holding its port, still proxying — and
 * the next `npm run dev` came up beside a stale server it could not see.
 */
function stop(child) {
  if (child.exitCode !== null || child.pid === undefined) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    child.kill('SIGTERM');
  }
}

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) stop(child);
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
