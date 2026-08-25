#!/usr/bin/env node
/**
 * Run the server and the web dev server together.
 *
 * This exists instead of a task-runner dependency because it is twenty lines
 * and Chap counts its dependencies.
 */

import { spawn } from 'node:child_process';

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

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill('SIGTERM');
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
