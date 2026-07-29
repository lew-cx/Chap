/**
 * One event, as a single dense line.
 *
 * Shared by the telemetry rail and the events explorer so both read identically
 * — the explorer adds filters and a payload inspector around this, not a second
 * rendering of the same data.
 */

import type { EventRecord } from '../store/events.ts';

/** Colour by outcome, not by subsystem. Failures must be findable at a glance. */
export function eventTone(type: string): string {
  if (type.endsWith('.failed') || type.includes('error')) return 'var(--skin-danger)';
  if (type.endsWith('.completed') || type.endsWith('.loaded')) return 'var(--skin-ok)';
  if (type.startsWith('token.')) return 'var(--skin-faint)';
  return 'var(--skin-muted)';
}

export function EventRow({
  record,
  onSelect,
  selected,
  compact,
}: {
  record: EventRecord;
  onSelect?: () => void;
  selected?: boolean;
  /** For the rail, which is too narrow for anything but time and type. */
  compact?: boolean;
}) {
  const { event } = record;

  if (record.gap) {
    // LewLM cannot replay (docs/lewlm-gaps.md#g13), so a reconnect leaves a real
    // hole in the timeline. Drawing it is the honest thing to do.
    return (
      <div
        className="numeric flex items-center gap-2 px-2"
        style={{ color: 'var(--skin-warn)' }}
        title={String(event.payload?.detail ?? '')}
      >
        <span>⎯⎯</span>
        <span>reconnected — events in this window were lost</span>
        <span className="flex-1 border-t" style={{ borderColor: 'var(--skin-warn)' }} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="numeric flex w-full items-center gap-2 px-2 text-left"
      style={selected ? { background: 'var(--skin-accent-wash)' } : undefined}
      title={event.request_id ?? undefined}
    >
      <span style={{ color: 'var(--skin-faint)' }}>
        {(event.created_at ?? '').slice(compact ? 14 : 11, 19) || '--:--'}
      </span>
      <span className="min-w-0 flex-1 truncate" style={{ color: eventTone(event.type) }}>
        {event.type}
      </span>
      {!compact && event.model_id && (
        <span className="truncate" style={{ color: 'var(--skin-faint)', maxWidth: '12rem' }}>
          {event.model_id}
        </span>
      )}
      {event.request_id && (
        <span style={{ color: 'var(--skin-faint)' }}>
          {event.request_id.slice(0, compact ? 4 : 6)}
        </span>
      )}
    </button>
  );
}
