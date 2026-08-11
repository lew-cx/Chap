/**
 * Cutting a token stream into speakable sentences.
 *
 * Speaking a reply while it is still being generated means deciding, on partial
 * text, where a sentence ends — and being wrong in only one direction. Cutting
 * too early sends a fragment to the synthesizer and the prosody is wrong for the
 * rest of the turn; cutting too late is merely slower. So every rule here
 * refuses to split when it is unsure, and `flush()` at end of stream is what
 * guarantees nothing is lost.
 *
 * This is Chap's code, not LewLM's: it is a property of reading text aloud in a
 * browser, not of the contract. It lives in `web/` for that reason.
 */

/** Words that end in a period without ending a sentence. */
const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'mt',
  'e.g', 'i.e', 'etc', 'vs', 'approx', 'est', 'fig', 'no', 'al',
  'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec',
]);

/**
 * A sentence this long with no terminator in sight is not going to get one —
 * usually a table row or a long code-free list. Speak it rather than stall.
 */
const MAX_SENTENCE = 320;

/** Strip the markup that should be read as text, or not read at all. */
function speakable(line: string): string {
  return line
    // Images carry no spoken content; links carry their label only.
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Inline code reads as its content; the backticks are not words.
    .replace(/`+/g, '')
    .replace(/[*_]{1,3}/g, '')
    // Leading heading, quote and list markers are structure, not speech.
    .replace(/^\s{0,3}(#{1,6}\s+|>\s?|[-*+]\s+)/, '')
    // A numbered list marker would otherwise be spoken as its own sentence.
    .replace(/^\s{0,3}\d+[.)]\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True when the period at `index` is punctuation inside a word, not a full stop. */
function isAbbreviation(text: string, index: number): boolean {
  const before = text.slice(0, index);
  const word = /([A-Za-z.]+)$/.exec(before)?.[1] ?? '';
  if (word.length === 1) return true; // an initial: "J. R. Hartley"
  return ABBREVIATIONS.has(word.toLowerCase().replace(/\.$/, ''));
}

/**
 * True when the period at `index` closes a numbered list marker. Position is
 * what distinguishes it: "1." opening a line is a bullet, while the same period
 * in "built in 1274. The tower" ends a sentence.
 */
function isListMarker(text: string, index: number): boolean {
  const lineStart = text.lastIndexOf('\n', index - 1) + 1;
  return /^\s{0,3}\d+$/.test(text.slice(lineStart, index));
}

export class SentenceSplitter {
  /** The line currently being written, still growing. */
  private line = '';
  /**
   * Text cleared for speech but not yet cut into sentences. Held raw: markup is
   * stripped when a sentence is emitted, never on a fragment, because a fragment
   * boundary falls in arbitrary places and trimming one eats the space between
   * two words.
   */
  private ready = '';
  /** How much of `line` has already been copied into `ready`. */
  private copied = 0;
  private inFence = false;

  push(delta: string): string[] {
    this.line += delta;
    this.consumeLines(false);
    return this.cut(false);
  }

  /** Everything still buffered, at end of stream. Nothing is discarded. */
  flush(): string[] {
    this.consumeLines(true);
    const sentences = this.cut(true);
    this.line = '';
    this.ready = '';
    this.copied = 0;
    this.inFence = false;
    return sentences;
  }

  /**
   * Move finished lines into `ready`, dropping fenced code. Fences are
   * line-oriented, so a partial trailing line can only be trusted once it can no
   * longer turn into a fence marker.
   */
  private consumeLines(final: boolean): void {
    const lines = this.line.split('\n');
    this.line = final ? '' : (lines.pop() ?? '');

    for (const [index, line] of lines.entries()) {
      // Only the first line can already be partly copied — it is the one that
      // was the trailing fragment on the previous call.
      const fresh = index === 0 ? line.slice(Math.min(this.copied, line.length)) : line;
      if (index === 0) this.copied = 0;

      if (line.trimStart().startsWith('```')) {
        this.inFence = !this.inFence;
        continue;
      }
      if (this.inFence) continue;
      // A blank line is a paragraph break: a hard stop for the voice.
      this.ready += `${fresh}\n`;
    }
    if (lines.length > 0) this.copied = 0;

    // The trailing fragment is speakable only once it cannot become a fence —
    // otherwise the opening ``` of a code block gets read out loud.
    if (!final && !this.inFence && this.line && !this.line.trimStart().startsWith('`')) {
      this.ready += this.line.slice(this.copied);
      this.copied = this.line.length;
    }
  }

  /** Cut `ready` at every boundary that is safe to cut at. */
  private cut(final: boolean): string[] {
    const sentences: string[] = [];

    for (;;) {
      const end = this.boundary(final);
      if (end === -1) break;
      const sentence = speakable(this.ready.slice(0, end));
      this.ready = this.ready.slice(end).replace(/^\s+/, '');
      if (sentence) sentences.push(sentence);
    }

    if (final) {
      const rest = speakable(this.ready);
      this.ready = '';
      if (rest) sentences.push(rest);
    }
    return sentences;
  }

  /** Index just past the end of the next sentence, or -1 if there isn't one yet. */
  private boundary(final: boolean): number {
    for (let i = 0; i < this.ready.length; i++) {
      const char = this.ready[i]!;

      if (char === '\n') return i + 1;

      if (char === '.' || char === '!' || char === '?') {
        // Closing quotes and brackets belong to the sentence they end.
        let end = i + 1;
        while (end < this.ready.length && `"')]}`.includes(this.ready[end]!)) end++;

        const next = this.ready[end];
        // No following character yet means the sentence may not be over —
        // "3." could still become "3.5". Wait unless this is the last chance.
        if (next === undefined) return final ? end : -1;
        if (!/\s/.test(next)) continue;
        if (char === '.' && (isAbbreviation(this.ready, i) || isListMarker(this.ready, i))) continue;
        return end;
      }
    }

    // No terminator, but too long to keep waiting: cut at the last word break.
    if (this.ready.length > MAX_SENTENCE) {
      const cut = this.ready.lastIndexOf(' ', MAX_SENTENCE);
      if (cut > 0) return cut;
    }
    return -1;
  }
}
