/**
 * DocKtizo's contribution to Chap: one top-level screen, five tabs.
 *
 * The screen reuses Chap's own `Screen` frame rather than inventing a second
 * one, which is the whole point of a module having access to `@/components` —
 * a module should look like the app it is installed into, not like a widget
 * bolted onto it.
 *
 * The tabs follow the lifecycle rather than the API: make material, ask for a
 * document, watch the run, then review, revise or migrate what came out. The
 * last of those is new, and it is the half of DocKtizo that Chap could not
 * previously reach — a generation that stopped at `awaiting_review` had nowhere
 * to go.
 *
 * Readiness is not declared here. Core wraps this in a gate that asks the server
 * whether DocKtizo can actually work, so an unconfigured host shows DocKtizo's
 * own error instead of five tabs that all fail on click.
 */

import { useEffect } from 'react';

import { Labelled } from '@/components/Field.tsx';
import { Screen } from '@/components/Screen.tsx';

import { useWorkbench } from './store.ts';
import { Document } from './ui/Document.tsx';
import { DocumentTypes } from './ui/DocumentTypes.tsx';
import { Generate } from './ui/Generate.tsx';
import { Generation } from './ui/Generation.tsx';
import { Sources } from './ui/Sources.tsx';

/**
 * The workflow the next document will be generated in.
 *
 * It lives in the header rather than inside the generate tab because DocKtizo
 * stopped being a one-workflow service: with `status_report.v1`,
 * `status_report.v2`, `executive_memo.v1` and `proposal.v1` installed, which one
 * you are working in is standing context rather than a step in one form.
 *
 * It is labelled for what it selects — a workflow — rather than for an action it
 * does not perform. `new document` was the earlier label and was wrong twice
 * over: this control creates nothing, and it stays on screen while you browse
 * documents it has no bearing on. An existing document carries its own version,
 * which is the whole point of DocKtizo never resolving anything to "the latest",
 * so the document tab shows the document's version and this control is left
 * alone. The hint says which documents it does govern.
 */
function WorkflowPicker() {
  const types = useWorkbench((state) => state.types);
  const documentType = useWorkbench((state) => state.documentType);
  const select = useWorkbench((state) => state.select);
  const load = useWorkbench((state) => state.load);

  useEffect(load, [load]);

  if (types.length === 0) return null;

  return (
    <Labelled label="workflow">
      <select
        className="field w-56"
        aria-label="workflow for new documents"
        title="the workflow a new document is generated in; existing documents carry their own"
        value={documentType?.workflow_id ?? ''}
        onChange={(event) => select(event.target.value)}
      >
        {types.map((type) => (
          <option key={type.workflow_id} value={type.workflow_id}>
            {type.workflow_id}
          </option>
        ))}
      </select>
    </Labelled>
  );
}

export const docktizo = {
  id: 'docktizo',
  label: 'DocKtizo',
  screen: () => (
    <Screen
      actions={<WorkflowPicker />}
      tabs={[
        { id: 'types', component: DocumentTypes },
        { id: 'sources', component: Sources },
        { id: 'generate', component: Generate },
        { id: 'generation', component: Generation },
        { id: 'document', component: Document },
      ]}
    />
  ),
};
