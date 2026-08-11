/**
 * Material for a generation: text, structured data, or a file.
 *
 * Chap keeps no record of any of this. DocKtizo owns the durable source, and the
 * list below is a session's worth of ids so the generate tab has something to
 * tick. Reload the page and it is gone — which is correct, and is why there is
 * no "my sources" screen.
 */

import { useState } from 'react';

import { Labelled } from '@/components/Field.tsx';
import { Section } from '@/components/Screen.tsx';
import { Table } from '@/components/Table.tsx';

import { docktizo } from '../client.ts';
import { useWorkbench } from '../store.ts';

type Kind = 'text' | 'structured' | 'file';

export function Sources() {
  const sources = useWorkbench((state) => state.sources);
  const addSource = useWorkbench((state) => state.addSource);

  const [kind, setKind] = useState<Kind>('text');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [structured, setStructured] = useState('{\n  \n}');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setFailure(null);
    try {
      if (kind === 'file') {
        if (!file) throw new Error('choose a file first');
        addSource(await docktizo.sources.upload(file, title));
      } else if (kind === 'structured') {
        // The only client-side check in the module: a syntax error is worth
        // catching here because DocKtizo would only see malformed JSON.
        addSource(
          await docktizo.sources.create({
            kind: 'structured',
            title: title || 'structured source',
            data: JSON.parse(structured),
          }),
        );
      } else {
        addSource(
          await docktizo.sources.create({
            kind: 'text',
            title: title || 'text source',
            text,
          }),
        );
      }
      setText('');
      setFile(null);
    } catch (cause) {
      setFailure(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Section title="add a source" hint="10 MiB cap, enforced by DocKtizo">
        <div className="mb-3 flex flex-wrap items-end gap-3">
          {(['text', 'structured', 'file'] as const).map((option) => (
            <button
              key={option}
              type="button"
              className="chip"
              aria-pressed={kind === option}
              onClick={() => setKind(option)}
            >
              {option}
            </button>
          ))}

          <Labelled label="title">
            <input
              className="field w-64"
              value={title}
              placeholder="how it appears in provenance"
              onChange={(event) => setTitle(event.target.value)}
            />
          </Labelled>
        </div>

        {kind === 'text' && (
          <textarea
            className="field h-40 w-full"
            value={text}
            placeholder="paste the material this document should draw on"
            onChange={(event) => setText(event.target.value)}
          />
        )}

        {kind === 'structured' && (
          <textarea
            className="field code h-40 w-full"
            value={structured}
            onChange={(event) => setStructured(event.target.value)}
          />
        )}

        {kind === 'file' && (
          <input
            type="file"
            className="field"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        )}

        <div className="mt-3">
          <button type="button" className="btn-accent" disabled={busy} onClick={() => void submit()}>
            {busy ? 'uploading…' : 'create source'}
          </button>
        </div>

        {failure && (
          <p className="numeric mt-2" style={{ color: 'var(--skin-danger)' }}>
            {failure}
          </p>
        )}
      </Section>

      <Section title="this session" hint={`${sources.length} · DocKtizo keeps the durable record`}>
        <Table
          columns={[
            { key: 'id', label: 'source_id', render: (row) => row.source_id },
            { key: 'name', label: 'name', render: (row) => row.display_name ?? row.file_name ?? '—' },
            { key: 'type', label: 'type', render: (row) => row.source_type },
            { key: 'state', label: 'ingestion', render: (row) => row.ingestion_state },
            { key: 'size', label: 'bytes', numeric: true, render: (row) => row.size_bytes ?? '—' },
            { key: 'replayed', label: 'replayed', render: (row) => (row.replayed ? 'yes' : '—') },
          ]}
          rows={sources}
          empty="none yet — anything created here is available to the generate tab"
        />
      </Section>
    </>
  );
}
