/**
 * Sessions — LewLM's conversation memory.
 *
 * The point worth demonstrating here is `context_policy`. LewLM decides what
 * history a turn actually sees, so switching a session from `full_history` to
 * `last_turn` visibly changes the compiled prompt without Chap touching a single
 * message. Turn on the prompt trace and switch the policy: the `messages` count
 * in the trace changes and Chap sent identical requests.
 *
 * When a session is attached, Chap stops sending its own transcript — history
 * becomes LewLM's job, which is the whole reason sessions exist.
 */

import { useRef, useState } from 'react';

import type { SessionListResponse, SessionRecord, SessionContextPolicy } from '@chap/lewlm';

import { ConfirmButton } from '../components/ConfirmButton.tsx';
import { Labelled } from '../components/Field.tsx';
import { lewlm } from '../lib/client.ts';
import { usePolled } from '../lib/usePolled.ts';

const POLICIES: SessionContextPolicy[] = ['full_history', 'last_turn', 'summary_and_last_turn'];

/**
 * Sessions accumulate, and this panel opens inside a composer drawer. Without a
 * limit the drawer rendered every session on the host — over a hundred rows,
 * each with its own `<select>` — to show the handful anyone is looking for.
 */
const PAGE = 25;

interface Props {
  /** The attached session, or null when Chap is sending its own transcript. */
  sessionId: string | null;
  onAttach: (sessionId: string | null) => void;
}

export function SessionsPanel({ sessionId, onAttach }: Props) {
  const { data, refresh } = usePolled<SessionListResponse>(`/v1/sessions?limit=${PAGE * 8}`);
  const [title, setTitle] = useState('');
  const [policy, setPolicy] = useState<SessionContextPolicy>('full_history');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [shown, setShown] = useState(PAGE);

  const all = data?.items ?? [];
  const needle = search.trim().toLowerCase();
  const matching = needle
    ? all.filter(
        (session) =>
          (session.title ?? '').toLowerCase().includes(needle) ||
          session.session_id.toLowerCase().includes(needle),
      )
    : all;
  const sessions = matching.slice(0, shown);

  const act = async (work: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await work();
      refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <Labelled label="new session title">
          <input
            className="field w-56"
            value={title}
            placeholder="untitled"
            onChange={(event) => setTitle(event.target.value)}
          />
        </Labelled>

        <Labelled label="context policy">
          <select
            className="field"
            value={policy}
            onChange={(event) => setPolicy(event.target.value as SessionContextPolicy)}
          >
            {POLICIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Labelled>

        <button
          type="button"
          className="btn"
          disabled={busy}
          onClick={() =>
            void act(async () => {
              const created = await lewlm.request<SessionRecord>('POST', '/v1/sessions', {
                json: { title: title || null, context_policy: policy },
              });
              setTitle('');
              onAttach(created.session_id);
            })
          }
        >
          create + attach
        </button>

        {sessionId && (
          <button type="button" className="btn" onClick={() => onAttach(null)}>
            detach
          </button>
        )}

        <Labelled label="find">
          <input
            className="field w-48"
            value={search}
            placeholder="title or id"
            onChange={(event) => {
              setSearch(event.target.value);
              setShown(PAGE);
            }}
          />
        </Labelled>
      </div>

      {all.length === 0 && (
        <p className="micro-label">
          no sessions — Chap is sending its own transcript as `messages`
        </p>
      )}
      {all.length > 0 && matching.length === 0 && (
        <p className="micro-label">no session matches “{search}”</p>
      )}

      <div className="flex flex-col">
        {sessions.map((session) => (
          <SessionRow
            key={session.session_id}
            session={session}
            attached={session.session_id === sessionId}
            busy={busy}
            onAttach={() => onAttach(session.session_id)}
            onDeleted={() => {
              // The row goes; the composer's session_id would not, and the next
              // send would carry a session LewLM no longer has.
              if (session.session_id === sessionId) onAttach(null);
            }}
            onAct={act}
          />
        ))}
      </div>

      {matching.length > sessions.length && (
        <div>
          <button type="button" className="chip" onClick={() => setShown((count) => count + PAGE)}>
            show {Math.min(PAGE, matching.length - sessions.length)} more · {sessions.length} of{' '}
            {matching.length}
          </button>
        </div>
      )}
    </div>
  );
}

function SessionRow({
  session,
  attached,
  busy,
  onAttach,
  onDeleted,
  onAct,
}: {
  session: SessionRecord;
  attached: boolean;
  busy: boolean;
  onAttach: () => void;
  onDeleted: () => void;
  onAct: (work: () => Promise<unknown>) => Promise<void>;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(session.title ?? '');
  /** Set by Escape so the blur that follows knows not to save. */
  const abandon = useRef(false);

  const patch = (body: Record<string, unknown>) =>
    onAct(() =>
      lewlm.request('PATCH', `/v1/sessions/${session.session_id}`, { json: body }),
    );

  return (
    <div className="row flex flex-wrap items-center gap-3 py-2">
      <button
        type="button"
        className="chip"
        aria-pressed={attached}
        onClick={onAttach}
        title={session.session_id}
      >
        {attached ? 'attached' : 'attach'}
      </button>

      {renaming ? (
        <input
          className="field w-56"
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
            if (event.key === 'Escape') {
              abandon.current = true;
              event.currentTarget.blur();
            }
          }}
          // Committing on blur, not discarding. Clicking away from a field you
          // have just typed into means "done", not "throw that away" — which is
          // what it used to mean, silently.
          onBlur={() => {
            setRenaming(false);
            const abandoned = abandon.current;
            abandon.current = false;
            if (abandoned) {
              setDraft(session.title ?? '');
              return;
            }
            if (draft !== (session.title ?? '')) void patch({ title: draft || null });
          }}
        />
      ) : (
        <button
          type="button"
          className="min-w-0 flex-1 truncate text-left text-sm"
          title="rename"
          onClick={() => {
            setDraft(session.title ?? '');
            setRenaming(true);
          }}
        >
          {session.title || <span style={{ color: 'var(--skin-faint)' }}>untitled</span>}
        </button>
      )}

      {/* Changing this re-compiles the prompt on the next turn. Nothing in Chap
          changes; LewLM decides what the model sees. */}
      <select
        className="field text-xs"
        value={session.context_policy}
        disabled={busy}
        onChange={(event) => void patch({ context_policy: event.target.value })}
      >
        {POLICIES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <span className="numeric" style={{ color: 'var(--skin-faint)' }}>
        {session.turn_count} turns · {session.message_count} msgs
      </span>

      <a
        className="chip"
        href={`/v1/sessions/${session.session_id}/export`}
        download={`${session.session_id}.json`}
      >
        export
      </a>

      <ConfirmButton
        label="delete"
        confirmLabel="delete for good?"
        disabled={busy}
        title="deletes the session and its history in LewLM; there is no undo"
        onConfirm={() =>
          void onAct(async () => {
            await lewlm.request('DELETE', `/v1/sessions/${session.session_id}`);
            onDeleted();
          })
        }
      />
    </div>
  );
}
