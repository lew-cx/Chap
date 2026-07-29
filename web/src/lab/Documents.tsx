/**
 * Document ingest, generate and transform, plus the built-in skills.
 *
 * Ingest is the one to watch: `sources[]` takes bytes with a caller-owned
 * `source_id`, and `source_results[]` reports per-source `error_code` and
 * `retryable` — so a partial ingest is legible instead of a single failed
 * request. That contract is what removed Chap's file-staging subsystem before it
 * was written.
 *
 * The chunks produced here are exactly the shape `/v1/retrieval/context` and
 * `citation_context` expect, which is why grounding is one hop from ingesting.
 */

import { useState } from 'react';

import type {
  DocumentIngestResponse,
  DocumentGenerateResponse,
  SkillCatalog,
  ToolCatalog,
} from '@chap/lewlm';

import { Disclosure } from '../components/Disclosure.tsx';
import { Stat } from '../components/Field.tsx';
import { Json } from '../components/Json.tsx';
import { Section } from '../components/Screen.tsx';
import { lewlm } from '../lib/client.ts';
import { usePolled } from '../lib/usePolled.ts';
import { Table } from '../ops/Table.tsx';

/** LewLM takes bytes as base64 inside JSON on this route. */
async function toBase64(file: File): Promise<string> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  for (const byte of buffer) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function Documents({ onChunks }: { onChunks?: (ingest: DocumentIngestResponse) => void }) {
  const tools = usePolled<ToolCatalog>('/v1/tools');
  const skills = usePolled<SkillCatalog>('/v1/skills');
  const [ingest, setIngest] = useState<DocumentIngestResponse | null>(null);
  const [artifact, setArtifact] = useState<DocumentGenerateResponse | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const act = async (label: string, work: () => Promise<unknown>) => {
    setBusy(label);
    setFailure(null);
    try {
      await work();
    } catch (cause) {
      setFailure(`${label}: ${cause instanceof Error ? cause.message : String(cause)}`);
    } finally {
      setBusy(null);
    }
  };

  const upload = (files: FileList | null) =>
    void act('ingest', async () => {
      const chosen = [...(files ?? [])];
      if (chosen.length === 0) return;

      const result = await lewlm.request<DocumentIngestResponse>('POST', '/v1/documents/ingest', {
        json: {
          sources: await Promise.all(
            chosen.map(async (file, index) => ({
              // Caller-owned identity: these ids come back on every chunk and
              // every citation, so Chap can resolve a citation to a real file.
              source_id: `chap-upload-${index}`,
              file_name: file.name,
              media_type: file.type || null,
              content_base64: await toBase64(file),
            })),
          ),
        },
      });
      setIngest(result);
      onChunks?.(result);
    });

  return (
    <>
      <Section title="ingest">
        <label className="btn inline-block cursor-pointer">
          upload documents
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              upload(event.target.files);
              event.target.value = '';
            }}
          />
        </label>

        {ingest && (
          <>
            <div className="panel mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Stat label="ingested" value={ingest.ingested_count ?? 0} />
              <Stat label="failed" value={ingest.failed_count ?? 0} />
              <Stat label="chunks" value={(ingest.chunks ?? []).length} />
              <Stat label="partial" value={ingest.partial ? 'yes' : 'no'} />
              <Stat label="components" value={(ingest.components ?? []).length} />
            </div>

            {/* Per-source outcomes, so one bad file does not hide four good ones. */}
            {(ingest.source_results ?? []).length > 0 && (
              <div className="mt-2">
                <Table
                  columns={[
                    { key: 'id', label: 'source', render: (row) => row.source_id },
                    {
                      key: 'ok',
                      label: 'status',
                      render: (row) => (
                        <span style={{ color: row.status === 'ingested' ? 'var(--skin-ok)' : 'var(--skin-danger)' }}>
                          {row.status}
                        </span>
                      ),
                    },
                    { key: 'code', label: 'error', render: (row) => row.error_code ?? '—' },
                    { key: 'retry', label: 'retryable', render: (row) => (row.retryable ? 'yes' : '—') },
                    { key: 'chunks', label: 'chunks', numeric: true, render: (row) => row.chunk_count ?? 0 },
                    { key: 'msg', label: 'message', render: (row) => row.error_message ?? '—' },
                  ]}
                  rows={ingest.source_results ?? []}
                />
              </div>
            )}

            <div className="mt-2 flex flex-col gap-2">
              {/* Which parser, chunker and OCR actually ran. `components[]` is
                  populated on documents and empty on chat. */}
              <Disclosure
                label="provenance"
                hint={(ingest.components ?? []).map((component) => component.name).join(', ')}
              >
                <Json value={ingest.components} maxHeight="16rem" />
              </Disclosure>
              <Disclosure label="chunks" hint={(ingest.chunks ?? []).length}>
                <Json value={ingest.chunks} maxHeight="20rem" />
              </Disclosure>
            </div>

            <button
              type="button"
              className="btn mt-2"
              disabled={busy != null}
              onClick={() =>
                void act('generate', async () =>
                  setArtifact(
                    await lewlm.request<DocumentGenerateResponse>('POST', '/v1/documents/generate', {
                      json: { output_format: 'markdown', document: ingest.document },
                    }),
                  ),
                )
              }
            >
              round-trip to markdown
            </button>

            {artifact && (
              <div className="mt-2">
                <Disclosure
                  label={artifact.file_name}
                  hint={`${artifact.media_type} · ${artifact.size_bytes} bytes`}
                  open
                >
                  <Json value={atob(artifact.content_base64).slice(0, 4000)} maxHeight="20rem" />
                </Disclosure>
              </div>
            )}
          </>
        )}
      </Section>

      <Section title="tools" hint={`${tools.data?.count ?? 0} executable`}>
        {/* Honest framing: tool *execution* is host-owned by design, so this
            catalog is short and stays short. LewLM's job is to tell Chap that a
            tool was requested; running it is Chap's. */}
        <Table
          columns={[
            { key: 'name', label: 'tool', render: (row) => row.name },
            { key: 'mode', label: 'mode', render: (row) => row.execution_mode },
            { key: 'auth', label: 'authorization', render: (row) => row.required_authorization ?? '—' },
            { key: 'result', label: 'result', render: (row) => row.result_type ?? '—' },
            { key: 'desc', label: 'description', render: (row) => row.description ?? '—' },
          ]}
          rows={tools.data?.items ?? []}
        />
      </Section>

      <Section title="skills" hint={`${skills.data?.count ?? 0} built in`}>
        <Table
          columns={[
            { key: 'name', label: 'skill', render: (row) => row.name },
            { key: 'cat', label: 'category', render: (row) => row.category },
            { key: 'tool', label: 'tool', render: (row) => row.tool_name },
            {
              key: 'formats',
              label: 'outputs',
              render: (row) => (row.supported_output_formats ?? []).join(' '),
            },
          ]}
          rows={skills.data?.items ?? []}
        />
      </Section>

      {busy && <p className="micro-label">{busy}…</p>}
      {failure && (
        <p className="numeric" style={{ color: 'var(--skin-danger)' }}>
          {failure}
        </p>
      )}
    </>
  );
}
