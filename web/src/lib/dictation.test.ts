/**
 * The header is the part that can silently ruin a transcript.
 *
 * A WAV whose declared rate disagrees with its samples still decodes, still
 * plays, and transcribes as confident nonsense — there is no error anywhere to
 * catch it. So the field the browser cannot be trusted to honour, the sample
 * rate, is asserted here rather than left to be noticed by ear.
 *
 * Capture itself needs a microphone and an AudioWorklet, so it belongs in the
 * browser; the encoder is pure and belongs in a test.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { encodeWav, speechSpan } from './dictation.ts';

async function header(blob: Blob): Promise<DataView> {
  return new DataView(await blob.arrayBuffer());
}

const ascii = (view: DataView, offset: number, length: number): string =>
  String.fromCharCode(...Array.from({ length }, (_, i) => view.getUint8(offset + i)));

test('writes the rate it was given, not the rate it wanted', async () => {
  // A browser that refuses a 16 kHz context hands back 48 kHz, and the header is
  // the only place that difference can be recorded truthfully.
  const view = await header(encodeWav([new Float32Array(480)], 48_000));

  assert.equal(ascii(view, 0, 4), 'RIFF');
  assert.equal(ascii(view, 8, 4), 'WAVE');
  assert.equal(view.getUint32(24, true), 48_000);
  assert.equal(view.getUint32(28, true), 96_000, 'byte rate must follow the sample rate');
  assert.equal(view.getUint16(22, true), 1, 'mono');
  assert.equal(view.getUint16(34, true), 16, 'bits per sample');
});

test('sizes both length fields from the frames it was handed', async () => {
  const view = await header(encodeWav([new Float32Array(100), new Float32Array(60)], 16_000));

  assert.equal(view.byteLength, 44 + 320);
  assert.equal(view.getUint32(4, true), 36 + 320, 'RIFF chunk size excludes the first 8 bytes');
  assert.equal(ascii(view, 36, 4), 'data');
  assert.equal(view.getUint32(40, true), 320);
});

test('clamps rather than wraps at the rails', async () => {
  // Scaling 1.2 without clamping wraps to a large negative sample: a click on
  // every loud syllable, which reads to a decoder as noise rather than speech.
  const view = await header(encodeWav([new Float32Array([1.2, -1.2, 0])], 16_000));

  assert.equal(view.getInt16(44, true), 32_767);
  assert.equal(view.getInt16(46, true), -32_768);
  assert.equal(view.getInt16(48, true), 0);
});

/**
 * The trimming exists because of one specific failure: a hold that catches
 * silence at either end comes back with "Thank you." appended, which is what a
 * Whisper-family model emits when asked to transcribe nothing. LewLM's segments
 * carry no probability, so this is the last point at which that can be prevented
 * on evidence rather than by deleting the phrase afterwards.
 */

const RATE = 16_000;

/** `seconds` of silence, with `speech` seconds of tone starting at `at`. */
function utterance(seconds: number, at: number, speech: number, level = 0.4): Float32Array {
  const samples = new Float32Array(Math.round(seconds * RATE));
  const start = Math.round(at * RATE);
  const end = start + Math.round(speech * RATE);
  for (let i = start; i < end && i < samples.length; i++) {
    samples[i] = Math.sin((i / RATE) * 2 * Math.PI * 220) * level;
  }
  return samples;
}

test('a hold that caught only room tone yields nothing to send', () => {
  const room = new Float32Array(RATE);
  for (let i = 0; i < room.length; i++) room[i] = (Math.random() - 0.5) * 0.01;

  // Not "a short recording to send anyway" — there is no utterance in it.
  assert.equal(speechSpan(room, RATE), null);
});

test('trims the press-then-speak and finish-then-release gaps', () => {
  // Two seconds held, speech only in the middle half-second.
  const span = speechSpan(utterance(2, 0.75, 0.5), RATE)!;
  assert.notEqual(span, null);

  const start = span.start / RATE;
  const end = span.end / RATE;
  assert.ok(start > 0.5 && start <= 0.75, `starts just before the speech, got ${start}`);
  assert.ok(end >= 1.25 && end < 1.5, `ends just after the speech, got ${end}`);
});

test('keeps a pad so the first and last phoneme survive', () => {
  // Trimming to the exact window that crossed the threshold clips the onset of
  // the first word, which costs more than the silence it saves.
  const span = speechSpan(utterance(2, 0.75, 0.5), RATE)!;
  assert.ok(0.75 - span.start / RATE >= 0.1, 'at least the pad ahead of the speech');
  assert.ok(span.end / RATE - 1.25 >= 0.1, 'at least the pad after it');
});

test('a quiet talker far from the microphone is still speech', () => {
  // The absolute gate alone would discard this; the relative one keeps it.
  const span = speechSpan(utterance(2, 0.75, 0.5, 0.06), RATE);
  assert.notEqual(span, null);
});
