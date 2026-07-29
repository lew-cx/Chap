/**
 * A single message.
 *
 * This component is byte-identical across skins. In Bench it renders as a dense
 * transcript row with a mono metadata gutter; in Showroom as a wide rounded
 * bubble with no gutter. Same DOM, same JSX — the difference is entirely
 * `bubble` and `gutter` reading different token values.
 *
 * It is the clearest demonstration of the whole architecture, so keep it clean:
 * if this file ever needs a skin conditional, something upstream is wrong.
 */

import type { ReactNode } from 'react';

export interface MessageProps {
  role: 'user' | 'assistant';
  children: ReactNode;
  /** Shown in the Bench gutter; hidden by tokens in Showroom. */
  meta?: string;
  reasoning?: string | null;
  /** Attachment filenames sent with this turn. */
  files?: string[];
}

export function Message({ role, children, meta, reasoning, files = [] }: MessageProps) {
  const isUser = role === 'user';

  return (
    <article className="flex w-full gap-3 py-1" style={{ justifyContent: 'var(--skin-msg-align)' }}>
      {/*
       * Bench's metadata column. Carries only what the bubble does not already
       * say — the bubble labels the role in both skins, so repeating it here
       * would be noise.
       */}
      <div className="gutter pt-1 text-right">{meta}</div>

      <div className="bubble min-w-0 flex-1" style={isUser ? { opacity: 0.92 } : undefined}>
        <div className="micro-label mb-1">{role}</div>

        {reasoning && (
          <details className="mb-2 opacity-70">
            <summary className="micro-label cursor-pointer">reasoning</summary>
            <div className="mt-1 whitespace-pre-wrap text-sm">{reasoning}</div>
          </details>
        )}

        <div className="whitespace-pre-wrap break-words">{children}</div>

        {files.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {files.map((name) => (
              <span key={name} className="chip">
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
