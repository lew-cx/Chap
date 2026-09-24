/**
 * Settings for speaking replies aloud.
 *
 * Both of the workarounds this panel used to carry are gone. The model select
 * went when `capability_availability[]` started naming the synthesis model and
 * only that model (G25), and the voice text box became a real picker when
 * `GET /v1/audio/voices` arrived (G27). What is left is one control and a
 * readout — the panel now shows LewLM's answers rather than apologising for the
 * lack of them.
 */

import { CapabilityNotice } from '../components/CapabilityNotice.tsx';
import { Labelled, Stat } from '../components/Field.tsx';
import type { SpeechController } from '../lib/useSpeech.ts';

export function SpeechPanel({ speech }: { speech: SpeechController }) {
  const { status, voices } = speech;

  return (
    <div className="flex flex-col gap-3">
      <CapabilityNotice title="no runnable audio_speech model on this host" status={speech.capability} />

      <div className="flex flex-wrap items-end gap-3">
        <Labelled label="voice">
          {/* A listed voice is a guarantee; an absent one is not a refusal, since
              the backend can still fetch a name on demand. So the picker appears
              only when LewLM says it could enumerate. */}
          {voices.enumerable && voices.voices.length > 0 ? (
            <select
              className="field"
              value={speech.voice}
              onChange={(event) => speech.setVoice(event.target.value)}
            >
              <option value="">model default</option>
              {voices.voices.map((entry) => (
                <option
                  key={entry.voice_id}
                  value={entry.voice_id}
                  title={entry.source_path ?? undefined}
                >
                  {entry.voice_id}
                  {entry.source === 'backend_cache' ? ' (cache)' : ''}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="field"
              value={speech.voice}
              placeholder={voices.reason ?? 'model default'}
              onChange={(event) => speech.setVoice(event.target.value)}
            />
          )}
        </Labelled>

        <Stat label="synthesis model" value={speech.model || '—'} />
        <Stat
          label="voices"
          value={voices.loading ? '…' : `${voices.voices.length}${voices.enumerable ? '' : ' (not enumerable)'}`}
        />
        <Stat
          label="formats"
          value={voices.formats.length ? voices.formats.map((entry) => entry.format).join(', ') : voices.defaultFormat}
        />
      </div>

      <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="spoken" value={status.spoken} />
        <Stat label="queued" value={status.queued} />
        <Stat label="synthesizing" value={status.synthesizing ? 'yes' : 'no'} />
        <Stat label="state" value={speech.armed ? (status.finished ? 'idle' : 'speaking') : 'off'} />
      </div>

      {speech.error && (
        <p className="numeric" style={{ color: 'var(--skin-danger)' }}>
          {speech.error}
        </p>
      )}
    </div>
  );
}
