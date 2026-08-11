/**
 * Speaking a reply while it is still being written.
 *
 * The latency that matters is time-to-first-word, and it is bounded by one
 * sentence rather than by the whole turn: sentence 1 is synthesized and starts
 * playing while sentence 2 is still being generated. Synthesis stays serial —
 * the model is a single local resident, so a second concurrent request would
 * queue behind the first anyway — and the overlap comes from playback being
 * scheduled rather than awaited.
 *
 * Playback goes through the Web Audio API rather than an `<audio>` element
 * because clips have to abut without a gap. Each buffer is scheduled at the
 * exact time the previous one ends, on the audio clock, which no sequence of
 * `play()` calls can achieve.
 *
 * The model is named on every request. LewLM routes correctly without it now
 * that audio roles are per-manifest, but a bench should record which model
 * produced a sound rather than leaving it to be inferred later.
 */

import { isAbort, type AudioSpeechResponse } from '@chap/lewlm';

import { lewlm } from './client.ts';

export interface SpeechStatus {
  /** Sentences accepted but not yet synthesized. */
  queued: number;
  /** Sentences handed to the audio clock. */
  spoken: number;
  synthesizing: boolean;
  /** No more text is coming and everything queued has been scheduled. */
  finished: boolean;
}

export const IDLE_STATUS: SpeechStatus = {
  queued: 0,
  spoken: 0,
  synthesizing: false,
  finished: true,
};

export interface SpeechQueueConfig {
  model: string;
  voice: string | null;
  /** Groups every clip of one turn under a single id in LewLM's events and logs. */
  correlationId: string;
  onStatus: (status: SpeechStatus) => void;
  onError: (message: string) => void;
}

function decodeBase64(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export class SpeechQueue {
  private pending: string[] = [];
  private draining = false;
  private cancelled = false;
  private ended = false;
  private failed = false;
  private spoken = 0;
  private synthesizing = false;

  private context: AudioContext | null = null;
  /** Audio-clock time at which the last scheduled clip finishes. */
  private nextStart = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private controller = new AbortController();

  constructor(private readonly config: SpeechQueueConfig) {
    // Create and resume the context while `begin()` is still inside the user's
    // Send gesture. Waiting for synthesis to finish loses browser activation.
    try {
      this.audioContext();
    } catch (cause) {
      this.failed = true;
      this.config.onError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  /** Accept one sentence. Safe to call after `cancel()`; it is ignored. */
  push(sentence: string): void {
    if (this.cancelled || this.failed || this.ended) return;
    this.pending.push(sentence);
    this.report();
    void this.drain();
  }

  /** No more sentences are coming. Already-queued ones still play. */
  end(): void {
    this.ended = true;
    this.report();
  }

  /** Stop now: abandon the in-flight request and silence what is scheduled. */
  cancel(): void {
    if (this.cancelled) return;
    this.cancelled = true;
    this.pending = [];
    this.controller.abort();
    for (const source of this.sources) {
      // A source that already finished throws on stop; it is already silent.
      try {
        source.stop();
      } catch {
        /* already ended */
      }
    }
    this.sources.clear();
    void this.context?.close().catch(() => undefined);
    this.context = null;
    this.report();
  }

  private report(): void {
    this.config.onStatus({
      queued: this.pending.length,
      spoken: this.spoken,
      synthesizing: this.synthesizing,
      finished: this.ended && this.pending.length === 0 && !this.synthesizing,
    });
  }

  private audioContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
      this.nextStart = 0;
    }
    // `SpeechQueue` primes this during the Send gesture; later calls also resume
    // defensively in case the browser suspended an idle context.
    void this.context.resume().catch(() => undefined);
    return this.context;
  }

  private async drain(): Promise<void> {
    if (this.draining) return;
    this.draining = true;
    try {
      while (!this.cancelled && !this.failed && this.pending.length > 0) {
        const sentence = this.pending.shift()!;
        this.synthesizing = true;
        this.report();

        const buffer = await this.synthesize(sentence);

        this.synthesizing = false;
        if (buffer && !this.cancelled) {
          this.schedule(buffer);
          this.spoken++;
        }
        this.report();
      }
    } finally {
      this.draining = false;
    }
  }

  private async synthesize(sentence: string): Promise<AudioBuffer | null> {
    try {
      const response = await lewlm.request<AudioSpeechResponse>('POST', '/v1/audio/speech', {
        json: {
          input: sentence,
          format: 'wav',
          model: this.config.model,
          ...(this.config.voice ? { voice: this.config.voice } : {}),
        },
        signal: this.controller.signal,
        correlationId: this.config.correlationId,
      });
      if (this.cancelled) return null;
      return await this.audioContext().decodeAudioData(decodeBase64(response.audio_base64));
    } catch (cause) {
      if (isAbort(cause) || this.cancelled) return null;
      // One failure means every following sentence fails the same way — a wrong
      // model pin, a model that will not load. Report it once and stop.
      this.failed = true;
      this.pending = [];
      this.config.onError(cause instanceof Error ? cause.message : String(cause));
      return null;
    }
  }

  private schedule(buffer: AudioBuffer): void {
    const context = this.audioContext();
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.addEventListener('ended', () => {
      this.sources.delete(source);
      this.report();
    });

    // A small lead keeps the first clip from being clipped by a start time that
    // has already passed by the time the buffer is wired up.
    const startAt = Math.max(context.currentTime + 0.02, this.nextStart);
    source.start(startAt);
    this.sources.add(source);
    this.nextStart = startAt + buffer.duration;
  }
}
