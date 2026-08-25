/**
 * The knowledge base: ingest → store → retrieve → ground.
 *
 * This is where Chap's vector store meets LewLM's retrieval and grounding, and
 * the seam is worth looking at. Chap does one thing — keep chunks and find
 * plausible candidates. Everything that requires a model happens in LewLM:
 * embedding here, reranking in `/v1/retrieval/context`, citation resolution in
 * the chat surface.
 *
 * The chunks never change shape along the way. What `documents/ingest` returns
 * is what the store keeps, what search returns, what retrieval scores and what
 * `citation_context` grounds against — one type end to end.
 */

import { useEffect, useState } from 'react';

import type { DocumentChunk, DocumentIngestResponse, RetrievalContextResponse } from '@chap/lewlm';

import { ConfirmButton } from '@/components/ConfirmButton.tsx';
import { Disclosure } from '@/components/Disclosure.tsx';
import { Labelled, Stat } from '@/components/Field.tsx';
import { Json } from '@/components/Json.tsx';
import { CapabilityNotice } from '@/components/CapabilityNotice.tsx';
import { Section } from '@/components/Screen.tsx';
import { useCapability } from '@/lib/useCapability.ts';
import { lewlm } from '@/lib/client.ts';
import { collections, type CollectionSummary } from '../client.ts';
import { Table } from '@/components/Table.tsx';
import { useGrounding } from '@/store/grounding.ts';
import { Documents } from '@/lab/Documents.tsx';

export function Knowledge() {
  const ground = useGrounding((state) => state.ground);
  const [items, setItems] = useState<CollectionSummary[]>([]);
  const [name, setName] = useState('default');
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<DocumentChunk[] | null>(null);
  const [scores, setScores] = useState<Map<string, number>>(new Map());
  const [ranked, setRanked] = useState<RetrievalContextResponse | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const embeddings_capability = useCapability('embeddings');
  const refresh = () => void collections.list().then((result) => setItems(result.items));
  useEffect(refresh, []);

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

  /** Ingest output goes straight in — no reshaping, which is the whole point. */
  const store = (ingest: DocumentIngestResponse) =>
    void act('store', async () => {
      await collections.add(name, ingest.chunks ?? []);
      refresh();
    });

  return (
    <>
      <CapabilityNotice title="no runnable embeddings model on this host" status={embeddings_capability} />
      <Section title="collections" hint={`${items.length} · ${items.reduce((sum, item) => sum + item.chunk_count, 0)} chunks`}>
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <Labelled label="collection">
            <input className="field w-48" value={name} onChange={(event) => setName(event.target.value)} />
          </Labelled>
        </div>

        <Table
          columns={[
            { key: 'name', label: 'collection', render: (row) => row.name },
            { key: 'chunks', label: 'chunks', numeric: true, render: (row) => row.chunk_count },
            { key: 'dims', label: 'dimensions', numeric: true, render: (row) => row.dimensions ?? '—' },
            { key: 'when', label: 'updated', render: (row) => row.updated_at.slice(0, 19).replace('T', ' ') },
            {
              key: 'drop',
              label: '',
              render: (row) => (
                <ConfirmButton
                  label="drop"
                  confirmLabel={`drop ${row.chunk_count} chunks?`}
                  title="deletes the collection and everything in it; there is no undo"
                  onConfirm={() =>
                    void act('drop', async () => {
                      await collections.drop(row.name);
                      refresh();
                    })
                  }
                />
              ),
            },
          ]}
          rows={items}
          empty="empty — ingest a document below to fill one"
        />
      </Section>

      <Section title="ingest into this collection">
        {/* The same panel the documents tab uses. Ingest is LewLM's; only the
            "keep these chunks" step is Chap's. */}
        <Documents onChunks={store} />
      </Section>

      <Section title="retrieve">
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <Labelled label="query">
            <input
              className="field w-96"
              value={query}
              placeholder="ask the collection something"
              onChange={(event) => setQuery(event.target.value)}
            />
          </Labelled>

          <button
            type="button"
            className="btn"
            disabled={busy != null || !query.trim()}
            onClick={() =>
              void act('search', async () => {
                const result = await collections.search(name, query);
                setFound(result.candidate_chunks);
                setScores(new Map(result.scores.map((entry) => [entry.chunk_id, entry.score])));
                setRanked(null);
              })
            }
          >
            search chap's store
          </button>

          <button
            type="button"
            className="btn"
            disabled={busy != null || !found?.length}
            onClick={() =>
              void act('rerank', async () =>
                setRanked(
                  await lewlm.request<RetrievalContextResponse>('POST', '/v1/retrieval/context', {
                    json: {
                      query,
                      candidate_chunks: found,
                      top_k: 5,
                      use_embeddings: true,
                      use_rerank: true,
                    },
                  }),
                ),
              )
            }
          >
            rank with LewLM
          </button>

          <button
            type="button"
            className="btn-accent"
            disabled={!ranked?.items.length}
            onClick={() => ground((ranked?.items ?? []).map((item) => item.chunk))}
          >
            ground a chat turn
          </button>
        </div>

        {found && (
          <Table
            columns={[
              {
                key: 'score',
                label: 'chap',
                numeric: true,
                render: (row) => scores.get(row.chunk_id)?.toFixed(4) ?? '—',
              },
              { key: 'src', label: 'source', render: (row) => row.source_label },
              { key: 'text', label: 'chunk', render: (row) => row.text.slice(0, 160) },
            ]}
            rows={found}
            empty="no candidates — the collection may be empty"
          />
        )}

        {ranked && (
          <div className="mt-3">
            <h3 className="micro-label mb-2">
              after LewLM · {ranked.strategy} · {ranked.returned_count}/{ranked.candidate_count}
            </h3>
            {/* Chap's similarity beside LewLM's two stages. Where the columns
                disagree is where the reranker earned its keep. */}
            <Table
              columns={[
                { key: 'rank', label: '#', numeric: true, render: (row) => row.rank },
                {
                  key: 'chap',
                  label: 'chap',
                  numeric: true,
                  render: (row) => scores.get(row.chunk.chunk_id)?.toFixed(4) ?? '—',
                },
                { key: 'emb', label: 'embedding', numeric: true, render: (row) => row.embedding_score?.toFixed(4) ?? '—' },
                { key: 'rr', label: 'rerank', numeric: true, render: (row) => row.rerank_score?.toFixed(4) ?? '—' },
                { key: 'text', label: 'chunk', render: (row) => row.chunk.text.slice(0, 140) },
              ]}
              rows={ranked.items}
            />
            <div className="mt-2">
              <Disclosure label="scoring policy" hint={ranked.scoring_policy.primary_signal}>
                <Json value={ranked.scoring_policy} />
              </Disclosure>
            </div>
          </div>
        )}
      </Section>

      <div className="panel">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="candidates" value={found?.length ?? '—'} />
          <Stat label="ranked" value={ranked?.returned_count ?? '—'} />
          <Stat label="store" value="node:sqlite" />
          <Stat label="chap dependencies" value={0} />
        </div>
      </div>

      {busy && <p className="micro-label">{busy}…</p>}
      {failure && (
        <p className="numeric" style={{ color: 'var(--skin-danger)' }}>
          {failure}
        </p>
      )}
    </>
  );
}
