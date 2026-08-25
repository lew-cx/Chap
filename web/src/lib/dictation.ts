/**
 * Capturing an utterance from the microphone.
 *
 * The counterpart to `speech.ts`, and it makes the same bet: go through the Web
 * Audio API rather than the obvious high-level element. `MediaRecorder` would be
 * fewer lines, but it hands back whatever container the browser prefers — webm
 * on Chrome, mp4 on Safari — and what LewLM's transcription route is proven to
 * accept is the WAV that `npm run proof` synthesizes and feeds straight back.
 * Taking the raw frames and writing the header here means the demo sends the
 * same bytes on every browser instead of the ones this browser happened to pick.
 *
 * The context is opened at 16 kHz because that is what a speech model wants and
 * asking the browser to resample is free. When a browser refuses the rate it
 * gives its own, which is why the header is written from `context.sampleRate`
 * rather than from the number requested — a WAV that lies about its rate
 * transcribes as gibberish, and this is the only place that can tell the truth.
 */

const TARGET_RATE = 16_000;

/**
 * Silence trimming, and why a capture path has to do it at all.
 *
 * A person presses the button, then speaks; finishes speaking, then releases.
 * Both gaps are recorded, and a speech model asked to transcribe silence does
 * not return nothing — Whisper-family models emit a caption-corpus phrase, most
 * often "Thank you.", with the same confidence as real speech. LewLM's segments
 * carry text and timing but no per-segment probability, so nothing downstream
 * can tell that phrase from something actually said. Deleting it by name would
 * be a lie about what was heard; not sending the silence is simply correct.
 *
 * The window is one render quantum at the target rate, ~8ms.
 */
const WINDOW = 128;
/** Below this peak, the whole clip is room tone and there is nothing to send. */
const NOISE_GATE = 0.02;
/** A window counts as speech at this fraction of the loudest one. */
const RELATIVE_GATE = 0.15;
/** Kept either side of the speech, so the first and last phoneme survive. */
const PAD_SECONDS = 0.12;

/**
 * Posts each render block back to the main thread. Deliberately the smallest
 * processor that can exist: a worklet cannot be debugged from a stack trace, so
 * anything it could get wrong belongs on the other side of the port.
 */
const TAP = `
class Tap extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) this.port.postMessage(channel.slice());
    return true;
  }
}
registerProcessor('chap-tap', Tap);
`;

export interface Recording {
  /** `audio/wav`, 16-bit PCM mono, ready to post as a multipart part. */
  blob: Blob;
  /** Length of the trimmed speech — what is actually sent. */
  seconds: number;
  /** Length of the whole hold, trimming included. */
  heldSeconds: number;
  sampleRate: number;
}

