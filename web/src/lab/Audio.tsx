/**
 * Transcription and speech.
 *
 * Transcription is multipart — the same `payload_json` + file-part contract the
 * chat surface uses for attachments, so `buildMultipart` covers both. Speech
 * returns base64 that Chap plays without writing a file anywhere.
 */

import { useState } from 'react';

import { buildMultipart, type AudioSpeechResponse, type AudioTranscriptionResponse } from '@chap/lewlm';

import { Disclosure } from '../components/Disclosure.tsx';
import { Labelled, Stat } from '../components/Field.tsx';
import { Json } from '../components/Json.tsx';
import { Section } from '../components/Screen.tsx';
import { lewlm } from '../lib/client.ts';

export function Audio() {
  const [transcript, setTranscript] = useState<AudioTranscriptionResponse | null>(null);
  const [speech, setSpeech] = useState<AudioSpeechResponse | null>(null);
  const [text, setText] = useState('The bell tower in Harkwell is forty-one metres tall.');
  const [busy, setBusy] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const act = async (label: string, work: () => Promise<unknown>) => {
    setBusy(label);
    setFailure(null);
    try {
      await work();
    } catch (cause) {
      setFailure(`${label}: ${cause instanceof Error ? cause.message : String(cause)}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Section title="transcription">
        <label className="btn inline-block cursor-pointer">
          upload audio
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (!file) return;
              void act('transcribe', async () => {
                const form = buildMultipart([
                  { uploadName: 'file', file, fileName: file.name },
                ]);
                form.set('payload_json', JSON.stringify({}));
                setTranscript(
                  await lewlm.request<AudioTranscriptionResponse>(
                    'POST',
                    '/v1/audio/transcriptions',
                    { form },
                  ),
                );
              });
            }}
          />
        </label>

        {transcript && (
          <div className="mt-2">
            <p className="panel text-sm">{transcript.text}</p>
            <div className="mt-2">
              <Disclosure label="transcription detail">
                <Json value={transcript} maxHeight="18rem" />
              </Disclosure>
            </div>
          </div>
        )}
      </Section>

      <Section title="speech">
        <div className="flex flex-col gap-3">
          <Labelled label="text">
            <textarea
              className="field scroll-thin min-h-20 resize-y"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </Labelled>
          <div>
            <button
              type="button"
              className="btn"
              disabled={busy != null || !text.trim()}
              onClick={() =>
                void act('speak', async () =>
                  setSpeech(
                    await lewlm.request<AudioSpeechResponse>('POST', '/v1/audio/speech', {
                      json: { input: text },
                    }),
                  ),
                )
              }
            >
              synthesize
            </button>
          </div>

          {speech && (
            <>
              <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="media type" value={speech.media_type} />
                <Stat label="content type" value={speech.content_type} />
                <Stat
                  label="duration"
                  value={speech.duration_seconds != null ? `${speech.duration_seconds.toFixed(1)}s` : '—'}
                />
                <Stat label="model" value={speech.model} />
              </div>
              {/* Base64 straight into an <audio> element — no temp file, no
                  object URL to leak. */}
              <audio
                controls
                src={`data:${speech.media_type};base64,${speech.audio_base64}`}
              />
            </>
          )}
        </div>
      </Section>

      {busy && <p className="micro-label">{busy}…</p>}
      {failure && (
        <p className="numeric" style={{ color: 'var(--skin-danger)' }}>
          {failure}
        </p>
      )}
    </>
  );
}
