/**
 * Markdown for model output.
 *
 * Hand-written for the same reason Json.tsx is: the subset a transcript
 * actually needs — headings, lists, fences, tables, links, a little emphasis —
 * is one page of code, where a markdown library plus the sanitizer it obliges
 * you to add is a large dependency reaching the same place. Nothing here ever
 * produces HTML, so there is no markup to sanitize: every node is a React
 * element and every leaf is text.
 *
 * Written for streaming. `parse` is a pure function of the text received so
 * far, so the component simply re-parses on each delta, and the only thing that
 * matters is how partial syntax lands:
 *
 *   - an unterminated fence renders as a code block in progress, not as three
 *     literal backticks that later vanish;
 *   - an unterminated emphasis or link run stays literal until its closer
 *     arrives, so a token can never retroactively restyle a paragraph.
 *
 * Both keep the transcript from flickering while it is being written.
 */

import { Fragment, useMemo, type ReactNode } from 'react';

import { CopyButton } from './Json.tsx';

/* ---------------------------------------------------------------------------
 * Blocks
 * ------------------------------------------------------------------------- */

/** A list item, plus the indent depth that decides what it nests under. */
interface Item {
  text: string;
  depth: number;
}

type Block =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'code'; lang: string; text: string }
  | { kind: 'list'; ordered: boolean; items: Item[] }
  | { kind: 'quote'; text: string }
  | { kind: 'rule' }
  | { kind: 'table'; header: string[]; rows: string[][] };

const FENCE = /^ {0,3}(?:```|~~~)\s*([\w+#.-]*)/;
const HEADING = /^ {0,3}(#{1,6})\s+(.*)$/;
const RULE = /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/;
const QUOTE = /^ {0,3}>\s?(.*)$/;
const BULLET = /^(\s*)[-*+]\s+(.*)$/;
const NUMBER = /^(\s*)\d{1,9}[.)]\s+(.*)$/;
/** The `|---|---|` row that turns the line above it into a table header. */
const TABLE_RULE = /^\s*\|?(?:\s*:?-{2,}:?\s*\|)+\s*:?-{2,}:?\s*\|?\s*$/;

/** The cells of one table row, without the outer pipes. */
function cells(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());
}

function parse(source: string): Block[] {
  const lines = source.split('\n');
  const blocks: Block[] = [];

  /** Past the end reads as blank, which is what closes every open block. */
  const lineAt = (index: number) => lines[index] ?? '';
  let at = 0;

  while (at < lines.length) {
    const line = lineAt(at);

    if (line.trim() === '') {
      at += 1;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const body: string[] = [];
      at += 1;
      // No closing fence is the normal state mid-stream, not a malformed
      // document: everything received so far is the block.
      while (at < lines.length && !FENCE.test(lineAt(at))) {
        body.push(lineAt(at));
        at += 1;
      }
      at += 1; // the closing fence, or one past the end
      blocks.push({ kind: 'code', lang: fence[1] ?? '', text: body.join('\n') });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({
        kind: 'heading',
        level: heading[1]?.length ?? 1,
        text: heading[2] ?? '',
      });
      at += 1;
      continue;
    }

    // Before the bullet check: `---` is a rule, `- ` is a list.
    if (RULE.test(line)) {
      blocks.push({ kind: 'rule' });
      at += 1;
      continue;
    }

    if (QUOTE.test(line)) {
      const body: string[] = [];
      for (let quote = QUOTE.exec(lineAt(at)); quote; quote = QUOTE.exec(lineAt(at))) {
        body.push(quote[1] ?? '');
        at += 1;
      }
      blocks.push({ kind: 'quote', text: body.join('\n') });
      continue;
    }

    if (line.includes('|') && TABLE_RULE.test(lineAt(at + 1))) {
      const header = cells(line);
      const rows: string[][] = [];
      at += 2;
      while (at < lines.length && lineAt(at).includes('|') && lineAt(at).trim() !== '') {
        rows.push(cells(lineAt(at)));
        at += 1;
      }
      blocks.push({ kind: 'table', header, rows });
      continue;
    }

    if (BULLET.test(line) || NUMBER.test(line)) {
      // The marker on the first line decides the whole block. A nested list of
      // the other kind renders as this one — a distinction worth less than the
      // code it costs.
      const ordered = NUMBER.test(line);
      const items: Item[] = [];
      let open: Item | null = null;

      while (at < lines.length) {
        const match = BULLET.exec(lineAt(at)) ?? NUMBER.exec(lineAt(at));
        if (match) {
          // Depths are only ever compared with each other, so any indent width
          // nests correctly without being normalized.
          open = { text: match[2] ?? '', depth: Math.floor((match[1] ?? '').length / 2) };
          items.push(open);
          at += 1;
          continue;
        }
        // An indented line continues the item above it; anything else — a
        // blank line included — ends the list.
        if (!open || !/^\s+\S/.test(lineAt(at))) break;
        open.text += `\n${lineAt(at).trim()}`;
        at += 1;
      }

      blocks.push({ kind: 'list', ordered, items });
      continue;
    }

    const body: string[] = [];
    while (at < lines.length && lineAt(at).trim() !== '' && !isBlockStart(lineAt(at))) {
      body.push(lineAt(at));
      at += 1;
    }
    blocks.push({ kind: 'paragraph', text: body.join('\n') });
  }

  return blocks;
}

/** Whether a line interrupts the paragraph being accumulated. */
function isBlockStart(line: string): boolean {
  return (
    FENCE.test(line) ||
    HEADING.test(line) ||
    RULE.test(line) ||
    QUOTE.test(line) ||
    BULLET.test(line) ||
    NUMBER.test(line)
  );
}

/* ---------------------------------------------------------------------------
 * Inline
 * ------------------------------------------------------------------------- */

/**
 * One pass over a line of prose. Ordered by precedence: code first, so that
 * `**` inside a span stays literal; the three-marker form before the two, and
 * the two before the one, so the longest delimiter always wins.
 *
 * Every alternative requires its own closer. That is what makes the renderer
 * safe to run on a half-received line.
 *
 * Kept as a pattern rather than a regex because the scan is recursive — a
 * shared `lastIndex` would have an inner span derailing its own parent.
 */
const INLINE = [
  '(?<code>`+)(?<codeText>[\\s\\S]*?)\\k<code>',
  '!?\\[(?<label>[^\\]]*)\\]\\((?<href>[^()\\s]*)\\)',
  '\\*\\*\\*(?<bothText>[\\s\\S]+?)\\*\\*\\*',
  '(?<strong>\\*\\*|__)(?<strongText>[\\s\\S]+?)\\k<strong>',
  '~~(?<strikeText>[\\s\\S]+?)~~',
  '(?<em>[*_])(?<emText>[^\\s*_][\\s\\S]*?)\\k<em>',
].join('|');

