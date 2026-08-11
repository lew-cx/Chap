/**
 * The knowledge base's contribution: one tab in the Lab.
 *
 * A tab rather than a screen, because this is a LewLM-adjacent surface and the
 * Lab is where those live. Contrast `@chap/module-docktizo`, which fronts a
 * different service entirely and takes a nav entry of its own — the two
 * contribution points exist because modules genuinely differ in size.
 */

import { Knowledge } from './ui/Knowledge.tsx';

export const collections = {
  id: 'collections',
  label: 'Knowledge base',
  tabs: [{ screen: 'lab' as const, id: 'knowledge', component: Knowledge }],
};
