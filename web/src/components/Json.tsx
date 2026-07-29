/**
 * A JSON block, coloured from skin tokens.
 *
 * Deliberately not a collapsible tree. Almost every JSON payload Chap shows is
 * something you want to read whole or copy verbatim into a terminal — a request
 * body, a prompt trace, a validation report — and a tree view makes both of
 * those worse. Colouring is one regex over the serialized text.
 */

import { useState, type ReactNode } from 'react';

/** key · string · literal · number, in that order of precedence. */
const TOKEN =
  /("(?:\\.|[^"\\])*")\s*:|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

function colourize(json: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;

  for (const match of json.matchAll(TOKEN)) {
    const [text, key, str, literal] = match;
    const at = match.index;
    if (at > last) out.push(json.slice(last, at));

    const colour = key
      ? 'var(--skin-muted)'
      : str
        ? 'var(--skin-ok)'
        : literal
          ? 'var(--skin-warn)'
          : 'var(--skin-accent)';

    // The key branch matched a trailing colon too; keep it outside the span so
    // punctuation stays punctuation-coloured.
    out.push(
      <span key={at} style={{ color: colour }}>
        {key ?? text}
      </span>,
    );
    if (key) out.push(':');

    last = at + text.length;
  }

  out.push(json.slice(last));
  return out;
}

export function Json({ value, maxHeight = '20rem' }: { value: unknown; maxHeight?: string }) {
  // `JSON.stringify(undefined)` is `undefined`, not a string — and ops panels
  // render fields that are legitimately absent while a poll is still in flight.
  const json =
    typeof value === 'string' ? value : (JSON.stringify(value, null, 2) ?? 'not reported');
  return (
    <pre
      className="code scroll-thin overflow-auto"
      style={{ maxHeight }}
      // The payload is data, never markup — `whiteSpace` keeps it readable.
    >
      {colourize(json)}
    </pre>
  );
}

/** Copies text to the clipboard and says so for a moment. */
export function CopyButton({ text, label = 'copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="btn text-xs"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
    >
      {copied ? 'copied' : label}
    </button>
  );
}
