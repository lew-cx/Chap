/**
 * A Server-Sent Events reader over `fetch`.
 *
 * Not `EventSource`. EventSource cannot POST (so it cannot start a chat), cannot
 * set headers (so no API key and no audit identity), and reconnects on its own —
 * which on a chat stream would silently re-run generation and bill a second
 * inference pass. One fetch-based reader serves both chat streaming and the
 * event bus.
 */

export interface SSEFrame {
  /** The `event:` field. LewLM sets it on `/v1/events`, not on chat streams. */
  event: string | undefined;
  data: string;
  id: string | undefined;
}

/**
 * Yield one frame per `\n\n`-delimited SSE block.
 *
 * LewLM sends `: keep-alive` comment frames every second on both chat and
 * `/v1/events` to hold the connection open. Comments carry no data and are
 * dropped here rather than surfacing as empty frames.
 *
 * Cancellation is the caller's `AbortSignal` on the original fetch. Aborting
 * rejects the pending read with an `AbortError`, which propagates out of this
 * generator — deliberately, so a cancelled run is distinguishable from one that
 * ended normally. Do not swallow it here.
 */
export async function* readSSE(res: Response): AsyncGenerator<SSEFrame> {
  if (!res.body) throw new Error('response has no body to stream');

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value;

      // Normalize CRLF so a proxy that rewrites line endings cannot split frames.
      buffer = buffer.replace(/\r\n/g, '\n');

      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const frame = parseBlock(block);
        if (frame) yield frame;
        boundary = buffer.indexOf('\n\n');
      }
    }

    // A final block with no trailing blank line still counts.
    const trailing = parseBlock(buffer);
    if (trailing) yield trailing;
  } finally {
    // Runs on normal completion, on abort, and when the consumer breaks out of
    // the loop early — all three must release the connection.
    await reader.cancel().catch(() => {});
  }
}

function parseBlock(block: string): SSEFrame | null {
  let event: string | undefined;
  let id: string | undefined;
  const data: string[] = [];

  for (const line of block.split('\n')) {
    if (line === '' || line.startsWith(':')) continue; // comment / keep-alive
    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    // A single space after the colon is part of the framing, not the value.
    const rawValue = colon === -1 ? '' : line.slice(colon + 1);
    const value = rawValue.startsWith(' ') ? rawValue.slice(1) : rawValue;

    if (field === 'data') data.push(value);
    else if (field === 'event') event = value;
    else if (field === 'id') id = value;
  }

  if (data.length === 0) return null;
  return { event, id, data: data.join('\n') };
}
