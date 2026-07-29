/**
 * Embeddings, rerank and retrieval — the three semantic surfaces.
 *
 * Retrieval is the interesting one. `/v1/retrieval/context` is stateless and
 * caller-supplied by design: LewLM owns no vector store, so you hand it
 * candidate chunks and it scores them. That is what makes M9's store a Chap
 * concern and not a missing LewLM feature — and why the same request shape works
 * whether the chunks come from this textarea or from Chap's own index.
 */

import { useState } from 'react';

import type {
  EmbeddingCreateResponse,
  RerankCreateResponse,
  RetrievalContextResponse,
} from '@chap/lewlm';

import { Disclosure } from '../components/Disclosure.tsx';
import { Labelled } from '../components/Field.tsx';
import { Json } from '../components/Json.tsx';
import { CapabilityNotice } from '../components/CapabilityNotice.tsx';
import { Section } from '../components/Screen.tsx';
import { useCapability } from '../lib/useCapability.ts';
import { lewlm } from '../lib/client.ts';
import { Table } from '../ops/Table.tsx';

/** Cosine similarity, the one calculation Chap does that LewLM does not expose. */
function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

const SAMPLE = [
  'The bell tower in Harkwell is 41 metres tall.',
  'Harkwell cathedral was completed in 1274.',
  'Sourdough needs a mature starter and a long cold proof.',
].join('\n');

export function Semantic() {
  const [inputs, setInputs] = useState(SAMPLE);
  const [query, setQuery] = useState('How tall is the tower?');
  const [busy, setBusy] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const [embeddings, setEmbeddings] = useState<EmbeddingCreateResponse | null>(null);
  const [rerank, setRerank] = useState<RerankCreateResponse | null>(null);
  const [retrieval, setRetrieval] = useState<RetrievalContextResponse | null>(null);

  const lines = inputs.split('\n').map((line) => line.trim()).filter(Boolean);
  const embeddings_capability = useCapability('embeddings');

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

  const vectors = embeddings?.data.map((datum) => datum.embedding) ?? [];

  return (
    <>
      <CapabilityNotice capability="embeddings" status={embeddings_capability} />
      <Section title="inputs" hint={`${lines.length} lines`}>
        <div className="flex flex-col gap-3">
          <textarea
            className="field scroll-thin min-h-28 resize-y"
            value={inputs}
            onChange={(event) => setInputs(event.target.value)}
          />
          <Labelled label="query">
            <input
              className="field"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </Labelled>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn"
              disabled={busy != null || lines.length === 0}
              onClick={() =>
                void act('embeddings', async () =>
                  setEmbeddings(
                    await lewlm.request<EmbeddingCreateResponse>('POST', '/v1/embeddings', {
                      json: { input: lines },
                    }),
                  ),
                )
              }
            >
              embed
            </button>
            <button
              type="button"
              className="btn"
              disabled={busy != null || lines.length === 0}
              onClick={() =>
                void act('rerank', async () =>
                  setRerank(
                    await lewlm.request<RerankCreateResponse>('POST', '/v1/rerank', {
                      json: { query, documents: lines },
                    }),
                  ),
                )
              }
            >
              rerank
            </button>
            <button
              type="button"
              className="btn"
              disabled={busy != null || lines.length === 0}
              onClick={() =>
                void act('retrieval', async () =>
                  setRetrieval(
                    await lewlm.request<RetrievalContextResponse>('POST', '/v1/retrieval/context', {
                      json: {
                        query,
                        candidate_chunks: lines.map((text, index) => ({
                          chunk_id: `lab-${index}#0`,
                          text,
                          source_id: `lab-${index}`,
                          section_id: `lab-${index}:body`,
                          source_label: `line ${index + 1}`,
                          section_label: 'body',
                        })),
                        top_k: 3,
                        use_embeddings: true,
                        use_rerank: true,
                      },
                    }),
                  ),
                )
              }
            >
              retrieve
            </button>
          </div>
        </div>
      </Section>

      {embeddings && (
        <Section
          title="embeddings"
          hint={`${embeddings.model} · ${vectors[0]?.length ?? 0} dimensions`}
        >
          {/* The similarity matrix is the readable form of an embedding — a
              column of 768 floats tells you nothing on its own. */}
          <div className="scroll-thin overflow-x-auto">
            <table className="border-collapse">
              <tbody>
                {vectors.map((row, i) => (
                  <tr key={i}>
                    <td className="micro-label pr-2">{i + 1}</td>
                    {vectors.map((column, j) => {
                      const value = cosine(row, column);
                      return (
                        <td
                          key={j}
                          className="numeric px-2 py-1 text-right"
                          style={{
                            color: i === j ? 'var(--skin-faint)' : 'var(--skin-ink)',
                            background:
                              i === j ? undefined : `color-mix(in oklab, var(--skin-accent) ${Math.max(0, value) * 55}%, transparent)`,
                          }}
                        >
                          {value.toFixed(3)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {rerank && (
        <Section title="rerank" hint={rerank.model}>
          <Table
            columns={[
              { key: 'rank', label: '#', numeric: true, render: (row) => row.index + 1 },
              { key: 'score', label: 'relevance', numeric: true, render: (row) => row.relevance_score.toFixed(4) },
              { key: 'doc', label: 'document', render: (row) => row.document ?? lines[row.index] },
            ]}
            rows={rerank.results}
          />
        </Section>
      )}

      {retrieval && (
        <Section
          title="retrieval"
          hint={`${retrieval.strategy} · ${retrieval.returned_count}/${retrieval.candidate_count}`}
        >
          {/* Both stage scores side by side is the point: it shows what the
              embedding pass thought and what the reranker changed its mind about. */}
          <Table
            columns={[
              { key: 'rank', label: '#', numeric: true, render: (row) => row.rank },
              { key: 'score', label: 'score', numeric: true, render: (row) => row.score.toFixed(4) },
              {
                key: 'emb',
                label: 'embedding',
                numeric: true,
                render: (row) => row.embedding_score?.toFixed(4) ?? '—',
              },
              {
                key: 'rr',
                label: 'rerank',
                numeric: true,
                render: (row) => row.rerank_score?.toFixed(4) ?? '—',
              },
              { key: 'text', label: 'chunk', render: (row) => row.chunk.text },
            ]}
            rows={retrieval.items}
          />

          <div className="mt-2 flex flex-col gap-2">
            <Disclosure label="scoring policy" hint={`${retrieval.scoring_policy.primary_signal} first, ${retrieval.scoring_policy.tie_break_signal} to break ties`}>
              <Json value={retrieval.scoring_policy} />
            </Disclosure>
            <Disclosure label="stage detail">
              <Json
                value={{ embedding: retrieval.embedding_stage, rerank: retrieval.rerank_stage }}
                maxHeight="18rem"
              />
            </Disclosure>
          </div>
        </Section>
      )}

      {busy && <p className="micro-label">{busy}…</p>}
      {failure && (
        <p className="numeric" style={{ color: 'var(--skin-danger)' }}>
          {failure}
        </p>
      )}
    </>
  );
}
