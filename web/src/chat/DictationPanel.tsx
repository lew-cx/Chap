/**
 * Settings and evidence for talking to the composer.
 *
 * The transcript is shown after it has already gone into the prompt, and the
 * segments with it. A bench should be able to see what the model actually heard
 * rather than only what ended up in the box — a wrong word in the prompt and a
 * wrong word in the transcript are different faults with different owners.
 */

import { CapabilityNotice } from '../components/CapabilityNotice.tsx';
import { Labelled, Stat } from '../components/Field.tsx';
import { Recorder } from '../lib/dictation.ts';
import type { DictationController } from '../lib/useDictation.ts';

function seconds(value: number | null | undefined): string {
  return value != null ? `${value.toFixed(2)}s` : '—';
}

export function DictationPanel({ dictation }: { dictation: DictationController }) {
  const { last } = dictation;

  return (
    <div className="flex flex-col gap-3">
      <CapabilityNotice
        title="no runnable audio_transcription model on this host"
        status={dictation.capability}
      />
      {!Recorder.supported && (
        <p className="numeric" style={{ color: 'var(--skin-danger)' }}>
          this browser exposes no microphone capture — hold to talk is unavailable
        </p>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <Labelled label="language">
          {/* LewLM treats this as a decoding hint; empty means let it detect. */}
          <input
            className="field"
            value={dictation.language}
            placeholder="auto"
            onChange={(event) => dictation.setLanguage(event.target.value)}
          />
        </Labelled>
        <Stat label="transcription model" value={dictation.model || '—'} />
        <Stat label="state" value={dictation.state} />
      </div>

      <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* held vs sent is the trimmed silence. A large gap is the microphone
            hearing the room rather than the person, and the room is what a
            speech model turns into a caption-corpus phrase. */}
        <Stat label="held" value={seconds(dictation.lastHeldSeconds)} />
        <Stat label="sent" value={seconds(dictation.lastSeconds)} />
        <Stat label="language" value={last?.language ?? '—'} />
        <Stat label="segments" value={last?.segments?.length ?? 0} />
      </div>

      {last && <p className="panel text-sm">{last.text}</p>}

      {dictation.error && (
        <p className="numeric" style={{ color: 'var(--skin-danger)' }}>
          {dictation.error}
        </p>
      )}
    </div>
  );
}