/** WAV is a 44-byte header and the samples; a library for that would be a joke. */
export function encodeWav(frames: readonly Float32Array[], sampleRate: number): Blob {
  const count = frames.reduce((total, frame) => total + frame.length, 0);
  const buffer = new ArrayBuffer(44 + count * 2);
  const view = new DataView(buffer);

  const ascii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  ascii(0, 'RIFF');
  view.setUint32(4, 36 + count * 2, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM header length
  view.setUint16(20, 1, true); // PCM, uncompressed
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  ascii(36, 'data');
  view.setUint32(40, count * 2, true);

  let offset = 44;
  for (const frame of frames) {
    for (const sample of frame) {
      // Clamp before scaling: a value outside [-1, 1] wraps rather than clips.
      const clamped = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * The span of `samples` that contains speech, or null if none of it does.
 *
 * Both gates earn their place: the relative one adapts to how close the person
 * sits to the microphone, and the absolute one stops a clip of pure room tone
 * from having its own noise floor promoted to "the loudest thing here".
 */
export function speechSpan(
  samples: Float32Array,
  sampleRate: number,
): { start: number; end: number } | null {
  const windows: number[] = [];
  for (let offset = 0; offset < samples.length; offset += WINDOW) {
    let peak = 0;
    const limit = Math.min(offset + WINDOW, samples.length);
    for (let i = offset; i < limit; i++) peak = Math.max(peak, Math.abs(samples[i]!));
    windows.push(peak);
  }

  const loudest = Math.max(0, ...windows);
  if (loudest < NOISE_GATE) return null;

  const threshold = Math.max(NOISE_GATE, loudest * RELATIVE_GATE);
  const first = windows.findIndex((peak) => peak >= threshold);
  const last = windows.findLastIndex((peak) => peak >= threshold);
  if (first === -1) return null;

  const pad = Math.round(PAD_SECONDS * sampleRate);
  return {
    start: Math.max(0, first * WINDOW - pad),
    end: Math.min(samples.length, (last + 1) * WINDOW + pad),
  };
}

export class Recorder {
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private node: AudioWorkletNode | null = null;
  private frames: Float32Array[] = [];
  private peak = 0;
  /**
   * Which attempt is live. `start()` awaits twice — permission, then the worklet
   * module — and a press-and-release shorter than either await used to land in a
   * torn-down recorder and go on opening a microphone nobody would ever close.
   * Bumped by every start and every teardown, so any attempt can tell whether it
   * is still the current one.
   */
  private generation = 0;

  static get supported(): boolean {
    return (
      typeof AudioWorkletNode !== 'undefined' &&
      navigator.mediaDevices?.getUserMedia !== undefined
    );
  }

  /** Open the microphone and begin collecting. Throws what the browser threw. */
  async start(): Promise<void> {
    const mine = ++this.generation;
    this.frames = [];
    this.peak = 0;

    // Echo cancellation matters here specifically: spoken replies are playing out
    // of the same machine's speakers, and without it the model hears itself.
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    });

    // Released before permission resolved. The stream still opened, so stopping
    // its tracks here is the only thing that turns the recording indicator off.
    if (mine !== this.generation) {
      for (const track of stream.getTracks()) track.stop();
      return;
    }
    this.stream = stream;

    const context = new AudioContext({ sampleRate: TARGET_RATE });
    this.context = context;

    // A worklet module has to be a URL. Inlining it keeps the processor next to
    // the code that reads its messages instead of in a public/ file that looks
    // like a build artifact.
    const url = URL.createObjectURL(new Blob([TAP], { type: 'text/javascript' }));
    try {
      await context.audioWorklet.addModule(url);
    } finally {
      URL.revokeObjectURL(url);
    }

    // The second window: released while the worklet module was loading.
    if (mine !== this.generation) {
      void context.close().catch(() => undefined);
      for (const track of stream.getTracks()) track.stop();
      return;
    }

    const node = new AudioWorkletNode(context, 'chap-tap');
    node.port.onmessage = (event: MessageEvent<Float32Array>) => {
      this.frames.push(event.data);
      let peak = 0;
      for (const sample of event.data) peak = Math.max(peak, Math.abs(sample));
      this.peak = peak;
    };
    this.node = node;

    context.createMediaStreamSource(stream).connect(node);
    // A worklet only runs while it is reachable from the destination, and this
    // one emits nothing, so connecting it cannot be heard.
    node.connect(context.destination);
  }

  /** Loudest sample in the most recent block, 0..1. For the level meter. */
  get level(): number {
    return this.peak;
  }

  /** Close the microphone and hand back the utterance, or null if it was silent. */
  async stop(): Promise<Recording | null> {
    const context = this.context;
    const frames = this.frames;
    const sampleRate = context?.sampleRate ?? TARGET_RATE;
    this.teardown();

    if (frames.length === 0) return null;

    const count = frames.reduce((total, frame) => total + frame.length, 0);
    const samples = new Float32Array(count);
    let offset = 0;
    for (const frame of frames) {
      samples.set(frame, offset);
      offset += frame.length;
    }

    // A clip with no speech in it is not a short recording to be sent anyway; it
    // is a button press, and sending it invents a sentence.
    const span = speechSpan(samples, sampleRate);
    if (!span) return null;

    const speech = samples.subarray(span.start, span.end);
    return {
      blob: encodeWav([speech], sampleRate),
      seconds: speech.length / sampleRate,
      sampleRate,
      /** What was captured before trimming, so the panel can show the difference. */
      heldSeconds: count / sampleRate,
    };
  }

  /** Abandon the utterance: release the microphone, keep nothing. */
  cancel(): void {
    this.teardown();
  }

  private teardown(): void {
    // Invalidates any `start()` still waiting on a promise, so it releases what
    // it opened instead of installing it into a recorder that is already closed.
    this.generation += 1;
    this.frames = [];
    this.peak = 0;
    if (this.node) {
      this.node.port.onmessage = null;
      this.node.disconnect();
      this.node = null;
    }
    // Stopping every track is what turns the browser's recording indicator off.
    for (const track of this.stream?.getTracks() ?? []) track.stop();
    this.stream = null;
    void this.context?.close().catch(() => undefined);
    this.context = null;
  }
}