/** Schemes a transcript may link to. Anything else renders as its own text. */
const SAFE_HREF = /^(?:https?:|mailto:)/i;

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const scan = new RegExp(INLINE, 'g');
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = scan.exec(text))) {
    const groups = match.groups ?? {};
    const start = match.index;

    // An underscore inside a word is an identifier, not emphasis: `max_tokens`
    // and `snake_case` have to survive a transcript intact. Resume one
    // character in rather than past the whole match — the run being rejected
    // may reach over a real span, and `a_b and **bold**` must still be bold.
    if ((groups.em === '_' || groups.strong === '__') && /\w/.test(text[start - 1] ?? '')) {
      scan.lastIndex = start + 1;
      continue;
    }

    if (start > last) out.push(text.slice(last, start));
    out.push(node(groups, start));
    last = start + match[0].length;
  }

  out.push(text.slice(last));
  return out;
}

/** The element for whichever alternative matched. */
function node(groups: Record<string, string | undefined>, key: number): ReactNode {
  if (groups.code != null) return <code key={key}>{groups.codeText}</code>;

  if (groups.href != null) {
    // `![alt](src)` lands here too: an image renders as a link to itself rather
    // than loading a remote asset into the transcript.
    const label = groups.label || groups.href;
    if (!SAFE_HREF.test(groups.href)) return <Fragment key={key}>{label}</Fragment>;
    return (
      <a key={key} href={groups.href} target="_blank" rel="noreferrer noopener">
        {label}
      </a>
    );
  }

  if (groups.bothText != null) {
    return (
      <strong key={key}>
        <em>{inline(groups.bothText)}</em>
      </strong>
    );
  }
  if (groups.strongText != null) return <strong key={key}>{inline(groups.strongText)}</strong>;
  if (groups.strikeText != null) return <s key={key}>{inline(groups.strikeText)}</s>;
  return <em key={key}>{inline(groups.emText ?? '')}</em>;
}

/* ---------------------------------------------------------------------------
 * Rendering
 * ------------------------------------------------------------------------- */

/** Rebuild the nesting the indents described: deeper items belong to the last. */
function list(items: Item[], ordered: boolean): ReactNode {
  const depth = items[0]?.depth ?? 0;
  const rendered: ReactNode[] = [];
  let rest = items;

  while (rest.length > 0) {
    const [item, ...tail] = rest;
    const sibling = tail.findIndex((entry) => entry.depth <= depth);
    const end = sibling === -1 ? tail.length : sibling;
    const children = tail.slice(0, end);

    rendered.push(
      <li key={rendered.length}>
        {inline(item?.text ?? '')}
        {children.length > 0 && list(children, ordered)}
      </li>,
    );
    rest = tail.slice(end);
  }

  return ordered ? <ol>{rendered}</ol> : <ul>{rendered}</ul>;
}

function render(block: Block, key: number): ReactNode {
  switch (block.kind) {
    case 'heading': {
      const Tag = `h${block.level}` as 'h1';
      return <Tag key={key}>{inline(block.text)}</Tag>;
    }

    case 'code':
      return (
        <div key={key}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="micro-label">{block.lang || 'code'}</span>
            <CopyButton text={block.text} />
          </div>
          <pre className="code">{block.text}</pre>
        </div>
      );

    case 'list':
      return <Fragment key={key}>{list(block.items, block.ordered)}</Fragment>;

    case 'quote':
      return <blockquote key={key}>{inline(block.text)}</blockquote>;

    case 'rule':
      return <hr key={key} className="hairline" />;

    case 'table':
      return (
        <div key={key} className="scroll-thin overflow-x-auto">
          <table>
            <thead>
              <tr>
                {block.header.map((cell, index) => (
                  <th key={index}>{inline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, index) => (
                    <td key={index}>{inline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'paragraph':
      return <p key={key}>{inline(block.text)}</p>;
  }
}

export function Markdown({ text }: { text: string }) {
  // Re-parsing the whole message per delta is linear in a message that is
  // already in memory, and it keeps the renderer a pure function of the text —
  // no incremental parser state to get out of step with the stream.
  const blocks = useMemo(() => parse(text), [text]);
  return <div className="prose min-w-0">{blocks.map(render)}</div>;
}
