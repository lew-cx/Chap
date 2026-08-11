/**
 * The chat screen's view of speaking replies aloud.
 *
 * `ChatScreen` should not know that a sentence is the unit of synthesis, or that
 * playback is scheduled on an audio clock. It hands over deltas as they arrive
 * and says when the turn is over; everything else is here.
 *
 * The model is not chosen here. `capability_availability[]` names the model that
 * can serve `audio_speech` and only that model, so the select this hook used to
 * expose — and the probing that went with it — came out when G25 closed.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { useCapability, type CapabilityStatus } from './useCapability.ts';
import { useVoices, type VoiceInventory } from './useVoices.ts';
import { SentenceSplitter } from './sentences.ts';
import { IDLE_STATUS, SpeechQueue, type SpeechStatus } from './speech.ts';

export interface SpeechController {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  /** LewLM's answer, not a choice: the one model that can synthesize. */
  model: string;
  voice: string;
  setVoice: (voice: string) => void;
  capability: CapabilityStatus;
  voices: VoiceInventory;
  status: SpeechStatus;
  error: string | null;
  /** True when a synthesis model exists and the toggle is on. */
  armed: boolean;
  /** Start a turn. `correlationId` groups its clips in LewLM's events. */
  begin: (correlationId: string) => void;
  /** Feed one text delta. Complete sentences are spoken as they close. */
  push: (delta: string) => void;
  /** The turn produced all its text; speak whatever is left. */
  end: () => void;
  /** Abandon the turn: stop synthesis and silence what is scheduled. */
  cancel: () => void;
}

export function useSpeech(): SpeechController {
  const capability = useCapability('audio_speech');
  const [enabled, setEnabled] = useState(false);
  const [voice, setVoice] = useState('');
  const [status, setStatus] = useState<SpeechStatus>(IDLE_STATUS);
  const [error, setError] = useState<string | null>(null);

  const queue = useRef<SpeechQueue | null>(null);
  const splitter = useRef<SentenceSplitter | null>(null);

  const model = capability.models[0] ?? '';
  const voices = useVoices(model || null);
  const armed = enabled && model !== '';

  const cancel = useCallback(() => {
    queue.current?.cancel();
    queue.current = null;
    splitter.current = null;
    setStatus(IDLE_STATUS);
  }, []);

  // A turn in flight when the screen goes away would keep talking to an empty room.
  useEffect(() => cancel, [cancel]);

  // Turning it off mid-turn should be immediate, not "after this reply".
  useEffect(() => {
    if (!armed) cancel();
  }, [armed, cancel]);

  const begin = useCallback(
    (correlationId: string) => {
      cancel();
      setError(null);
      if (!armed) return;
      splitter.current = new SentenceSplitter();
      queue.current = new SpeechQueue({
        model,
        voice: voice.trim() || null,
        correlationId,
        onStatus: setStatus,
        onError: setError,
      });
    },
    [armed, cancel, model, voice],
  );

  const push = useCallback((delta: string) => {
    const sentences = splitter.current?.push(delta) ?? [];
    for (const sentence of sentences) queue.current?.push(sentence);
  }, []);

  const end = useCallback(() => {
    const rest = splitter.current?.flush() ?? [];
    for (const sentence of rest) queue.current?.push(sentence);
    splitter.current = null;
    queue.current?.end();
  }, []);

  return {
    enabled,
    setEnabled,
    model,
    voice,
    setVoice,
    capability,
    voices,
    status,
    error,
    armed,
    begin,
    push,
    end,
    cancel,
  };
}
