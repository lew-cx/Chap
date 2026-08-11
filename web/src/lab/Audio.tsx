/**
 * Transcription and speech.
 *
 * Neither surface picks a model any more. `capability_availability[]` names
 * exactly one model per audio capability now that discovery records an audio
 * role per manifest, so `useCapability` answers the question the model select
 * used to ask by hand (G25, closed).
 *
 * Transcription is multipart, and the field names come from the contract rather
 * than from memory: `AudioTranscriptionMultipartRequest` is a named component
 * now, so `file`, `model`, `language` and `prompt` are generated (G26, closed).
 *
 * Speech returns base64 that Chap plays without writing a file anywhere.
 */

import { useState } from 'react';

import { buildMultipart, type AudioSpeechResponse, type AudioTranscriptionResponse } from '@chap/lewlm';

import { CapabilityNotice } from '../components/CapabilityNotice.tsx';
import { Disclosure } from '../components/Disclosure.tsx';
import { Labelled, Stat } from '../components/Field.tsx';
import { Json } from '../components/Json.tsx';
import { Section } from '../components/Screen.tsx';
import { lewlm } from '../lib/client.ts';
import { useCapability } from '../lib/useCapability.ts';
import { useVoices } from '../lib/useVoices.ts';
import { Table } from '../components/Table.tsx';

/** LewLM's `AudioSpeechCreateRequest.format` defaults to `wav` and is a bare string. */
const FORMATS = ['wav', 'mp3', 'flac', 'ogg'] as const;

function seconds(value: number | null | undefined): string {
  return value != null ? `${value.toFixed(2)}s` : '—';
}

export function Audio() {
  const [transcript, setTranscript] = useState<AudioTranscriptionResponse | null>(null);
  const [speech, setSpeech] = useState<AudioSpeechResponse | null>(null);
  const [text, setText] = useState('The bell tower in Harkwell is forty-one metres tall.');
  const [language, setLanguage] = useState('en');
  const [prompt, setPrompt] = useState('');
  const [voice, setVoice] = useState('');
  const [format, setFormat] = useState<string>(FORMATS[0]);
  const [busy, setBusy] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const transcription_capability = useCapability('audio_transcription');
  const speech_capability = useCapability('audio_speech');
  const voices = useVoices(speech_capability.models[0] ?? null);

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
        <CapabilityNotice title="no runnable audio_transcription model on this host" status={transcription_capability} />
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <Labelled label="language">
              <input
                className="field"
                value={language}
                placeholder="auto"
                onChange={(event) => setLanguage(event.target.value)}
              />
            </Labelled>
            <Labelled label="prompt">
              <input
                className="field"
                value={prompt}
                placeholder="optional decoding hint"
                onChange={(event) => setPrompt(event.target.value)}
              />
            </Labelled>
          </div>

          <div>
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
                    if (language.trim()) form.set('language', language.trim());
                    if (prompt.trim()) form.set('prompt', prompt.trim());
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
          </div>

          {transcript && (
            <>
              <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="model" value={transcript.model} />
                <Stat label="language" value={transcript.language ?? '—'} />
                <Stat label="duration" value={seconds(transcript.duration_seconds)} />
                <Stat label="segments" value={transcript.segments?.length ?? 0} />
              </div>
              <p className="panel text-sm">{transcript.text}</p>
              {/* Segments carry the timing that makes a transcript navigable, and
                  they arrive typed — rendering only `.text` threw them away. */}
              {(transcript.segments?.length ?? 0) > 0 && (
                <Table
                  columns={[
                    {
                      key: 'start',
                      label: 'start',
                      numeric: true,
                      width: '5rem',
                      render: (segment) => seconds(segment.start_seconds),
                    },
                    {
                      key: 'end',
                      label: 'end',
                      numeric: true,
                      width: '5rem',
                      render: (segment) => seconds(segment.end_seconds),
                    },
                    { key: 'text', label: 'text', render: (segment) => segment.text },
                  ]}
                  rows={transcript.segments ?? []}
                />
              )}
              <Disclosure label="transcription detail">
                <Json value={transcript} maxHeight="18rem" />
              </Disclosure>
            </>
          )}
        </div>
      </Section>

      <Section title="speech">
        <CapabilityNotice title="no runnable audio_speech model on this host" status={speech_capability} />
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <Labelled label="voice">
              <VoiceSelect voices={voices} value={voice} onChange={setVoice} />
            </Labelled>
            <Labelled label="format">
              <select
                className="field"
                value={format}
                onChange={(event) => setFormat(event.target.value)}
              >
                {FORMATS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Labelled>
          </div>

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
                      json: {
                        input: text,
                        format,
                        ...(voice ? { voice } : {}),
                      },
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
              <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Stat label="media type" value={speech.media_type} />
                <Stat label="content type" value={speech.content_type} />
                <Stat label="voice" value={speech.voice ?? '—'} />
                <Stat label="duration" value={seconds(speech.duration_seconds)} />
                <Stat label="model" value={speech.model} />
              </div>
              {/* Base64 straight into an <audio> element — no temp file, no
                  object URL to leak. */}
              <audio
                controls
                src={`data:${speech.media_type};base64,${speech.audio_base64}`}
              />
              <Disclosure label="speech detail">
                <Json
                  value={{ ...speech, audio_base64: `<${speech.audio_base64.length} chars>` }}
                  maxHeight="18rem"
                />
              </Disclosure>
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

/**
 * A picker when LewLM can enumerate voices, a text box when it says it cannot.
 *
 * `enumerable` is the field that makes this safe to render as a select: a listed
 * voice is a guarantee, but an absent one is not a refusal — the backend can
 * still fetch a name on demand — so free entry stays available either way.
 */
function VoiceSelect({
  voices,
  value,
  onChange,
}: {
  voices: ReturnType<typeof useVoices>;
  value: string;
  onChange: (voice: string) => void;
}) {
  if (!voices.enumerable || voices.voices.length === 0) {
    return (
      <input
        className="field"
        value={value}
        placeholder={voices.reason ?? 'model default'}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
  return (
    <select className="field" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">model default</option>
      {voices.voices.map((entry) => (
        <option key={entry.voice_id} value={entry.voice_id} title={entry.source_path ?? undefined}>
          {entry.voice_id}
          {entry.source === 'backend_cache' ? ' (cache)' : ''}
        </option>
      ))}
    </select>
  );
}
