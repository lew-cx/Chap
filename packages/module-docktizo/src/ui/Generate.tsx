/**
 * Submit a generation.
 *
 * `input_data` is a textarea beside the schema rather than a generated form, and
 * that is a decision rather than a shortcut. DocKtizo publishes a JSON Schema per
 * document type and validates against it server-side, returning a typed error
 * envelope. A form built here would restate those rules in TypeScript, drift from
 * them within a release, and turn DocKtizo's precise 422 into a vaguer message of
 * Chap's own invention. So the only client-side check in this file is
 * `JSON.parse`, and every other failure is shown exactly as DocKtizo sent it.
 *
 * There is no workspace field. The workspace is derived from the token; DocKtizo
 * rejects a request that tries to claim one. The absence is documentation.
 */

import { useEffect, useState } from 'react';

import { Labelled } from '@/components/Field.tsx';
import { Json } from '@/components/Json.tsx';
import { Missing, Section } from '@/components/Screen.tsx';
import { Table } from '@/components/Table.tsx';

import { docktizo, DocktizoError } from '../client.ts';
import { useWorkbench } from '../store.ts';
import type { GenerationAccepted, OutputFormat, TemplateSummary } from '../types.ts';

export function Generate() {
  const documentType = useWorkbench((state) => state.documentType);
  const sources = useWorkbench((state) => state.sources);
  const watch = useWorkbench((state) => state.watch);

  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [inputData, setInputData] = useState('{\n  \n}');
  const [formats, setFormats] = useState<OutputFormat[]>(['docx']);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => crypto.randomUUID());
  const [accepted, setAccepted] = useState<GenerationAccepted | null>(null);
  const [failure, setFailure] = useState<DocktizoError | Error | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!documentType) return;
    docktizo.templates
      .list(documentType.workflow_id)
      .then((result) => setTemplates(result.items))
      .catch(() => setTemplates([]));
  }, [documentType?.workflow_id]);

  if (!documentType) {
    return <Missing>Choose a document type first — the types tab lists what this host installs.</Missing>;
  }

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const submit = async () => {
    setBusy(true);
    setFailure(null);
    setAccepted(null);
    try {
      const result = await docktizo.generations.create(
        {
          document_type: documentType.workflow_id,
          title: title || null,
          instructions: instructions || null,
          input_data: JSON.parse(inputData),
          source_ids: selectedSources,
          template_id: templateId || null,
          output_formats: formats,
        },
        idempotencyKey,
      );
      setAccepted(result);
      watch(result.generation_id);
    } catch (cause) {
      setFailure(cause instanceof Error ? cause : new Error(String(cause)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Section title="request" hint={documentType.workflow_id}>
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <Labelled label="title">
            <input className="field w-64" value={title} onChange={(event) => setTitle(event.target.value)} />
          </Labelled>

          <Labelled label="template">
            <select
              className="field w-56"
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
            >
              <option value="">none</option>
              {templates.map((template) => (
                <option key={template.template_id} value={template.template_id}>
                  {template.name}
                </option>
              ))}
            </select>
          </Labelled>

          <Labelled label="output formats">
            <div className="flex flex-wrap gap-2">
              {(documentType.supported_output_formats ?? []).map((format) => (
                <button
                  key={format}
                  type="button"
                  className="chip"
                  aria-pressed={formats.includes(format)}
                  onClick={() => setFormats(toggle(formats, format))}
                >
                  {format}
                </button>
              ))}
            </div>
          </Labelled>
        </div>

        <Labelled label="instructions">
          <textarea
            className="field h-20 w-full"
            value={instructions}
            placeholder="free-text guidance for the workflow"
            onChange={(event) => setInstructions(event.target.value)}
          />
        </Labelled>
      </Section>

      <Section title="sources" hint={`${selectedSources.length} of ${sources.length} selected`}>
        {sources.length === 0 ? (
          <Missing>None this session. The sources tab creates them.</Missing>
        ) : (
          <Table
            columns={[
              {
                key: 'pick',
                label: '',
                render: (row) => (
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(row.source_id)}
                    onChange={() => setSelectedSources(toggle(selectedSources, row.source_id))}
                  />
                ),
              },
              { key: 'name', label: 'name', render: (row) => row.display_name ?? row.file_name ?? '—' },
              { key: 'type', label: 'type', render: (row) => row.source_type },
              { key: 'id', label: 'source_id', render: (row) => row.source_id },
            ]}
            rows={sources}
          />
        )}
      </Section>

      <Section title="input_data" hint="Chap parses this and nothing more">
        <div className="grid gap-3 lg:grid-cols-2">
          <textarea
            className="field code h-72 w-full"
            value={inputData}
            onChange={(event) => setInputData(event.target.value)}
          />
          <div>
            <p className="micro-label mb-1">the schema DocKtizo will enforce</p>
            <Json value={documentType.input_schema ?? {}} maxHeight="18rem" />
          </div>
        </div>
      </Section>

      <Section
        title="submit"
        hint="same key + same body replays; same key + different body is a 409"
      >
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <Labelled label="Idempotency-Key">
            <input
              className="field code w-80"
              value={idempotencyKey}
              onChange={(event) => setIdempotencyKey(event.target.value)}
            />
          </Labelled>
          <button type="button" className="chip" onClick={() => setIdempotencyKey(crypto.randomUUID())}>
            new key
          </button>
          <button type="button" className="btn-accent" disabled={busy} onClick={() => void submit()}>
            {busy ? 'submitting…' : 'submit generation'}
          </button>
        </div>

        {accepted && (
          <div className="panel">
            <p className="micro-label mb-2">
              accepted · {accepted.state}
              {accepted.replayed && ' · replayed — this key had already been used with this body'}
            </p>
            <Json value={accepted} maxHeight="14rem" />
          </div>
        )}

        {failure && (
          <div className="panel" style={{ borderColor: 'var(--skin-danger)' }}>
            {/* Verbatim. DocKtizo owns validation; paraphrasing it here would
                hide the one thing this screen is for. */}
            <p className="micro-label" style={{ color: 'var(--skin-danger)' }}>
              {failure instanceof DocktizoError
                ? `${failure.status} · ${failure.code}${failure.retryable ? ' · retryable' : ''}`
                : 'request failed'}
            </p>
            <p className="mt-1 text-sm">{failure.message}</p>
          </div>
        )}
      </Section>
    </>
  );
}
