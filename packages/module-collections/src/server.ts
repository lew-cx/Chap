/**
 * The vector store, mounted at `/_chap/collections`.
 *
 * This used to live in `server/src/` and was described there as "the only route
 * in Chap that thinks". It is a module now, which is the point: a consumer who
 * wants a LewLM chat client and not a retrieval bench deletes this directory and
 * two lines, and core does not notice.
 *
 * The division of labour has not changed. This module stores chunks and finds
 * candidates; LewLM embeds the text, scores the candidates and grounds the
 * answer. Neither side does the other's job.
 */

import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { collections } from './store.ts';

interface ModuleContext {
  env: NodeJS.ProcessEnv;
  dataDir: string;
  lewlm: { baseUrl: string; apiKey: string | undefined };
}

export function collectionsModule(context: ModuleContext) {
  // `CHAP_VECTOR_STORE` predates the module system and is still honoured, so an
  // existing install keeps its database where it left it.
  const storePath = context.env['CHAP_VECTOR_STORE'] ?? join(context.dataDir, 'vectors.sqlite');
  mkdirSync(dirname(storePath), { recursive: true });

  return {
    id: 'collections',
    label: 'Knowledge base',
    prefix: '/_chap/collections',
    env: ['CHAP_VECTOR_STORE'],
    mount: collections(context.lewlm, storePath),
    // No probe. The store is a local file opened at construction; if that failed
    // the process is already down, and a probe that can only answer "yes" is a
    // lie waiting to happen.
  };
}
