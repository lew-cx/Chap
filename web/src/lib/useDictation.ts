/**
 * The composer's view of talking instead of typing.
 *
 * Push-to-talk, deliberately: the button is held for exactly as long as the
 * utterance lasts, so there is no endpointing to get wrong and no silence timer
 * to tune. Hands-free wants a voice-activity detector and the honest place to
 * add one is here, behind the same two calls.
 *
 * `ChatScreen` should not know that an utterance becomes a WAV, or that the
 * multipart field is called `file`. It says when the button went down and when
 * it came up; the transcript arrives by callback.
 *
 * No model select, for the reason the speech drawer has none:
 * `capability_availability[]` names the one model that can serve
 * `audio_transcription`, so there is nothing left to ask (G25).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { buildMultipart, isAbort, type AudioTranscriptionResponse } from '@chap/lewlm';

import { lewlm } from './client.ts';
import { Recorder } from './dictation.ts';
import { useCapability, type CapabilityStatus } from './useCapability.ts';

/** Below this, the button was a mis-click rather than an utterance. */
const MINIMUM_SECONDS = 0.25;

export type DictationState = 'idle' | 'listening' | 'transcribing';

export interface DictationController {
  state: DictationState;
  /** Loudest recent sample, 0..1. Zero unless listening. */
  level: number;
  capability: CapabilityStatus;
  /** LewLM's answer, not a choice: the one model that can transcribe. */
  model: string;
  language: string;
  setLanguage: (language: string) => void;
  /** The last transcript, kept for the panel after it has gone to the composer. */
  last: AudioTranscriptionResponse | null;
  /** Speech sent, after silence was trimmed off both ends. */
  lastSeconds: number | null;
  /** Length of the hold that produced it. The difference is trimmed silence. */
  lastHeldSeconds: number | null;
  error: string | null;
  /** True when a transcription model exists and the browser can capture. */
  available: boolean;
  /** Button down: open the microphone. */
  hold: () => void;
  /** Button up: close it and transcribe what was said. */
  release: () => void;
}

export function useDictation(onTranscript: (text: string) => void): DictationController {
  const capability = useCapability('audio_transcription');
  const [state, setState] = useState<DictationState>('idle');
  const [level, setLevel] = useState(0);
  const [language, setLanguage] = useState('en');
  const [last, setLast] = useState<AudioTranscriptionResponse | null>(null);
  const [lastSeconds, setLastSeconds] = useState<number | null>(null);
  const [lastHeldSeconds, setLastHeldSeconds] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorder = useRef<Recorder | null>(null);
  const holding = useRef(false);
  const controller = useRef<AbortController | null>(null);

  // Read through refs so a hold that began before the latest render still ends
  // by calling the current callback with the current settings.
  const deliver = useRef(onTranscript);
  deliver.current = onTranscript;
  const settings = useRef({ model: '', language: 'en' });
  settings.current = { model: capability.models[0] ?? '', language };

  const model = capability.models[0] ?? '';
  const available = Recorder.supported && model !== '';

  // A hold in flight when the screen goes away would leave the microphone open
  // and the browser's recording indicator lit.
  useEffect(
    () => () => {
      recorder.current?.cancel();
      controller.current?.abort();
    },
    [],
  );

  // Polled rather than pushed: the meter is decoration, and a setState per
  // 128-sample render block would be 125 renders a second for it.
  useEffect(() => {
    if (state !== 'listening') {
      setLevel(0);
      return;
    }
    const timer = setInterval(() => setLevel(recorder.current?.level ?? 0), 80);
    return () => clearInterval(timer);
  }, [state]);

  const hold = useCallback(() => {
    if (holding.current || !available) return;
    holding.current = true;
    setError(null);
    setState('listening');

    const opened = new Recorder();
    recorder.current = opened;
    void opened.start().catch((cause) => {
      // Permission denied is the common one, and the browser's message for it is
      // clearer than anything worth writing here.
      recorder.current = null;
      holding.current = false;
      setState('idle');
      setError(cause instanceof Error ? cause.message : String(cause));
    });
  }, [available]);

  const release = useCallback(() => {
    if (!holding.current) return;
    holding.current = false;

    const open = recorder.current;
    recorder.current = null;
    if (!open) return;

    setState('transcribing');
    void (async () => {
      try {
        // `stop()` returns nothing when the hold caught no speech. Sending it
        // anyway is how a silent button press becomes "Thank you." in the prompt.
        const recording = await open.stop();
        if (!recording || recording.seconds < MINIMUM_SECONDS) {
          setState('idle');
          return;
        }
        setLastSeconds(recording.seconds);
        setLastHeldSeconds(recording.heldSeconds);

        const form = buildMultipart([
          { uploadName: 'file', file: recording.blob, fileName: 'utterance.wav' },
        ]);
        // Named even though LewLM routes without it, for the same reason speech
        // names its model: a bench should record what produced a result.
        if (settings.current.model) form.set('model', settings.current.model);
        if (settings.current.language.trim()) form.set('language', settings.current.language.trim());

        controller.current = new AbortController();
        const result = await lewlm.request<AudioTranscriptionResponse>(
          'POST',
          '/v1/audio/transcriptions',
          { form, signal: controller.current.signal },
        );

        setLast(result);
        const text = result.text.trim();
        if (text) deliver.current(text);
      } catch (cause) {
        if (!isAbort(cause)) setError(cause instanceof Error ? cause.message : String(cause));
      } finally {
        controller.current = null;
        setState('idle');
      }
    })();
  }, []);

  return {
    state,
    level,
    capability,
    model,
    language,
    setLanguage,
    last,
    lastSeconds,
    lastHeldSeconds,
    error,
    available,
    hold,
    release,
  };
}
