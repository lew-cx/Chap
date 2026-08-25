/**
 * What a generation produced, and everything that happens to it afterwards.
 *
 * This tab is the half of DocKtizo that Chap could not previously reach. The
 * pipeline's own stepper ends at `awaiting_review`, and until now that was a
 * wall: the run finished, the artifact existed, and nothing in the UI could
 * approve it, send it back, correct it, or move it onto a newer version of its
 * workflow. All four are DocKtizo routes; none of them had a caller.
 *
 * Everything here writes through an `Idempotency-Key`, because every one of
 * these actions is one a double-click must not perform twice.
 */

import { useState } from 'react';

import { Labelled, Stat } from '@/components/Field.tsx';
import { StatusDot } from '@/components/Nav.tsx';
import { Missing, Section } from '@/components/Screen.tsx';
import { Table } from '@/components/Table.tsx';

import { docktizo } from '../client.ts';
import { useWorkbench } from '../store.ts';
import type { ApprovalRecord, DocumentDetail, RevisionSummary } from '../types.ts';
import { Migrate } from './Migrate.tsx';
import { Artifacts, Failure, useAction, useRead } from './Shared.tsx';

export function Document() {
  const documentId = useWorkbench((state) => state.documentId);
  const open = useWorkbench((state) => state.open);

  if (!documentId) return <Catalogue onOpen={open} />;

  return <Detail documentId={documentId} onClose={() => open(null)} />;
}

/**
 * Everything this workspace has made.
 *
 * This tab used to open on a box asking you to paste a `document_id`, because
 * one document at a time was all DocKtizo would answer for. The obvious
 * workaround — keeping a local list of documents this browser happened to have
 * seen — was the one thing the module would not build, since it would be wrong
 * for anything created anywhere else and stale the moment a revision landed.
 * `GET /v1/documents` replaced the argument with a route.
 */
function Catalogue({ onOpen }: { onOpen: (documentId: string) => void }) {
  const { data, failure } = useRead(() => docktizo.documents.list(), []);
  const documents = data?.items ?? [];

  return (
    <Section
      title="documents"
      hint={`${documents.length}${data?.has_more ? '+ · newest page' : ''} in this workspace`}
    >
      <Table
        columns={[
          { key: 'title', label: 'title', render: (row) => row.title },
          { key: 'workflow', label: 'workflow', render: (row) => row.workflow_id },
          { key: 'rev', label: 'rev', numeric: true, render: (row) => row.current_revision_number },
          { key: 'review', label: 'review', render: (row) => <ReviewDot state={row.approval.state} /> },
          {
            key: 'updated',
            label: 'updated',
            render: (row) => row.updated_at.slice(0, 19).replace('T', ' '),
          },
        ]}
        rows={documents}
        onSelect={(row) => onOpen(row.document_id)}
        empty={failure?.message ?? 'none yet — the generate tab makes one'}
      />
    </Section>
  );
}

function Detail({ documentId, onClose }: { documentId: string; onClose: () => void }) {
  // One read for the whole tab. Every write below changes the head revision, the
  // review state, or both, so refreshing anything less would leave two panels
  // disagreeing about the same document.
  const { data, failure, reload } = useRead(
    () =>
      Promise.all([docktizo.documents.get(documentId), docktizo.documents.revisions(documentId)]),
    [documentId],
  );
  const [picked, setPicked] = useState<string | null>(null);

  if (!data) return <Missing>{failure?.message ?? `reading ${documentId}…`}</Missing>;

  const [document, history] = data;
  const revisions: RevisionSummary[] = history.items;
  const head = document.current_revision_id;
  // Falling back to head rather than latching it on first load: until a row is
  // picked, the panel below follows the document, so a revision that lands is
  // the one you are looking at.
  const selectedId = picked ?? head;

  return (
    <>
      <Section
        title="document"
        hint={
          <>
            {documentId}
            <button type="button" className="chip ml-2" onClick={onClose}>
              all documents
            </button>
          </>
        }
      >
        <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="title" value={document.title} />
          <Stat label="workflow" value={document.workflow_id} />
          <Stat label="revision" value={document.current_revision_number} />
          <Stat label="formats" value={document.output_formats.join(' · ')} />
          <div className="flex flex-col gap-0.5">
            <span className="micro-label">review</span>
            <ReviewDot state={document.approval.state} />
          </div>
        </div>
      </Section>

      <Section title="revisions" hint={`${revisions.length} · oldest first · head is last`}>
        <Table
          columns={[
            { key: 'n', label: '#', numeric: true, render: (row) => row.revision_number },
            {
              key: 'mode',
              label: 'mode',
              // `migration` is the one mode that says where the content came
              // from as well as how, so it carries its source version with it.
              render: (row) =>
                row.revision_mode === 'migration'
                  ? `migration · from ${row.source_workflow_id ?? '?'}`
                  : row.revision_mode,
            },
            { key: 'workflow', label: 'workflow', render: (row) => row.workflow_id },
            { key: 'state', label: 'state', render: (row) => row.execution_state },
            { key: 'review', label: 'review', render: (row) => row.approval.state },
            { key: 'when', label: 'created', render: (row) => row.created_at.slice(0, 19).replace('T', ' ') },
            {
              key: 'head',
              label: '',
              render: (row) => (row.revision_id === head ? 'head' : ''),
            },
          ]}
          rows={revisions}
          onSelect={(row) => setPicked(row.revision_id)}
          selected={(row) => row.revision_id === selectedId}
          empty="none"
        />
      </Section>

      {selectedId && <Revision revisionId={selectedId} isHead={selectedId === head} onChange={reload} />}

      {head && (
        <Migrate
          documentId={documentId}
          workflowId={document.workflow_id}
          parentRevisionId={head}
          onSubmitted={reload}
        />
      )}
    </>
  );
}

