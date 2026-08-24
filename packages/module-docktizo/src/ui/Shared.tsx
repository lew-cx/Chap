/**
 * What more than one tab needs.
 *
 * Three small things, and each is here because the second copy of it would have
 * drifted from the first: how a write goes busy, how it reports its refusal, and
 * how an artifact is offered for download.
 */

import { useState } from 'react';

import { Disclosure } from '@/components/Disclosure.tsx';
import { Json } from '@/components/Json.tsx';
import { Missing } from '@/components/Screen.tsx';
import { Table } from '@/components/Table.tsx';

import { DocktizoError, downloadUrl } from '../client.ts';
import type { ArtifactMetadata } from '../types.ts';

/**
 * One write, busy while it runs.
 *
 * Every button in this module does the same three things — go busy, call one
 * route, and either move the screen on or show the refusal.
 */
export function useAction(onDone?: () => void) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [failure, setFailure] = useState<Error | null>(null);

  const run = (action: () => Promise<unknown>) => {
    setBusy(true);
    setDone(false);
    setFailure(null);
    void action()
      .then(() => {
        setDone(true);
        onDone?.();
      })
      .catch((cause: unknown) => setFailure(cause instanceof Error ? cause : new Error(String(cause))))
      .finally(() => setBusy(false));
  };

  // `done` exists because a revision and a migration are both accepted rather
  // than performed: the response is a generation id, the work happens in
  // DocKtizo's worker, and this document will not change for another minute.
  // Without it the button looks like it did nothing.
  return { run, busy, done, failure };
}

/**
 * Verbatim, because DocKtizo owns validation.
 *
 * A refusal arrives as a typed envelope: a stable code, a retryability flag, and
 * index-aligned `issue_locations`/`issue_codes` that name the fields without
 * echoing their values. Paraphrasing that would hide the one thing these screens
 * are for — Chap knows neither the codes nor the locations well enough to
 * improve on them.
 */
export function Failure({ failure }: { failure: Error | null }) {
  if (!failure) return null;

  return (
    <div className="panel mt-3" style={{ borderColor: 'var(--skin-danger)' }}>
      <p className="micro-label" style={{ color: 'var(--skin-danger)' }}>
        {failure instanceof DocktizoError
          ? `${failure.status} · ${failure.code}${failure.retryable ? ' · retryable' : ''}`
          : 'request failed'}
      </p>
      <p className="mt-1 text-sm">{failure.message}</p>
      {failure instanceof DocktizoError && failure.issues.length > 0 && (
        <Table
          columns={[
            { key: 'loc', label: 'field', render: (row) => row.location },
            { key: 'code', label: 'problem', render: (row) => row.code },
          ]}
          rows={failure.issues}
        />
      )}
    </div>
  );
}

/**
 * Rendered bytes, offered as a plain link.
 *
 * The proxy holds the bearer, so the browser fetches this the way it fetches
 * anything else and Content-Disposition does the rest — a whole feature Chap
 * never had to build. The `versions` stamp inside the JSON is the interesting
 * part on a migrated document: it records which workflow, compiler and template
 * produced these exact bytes.
 */
export function Artifacts({ artifacts, empty }: { artifacts: ArtifactMetadata[]; empty: string }) {
  if (artifacts.length === 0) return <Missing>{empty}</Missing>;

  return (
    <div className="flex flex-col gap-2">
      {artifacts.map((artifact) => (
        <Disclosure
          key={artifact.artifact_id}
          label={artifact.output_format}
          hint={`${artifact.file_name} · ${artifact.size_bytes} bytes`}
        >
          <a className="btn-accent" href={downloadUrl(artifact)} download>
            download
          </a>
          <div className="mt-2">
            <Json value={artifact} maxHeight="14rem" />
          </div>
        </Disclosure>
      ))}
    </div>
  );
}
