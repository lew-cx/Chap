/**
 * Live token count for the composer.
 *
 * `POST /v1/tokenize/count` returns an exact count from the selected model's own
 * tokenizer, so the meter is a measurement rather than the `length / 4` guess
 * this used to be.
 *
 * One caveat worth knowing: the endpoint counts a raw `text` string, not the
 * compiled prompt. The template, system prompt, declared tools and any citation
 * context all add tokens this number does not see, so it is a floor for the
 * request, not the total. Chap labels it accordingly.
 */

import { useEffect, useState } from 'react';

import { LewLMApiError, type TokenCountResponse } from '@chap/lewlm';

import { lewlm } from './client.ts';

const DEBOUNCE_MS = 300;

export function useTokenCount(text: string, model: string): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!text.trim()) {
      setCount(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      lewlm
        .request<TokenCountResponse>('POST', '/v1/tokenize/count', {
          json: { text, ...(model ? { model } : {}) },
          signal: controller.signal,
        })
        .then((result) => setCount(result.token_count))
        .catch((cause: unknown) => {
          // A count is a nicety. Show nothing rather than a wrong number.
          if (cause instanceof LewLMApiError) setCount(null);
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text, model]);

  return count;
}
