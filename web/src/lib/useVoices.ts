/**
 * The synthesis voices a model can use, from LewLM rather than from a list Chap
 * made up.
 *
 * `enumerable` is the field that matters. Kokoro's voices live in the backend's
 * own Hugging Face cache, not in the model directory, so "what voices exist" is
 * a question only LewLM can answer honestly — and it answers with where each one
 * came from. A listed voice is a guarantee; an absent one is not a refusal,
 * because the backend can still fetch a name on demand. Callers should keep free
 * entry available for that reason.
 */

import { useEffect, useState } from 'react';

import type { AudioVoiceInventory } from '@chap/lewlm';

import { lewlm } from './client.ts';

type Voice = NonNullable<AudioVoiceInventory['voices']>[number];
type SpeechFormat = NonNullable<AudioVoiceInventory['formats']>[number];

export interface VoiceInventory {
  voices: Voice[];
  enumerable: boolean;
  /** Why the list is empty or partial, in LewLM's words. */
  reason: string | null;
  formats: SpeechFormat[];
  formatsExhaustive: boolean;
  defaultFormat: string;
  loading: boolean;
}

const NONE: VoiceInventory = {
  voices: [],
  enumerable: false,
  reason: null,
  formats: [],
  formatsExhaustive: false,
  defaultFormat: 'wav',
  loading: false,
};

export function useVoices(modelId: string | null): VoiceInventory {
  const [inventory, setInventory] = useState<VoiceInventory>(NONE);

  useEffect(() => {
    if (!modelId) {
      setInventory(NONE);
      return;
    }
    let live = true;
    setInventory({ ...NONE, loading: true });

    lewlm
      .request<AudioVoiceInventory>('GET', '/v1/audio/voices', { query: { model: modelId } })
      .then((result) => {
        if (!live) return;
        setInventory({
          voices: result.voices ?? [],
          enumerable: result.enumerable,
          reason: result.reason ?? null,
          formats: result.formats ?? [],
          formatsExhaustive: result.formats_exhaustive,
          defaultFormat: result.default_format,
          loading: false,
        });
      })
      .catch((cause: unknown) => {
        if (!live) return;
        // A host that cannot list voices is not a broken screen; it is the
        // `enumerable: false` case arriving as an error instead of a field.
        setInventory({
          ...NONE,
          reason: cause instanceof Error ? cause.message : String(cause),
        });
      });

    return () => {
      live = false;
    };
  }, [modelId]);

  return inventory;
}