/** DocKtizo's six review states, in Chap's three tones. */
function ReviewDot({ state }: { state: DocumentDetail['approval']['state'] }) {
  const tone =
    state === 'approved' ? 'ok' : state === 'rejected' || state === 'changes_requested' ? 'danger' : 'warn';
  return <StatusDot tone={tone}>{state}</StatusDot>;
}

function Revision({
  revisionId,
  isHead,
  onChange,
}: {
  revisionId: string;
  isHead: boolean;
  onChange: () => void;
}) {
  const { data, failure, reload } = useRead(
    () =>
      Promise.all([docktizo.revisions.get(revisionId), docktizo.revisions.approvals(revisionId)]),
    [revisionId],
  );

  const refresh = () => {
    reload();
    onChange();
  };

  // This read used to swallow its failure, so an unreadable revision looked
  // identical to one still loading and stayed that way.
  if (!data) return <Missing>{failure?.message ?? `reading ${revisionId}…`}</Missing>;

  const [revision, approvals] = data;
  const decisions: ApprovalRecord[] = approvals.decisions;

  return (
    <>
      <Section title={`revision ${revision.revision_number}`} hint={revisionId}>
        <div className="panel mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="mode" value={revision.revision_mode} />
          <Stat label="workflow" value={`${revision.workflow_id}`} />
          <Stat label="parent" value={revision.parent_revision_id?.slice(-8) ?? '—'} />
          <Stat label="changed" value={revision.changed_fields.join(' · ') || 'whole document'} />
        </div>

        {revision.migration_policy_version && (
          // The lineage a migration leaves behind. Worth stating plainly: this
          // revision's content was mapped from another version by a named
          // policy, not generated, and that is why no model produced it.
          <p className="micro-label mb-3">
            migrated from {revision.source_workflow_id} by policy {revision.migration_policy_version}
          </p>
        )}

        <Artifacts artifacts={revision.artifacts} empty="no artifacts" />
      </Section>

      <Section title="review" hint={`${decisions.length} decision${decisions.length === 1 ? '' : 's'}`}>
        {decisions.length > 0 && (
          <Table
            columns={[
              { key: 'seq', label: '#', numeric: true, render: (row) => row.sequence },
              { key: 'decision', label: 'decision', render: (row) => row.decision },
              { key: 'actor', label: 'actor', render: (row) => row.actor_id },
              { key: 'comment', label: 'comment', render: (row) => row.comment ?? '—' },
              { key: 'when', label: 'at', render: (row) => row.created_at.slice(11, 19) },
            ]}
            rows={decisions}
          />
        )}
        <Decide revisionId={revisionId} enabled={revision.requires_review} onDecided={refresh} />
      </Section>

      {isHead && <Revise revisionId={revisionId} documentId={revision.document_id} onSubmitted={refresh} />}
    </>
  );
}

