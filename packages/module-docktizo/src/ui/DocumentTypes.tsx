/**
 * What DocKtizo can produce, and what it needs to produce it.
 *
 * The `input_schema` shown here is a real JSON Schema, published per document
 * type — which is why the generate tab writes no validation. Chap shows the
 * schema, DocKtizo enforces it.
 */

import { useEffect, useState } from 'react';

import { Json } from '@/components/Json.tsx';
import { Section } from '@/components/Screen.tsx';
import { Stat } from '@/components/Field.tsx';
import { Table } from '@/components/Table.tsx';

import { docktizo } from '../client.ts';
import { useWorkbench } from '../store.ts';
import type { DocumentTypeDetail } from '../types.ts';

export function DocumentTypes() {
  const [items, setItems] = useState<DocumentTypeDetail[]>([]);
  const [failure, setFailure] = useState<string | null>(null);
  const selected = useWorkbench((state) => state.documentType);
  const select = useWorkbench((state) => state.select);
  const whoami = useWorkbench((state) => state.whoami);
  const identify = useWorkbench((state) => state.identify);

  useEffect(() => {
    identify();
    docktizo.documentTypes
      .list()
      .then((result) => setItems(result.items))
      .catch((cause: unknown) => setFailure(cause instanceof Error ? cause.message : String(cause)));
  }, []);

  return (
    <>
      {whoami && (
        /**
         * The credential, resolved. A request cannot name its workspace — the
         * token decides — so the only honest place to show it is here. The scope
         * list is not decoration: DocKtizo splits `events:read` and
         * `artifacts:download` out from the obvious ones, and a token missing
         * either fails deep in a screen with `authorization_denied` and no
         * indication of which action was denied.
         */
        <Section title="acting as" hint={whoami.authentication_method}>
          <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="workspace" value={whoami.workspace_id} />
            <Stat label="subject" value={whoami.subject_id} />
            <Stat label="roles" value={(whoami.roles ?? []).join(' · ') || '—'} />
            <Stat label="scopes" value={(whoami.scopes ?? []).length} />
          </div>
          <p className="micro-label mt-2">{(whoami.scopes ?? []).join(' · ')}</p>
        </Section>
      )}

      <Section title="document types" hint={`${items.length} installed`}>
        <Table
          columns={[
            { key: 'id', label: 'workflow', render: (row) => row.workflow_id },
            { key: 'desc', label: 'description', render: (row) => row.description },
            {
              key: 'formats',
              label: 'formats',
              render: (row) => (row.supported_output_formats ?? []).join(' · '),
            },
            {
              key: 'review',
              label: 'review',
              render: (row) => (row.requires_review ? 'required' : '—'),
            },
          ]}
          rows={items}
          onSelect={select}
          selected={(row) => row.workflow_id === selected?.workflow_id}
          empty={
            failure ??
            'no document types — a DocKtizo with no workflows installed, or a token without document_types:read'
          }
        />
        <p className="micro-label mt-2">
          Select one to use it in the generate tab.
        </p>
      </Section>

      {selected && <Detail detail={selected} />}
    </>
  );
}

function Detail({ detail }: { detail: DocumentTypeDetail }) {
  return (
    <>
      <Section title={detail.workflow_id}>
        <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="document type" value={detail.document_type} />
          <Stat label="version" value={detail.version} />
          <Stat label="retrieval" value={detail.retrieval_policy ?? '—'} />
          <Stat label="templates" value={(detail.compatible_template_ids ?? []).length} />
        </div>
        <p className="micro-label mt-2">
          needs {(detail.required_capabilities ?? []).join(' · ') || 'no capabilities'} from LewLM
        </p>
      </Section>

      <Section title="input schema" hint="DocKtizo validates against this — Chap does not">
        <Json value={detail.input_schema ?? {}} maxHeight="28rem" />
      </Section>
    </>
  );
}
