/**
 * Move a document onto a new version of its workflow.
 *
 * DocKtizo never does this implicitly: a `status_report.v1` document stays on
 * `status_report.v1`, reproducible byte for byte, until someone asks. Asking is
 * two calls, and the first one is the feature. The preview runs the registered
 * mapping, validates the candidate under the target version's complete rules,
 * writes nothing, and reports every consequence as a coded notice — which
 * fields were derived, which were dropped, whether the result would even be
 * valid.
 *
 * Chap adds no judgement to any of that. `required_acknowledgements` is the
 * exact list the submit will demand, so the checkboxes below are DocKtizo's
 * list rather than Chap's reading of the severities beside it — and
 * `migration_targets` is the exact set of versions a document may move onto, so
 * the chooser offers those and nothing else.
 */

import { useState } from 'react';

import { Labelled, Stat } from '@/components/Field.tsx';
import { Missing, Section } from '@/components/Screen.tsx';
import { Table } from '@/components/Table.tsx';

import { docktizo } from '../client.ts';
import { useWorkbench } from '../store.ts';
import type { MigrationPreview, MigrationRequest } from '../types.ts';
import { Failure, toggle, useAction } from './Shared.tsx';

export function Migrate({
  documentId,
  workflowId,
  parentRevisionId,
  onSubmitted,
}: {
  documentId: string;
  workflowId: string;
  parentRevisionId: string;
  onSubmitted: () => void;
}) {
  const types = useWorkbench((state) => state.types);
  const watch = useWorkbench((state) => state.watch);
  const [target, setTarget] = useState('');
  const [reason, setReason] = useState('');
  const [preview, setPreview] = useState<MigrationPreview | null>(null);
  const [acknowledged, setAcknowledged] = useState<string[]>([]);
  const { run, busy, done, failure } = useAction();

  /**
   * Which versions to offer: exactly the ones DocKtizo has a strategy for.
   *
   * This used to be every other installed version of the same document type — a
   * superset, offered because the registered pairs were not published, so the
   * chooser could present a migration that could not happen and the user found
   * out from a `422 unsupported_workflow_migration`. `migration_targets` is that
   * set, read off the workflow it belongs to.
   */
  const candidates = types.find((type) => type.workflow_id === workflowId)?.migration_targets ?? [];

  if (candidates.length === 0) {
    return (
      <Section title="migrate" hint="no registered migration from this version">
        <Missing>DocKtizo has no strategy for moving a {workflowId} document onto another version.</Missing>
      </Section>
    );
  }

  const request = (): MigrationRequest => ({
    parent_revision_id: parentRevisionId,
    source_workflow_id: workflowId,
    target_workflow_id: target,
    // Exactly one of these is allowed. Chap always takes the target's own
    // default, because the alternative needs a template that is already
    // compatible with the target version and DocKtizo installs none by default.
    use_target_default_template: true,
    reason,
  });

  const describe = () =>
    run(async () => {
      const result = await docktizo.documents.migrations.preview(documentId, request());
      setPreview(result);
      setAcknowledged([]);
    });

  const submit = () =>
    run(async () => {
      const accepted = await docktizo.documents.migrations.create(
        documentId,
        { ...request(), acknowledged_notices: acknowledged },
        crypto.randomUUID(),
      );
      watch(accepted.generation_id);
      setPreview(null);
      onSubmitted();
    });

  const required = preview?.required_acknowledgements ?? [];
  const outstanding = required.filter((code) => !acknowledged.includes(code));

  return (
    <Section title="migrate" hint={`from ${workflowId} · revision ${parentRevisionId.slice(-8)}`}>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <Labelled label="target version">
          <select
            className="field w-56"
            value={target}
            onChange={(event) => {
              setTarget(event.target.value);
              setPreview(null);
            }}
          >
            <option value="">choose</option>
            {candidates.map((candidate) => (
              <option key={candidate} value={candidate}>
                {candidate}
              </option>
            ))}
          </select>
        </Labelled>

        <Labelled label="reason">
          <input
            className="field w-96"
            value={reason}
            placeholder="recorded on the migration revision"
            onChange={(event) => setReason(event.target.value)}
          />
        </Labelled>

        <button type="button" className="btn" disabled={busy || !target || !reason.trim()} onClick={describe}>
          {busy ? 'working…' : 'preview'}
        </button>
      </div>

      {preview && (
        <>
          <div className="panel mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="policy" value={preview.migration_policy_version} />
            <Stat label="template" value={preview.target_template_policy} />
            <Stat label="loses content" value={preview.loses_content ? 'yes' : 'no'} />
            <Stat label="candidate" value={preview.candidate_valid ? 'valid' : 'invalid'} />
          </div>

          {!preview.candidate_valid && (
            // Worth its own line: the mapping succeeded and the result still
            // would not pass the target version's rules, so the submit will be
            // refused with `invalid_migration_candidate`. Saying which rules is
            // the difference between "try again" and "fix this first".
            <p className="micro-label mb-3" style={{ color: 'var(--skin-warn)' }}>
              {preview.target_workflow_id} would reject this document:{' '}
              {preview.validation_issue_codes.join(' · ')}
            </p>
          )}

          <Table
            columns={[
              { key: 'severity', label: 'severity', render: (row) => row.severity },
              { key: 'path', label: 'field', render: (row) => row.path.join('.') || '—' },
              { key: 'message', label: 'consequence', render: (row) => row.message },
              {
                key: 'ack',
                label: 'accept',
                render: (row) =>
                  row.acknowledgement_required ? (
                    <input
                      type="checkbox"
                      checked={acknowledged.includes(row.code)}
                      onChange={() => setAcknowledged(toggle(acknowledged, row.code))}
                    />
                  ) : (
                    '—'
                  ),
              },
            ]}
            rows={preview.notices}
            empty="the mapping is lossless and derives nothing"
          />

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn-accent"
              disabled={busy || outstanding.length > 0}
              onClick={submit}
            >
              migrate to {preview.target_workflow_id}
            </button>
            {outstanding.length > 0 && (
              <span className="micro-label">accept {outstanding.join(' · ')} first</span>
            )}
          </div>
        </>
      )}

      {/* Both buttons run through `useAction`, so `done` alone cannot say which
          one finished. The submit is the one that clears the preview. */}
      {done && !preview && (
        <p className="micro-label mt-3">
          accepted — the migration runs in DocKtizo's worker and stops at review like any revision
        </p>
      )}
      <Failure failure={failure} />
    </Section>
  );
}