/**
 * Approve, reject, or send back.
 *
 * The three buttons stay live whatever the current review state is. DocKtizo
 * decides which transitions are legal and answers an illegal one with
 * `invalid_approval_transition`; a client that greys out the buttons instead is
 * restating that rule in TypeScript and will be wrong about it eventually.
 */
function Decide({
  revisionId,
  enabled,
  onDecided,
}: {
  revisionId: string;
  enabled: boolean;
  onDecided: () => void;
}) {
  const [comment, setComment] = useState('');
  const { run, busy, failure } = useAction(onDecided);

  if (!enabled) return <Missing>this workflow does not require review</Missing>;

  const decide = (action: 'approve' | 'reject' | 'request-changes') =>
    run(() => docktizo.revisions.decide(revisionId, action, comment, crypto.randomUUID()));

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-end gap-3">
        <Labelled label="comment">
          <input
            className="field w-96"
            value={comment}
            placeholder="recorded with the decision"
            onChange={(event) => setComment(event.target.value)}
          />
        </Labelled>
        <button type="button" className="btn-accent" disabled={busy} onClick={() => decide('approve')}>
          approve
        </button>
        <button type="button" className="chip" disabled={busy} onClick={() => decide('request-changes')}>
          request changes
        </button>
        <button type="button" className="chip" disabled={busy} onClick={() => decide('reject')}>
          reject
        </button>
      </div>
      <Failure failure={failure} />
    </div>
  );
}

/**
 * Two ways to produce the next revision, and they differ in who writes the words.
 *
 * A targeted revision names the fields to redo and hands the workflow
 * instructions; a manual override supplies the values outright and no model runs
 * at all. Both are new immutable revisions, both are validated and re-rendered
 * under the workflow's own rules, and both go through the durable executor —
 * which is why both come back as a generation to watch rather than a result.
 */
function Revise({
  revisionId,
  documentId,
  onSubmitted,
}: {
  revisionId: string;
  documentId: string;
  onSubmitted: () => void;
}) {
  const watch = useWorkbench((state) => state.watch);
  const [instructions, setInstructions] = useState('');
  const [fields, setFields] = useState('');
  const [values, setValues] = useState('{\n  \n}');
  const [reason, setReason] = useState('');
  const { run, busy, done, failure } = useAction(onSubmitted);

  const targets = fields.split(',').map((field) => field.trim()).filter(Boolean);

  const revise = () =>
    run(async () => {
      const accepted = await docktizo.documents.revise(
        documentId,
        { parent_revision_id: revisionId, instructions, target_fields: targets, source_ids: [] },
        crypto.randomUUID(),
      );
      watch(accepted.generation_id);
    });

  const override = () =>
    run(async () => {
      const accepted = await docktizo.documents.override(
        documentId,
        { parent_revision_id: revisionId, reason, fields: JSON.parse(values) },
        crypto.randomUUID(),
      );
      watch(accepted.generation_id);
    });

  return (
    <Section title="revise" hint="a new revision; the one above is never rewritten">
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="panel">
          <p className="micro-label mb-2">targeted — the workflow redoes these fields</p>
          <Labelled label="target_fields">
            <input
              className="field code w-full"
              value={fields}
              placeholder="executive_summary, next_steps"
              onChange={(event) => setFields(event.target.value)}
            />
          </Labelled>
          <div className="mt-2">
            <Labelled label="instructions">
              <textarea
                className="field h-20 w-full"
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
              />
            </Labelled>
          </div>
          <button
            type="button"
            className="btn-accent mt-3"
            disabled={busy || !instructions.trim() || targets.length === 0}
            onClick={revise}
          >
            request revision
          </button>
        </div>

        <div className="panel">
          <p className="micro-label mb-2">manual — these values, no model in the loop</p>
          <Labelled label="reason">
            <input
              className="field w-full"
              value={reason}
              placeholder="why the correction is being made"
              onChange={(event) => setReason(event.target.value)}
            />
          </Labelled>
          <div className="mt-2">
            <Labelled label="fields">
              <textarea
                className="field code h-20 w-full"
                value={values}
                onChange={(event) => setValues(event.target.value)}
              />
            </Labelled>
          </div>
          <button
            type="button"
            className="btn mt-3"
            disabled={busy || !reason.trim()}
            onClick={override}
          >
            submit override
          </button>
        </div>
      </div>
      {done && (
        <p className="micro-label mt-3">
          accepted — the generation tab is following it; this document changes when it lands
        </p>
      )}
      <Failure failure={failure} />
    </Section>
  );
}
