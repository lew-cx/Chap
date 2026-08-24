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
 * rejects a request that tries to claim one. The workspace this tab is acting in
 * is shown instead, from `/v1/whoami` — the request cannot name it, so the UI
 * should.
 *
 * There is no document-type field either, for the same reason in reverse: the
 * workflow is standing context for the whole screen and is chosen in its header.
 */

import { useEffect, useState } from 'react';

import { CapabilityNotice } from '@/components/CapabilityNotice.tsx';
import { Labelled } from '@/components/Field.tsx';
import { Json } from '@/components/Json.tsx';
import { Missing, Section } from '@/components/Screen.tsx';
import { Table } from '@/components/Table.tsx';

import { docktizo, readiness } from '../client.ts';
import { useWorkbench } from '../store.ts';
import type { GenerationAccepted, OutputFormat, TemplateSummary, WorkflowReadiness } from '../types.ts';
import { Failure, useAction } from './Shared.tsx';

export function Generate() {
  const documentType = useWorkbench((state) => state.documentType);
  const catalogFailure = useWorkbench((state) => state.catalogFailure);
  const sources = useWorkbench((state) => state.sources);
  const watch = useWorkbench((state) => state.watch);
  const load = useWorkbench((state) => state.load);
  const workspace = useWorkbench((state) => state.whoami?.workspace_id ?? null);

  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [inputData, setInputData] = useState('{\n  \n}');
  const [formats, setFormats] = useState<OutputFormat[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => crypto.randomUUID());
  const [accepted, setAccepted] = useState<GenerationAccepted | null>(null);
  const [runnable, setRunnable] = useState<WorkflowReadiness | null>(null);
  const { run, busy, failure } = useAction();

  const workflowId = documentType?.workflow_id;
  const supported = documentType?.supported_output_formats ?? [];

  useEffect(load, [load]);

  useEffect(() => {
    if (!workflowId) return;
    docktizo.templates
      .list(workflowId)
      .then((result) => setTemplates(result.items))
      .catch(() => setTemplates([]));
    // Two workflows rarely render the same formats, and a format left selected
    // after a switch would be a request nothing on screen shows you making.
    setFormats((current) => {
      const kept = current.filter((format) => supported.includes(format));
      return kept.length > 0 ? kept : supported.slice(0, 1);
    });
    setTemplateId('');
  }, [workflowId]);

  // Whether this host can actually run the workflow, before the button is
  // pressed. DocKtizo rejects at submit time too, but a request that cannot
  // succeed is better not sent — the same argument as CapabilityNotice makes
  // for LewLM, now possible because readiness reports per-workflow capabilities.
  useEffect(() => {
    if (!workflowId) return;
    readiness()
      .then((report) =>
        setRunnable((report.workflows ?? []).find((entry) => entry.workflow_id === workflowId) ?? null),
      )
      .catch(() => setRunnable(null));
  }, [workflowId]);

  if (!documentType) {
    return (
      <Section title="no document type">
        <Missing>
          {catalogFailure ??
            'DocKtizo has no workflows installed, or this token lacks document_types:read.'}
        </Missing>
      </Section>
    );
  }

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const submit = () =>
    run(async () => {
      setAccepted(null);
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
    });

  return (
    <>
      {runnable && (
        <CapabilityNotice
          title={`this host cannot run ${runnable.workflow_id}`}
          status={{
            ready: runnable.ready,
            reason: `LewLM provides no ${(runnable.missing_capabilities ?? []).join(' or ')}.`,
          }}
        />
      )}

      <Section
        title="request"
        hint={`${documentType.workflow_id}${workspace ? ` · workspace ${workspace}` : ''}`}
      >
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
              <option value="">workflow default</option>
              {templates.map((template) => (
                <option key={template.template_id} value={template.template_id}>
                  {template.name}
                </option>
              ))}
            </select>
          </Labelled>

          <Labelled label="output formats">
            <div className="flex flex-wrap gap-2">
              {supported.map((format) => (
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
          <button type="button" className="btn-accent" disabled={busy} onClick={submit}>
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

        <Failure failure={failure} />
      </Section>
    </>
  );
}
