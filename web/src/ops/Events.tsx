/**
 * The events explorer.
 *
 * Reads the same ring buffer the rail does — one subscription, two views. Every
 * filter here is client-side because LewLM accepts no query parameters on
 * `/v1/events` (docs/lewlm-gaps.md#g13); the type list is generated from the
 * contract, so a new event type in LewLM appears in this filter without a Chap
 * change.
 */

import { useMemo, useState } from 'react';

import { EVENT_TYPES } from '@chap/lewlm';

import { EventRow, eventTone } from '../components/EventRow.tsx';
import { Json } from '../components/Json.tsx';
import { Section } from '../components/Screen.tsx';
import { VirtualList } from '../components/VirtualList.tsx';
import { useEvents, type EventRecord } from '../store/events.ts';

export function Events() {
  const events = useEvents((state) => state.events);
  const paused = useEvents((state) => state.paused);
  const setPaused = useEvents((state) => state.setPaused);
  const clear = useEvents((state) => state.clear);
  const received = useEvents((state) => state.received);
  const dropped = useEvents((state) => state.dropped);

  const [type, setType] = useState('');
  const [needle, setNeedle] = useState('');
  const [hideTokens, setHideTokens] = useState(true);
  const [selected, setSelected] = useState<EventRecord | null>(null);

  const filtered = useMemo(
    () =>
      events.filter((record) => {
        if (record.gap) return true;
        const { event } = record;
        if (hideTokens && event.type.startsWith('token.')) return false;
        if (type && event.type !== type) return false;
        if (needle) {
          const hay = `${event.type} ${event.request_id ?? ''} ${event.model_id ?? ''} ${event.correlation_id ?? ''}`;
          if (!hay.toLowerCase().includes(needle.toLowerCase())) return false;
        }
        return true;
      }),
    [events, type, needle, hideTokens],
  );

  /** Types actually seen, so the picker reflects this host rather than the spec. */
  const seen = useMemo(() => {
    const counts = new Map<string, number>();
    for (const record of events) {
      if (!record.gap) counts.set(record.event.type, (counts.get(record.event.type) ?? 0) + 1);
    }
    return counts;
  }, [events]);

  const exportNdjson = () => {
    const body = filtered.map((record) => JSON.stringify(record.event)).join('\n');
    const url = URL.createObjectURL(new Blob([body], { type: 'application/x-ndjson' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `chap-events-${Date.now()}.ndjson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Section
        title="filters"
        hint={`${filtered.length} shown · ${received} received${dropped > 0 ? ` · ${dropped} aged out` : ''}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <select className="field text-xs" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">all types ({seen.size} seen)</option>
            {/* Seen first with counts, then the rest of the contract's 55. */}
            {[...seen.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([name, count]) => (
                <option key={name} value={name}>
                  {name} ({count})
                </option>
              ))}
            <option disabled>──────────</option>
            {EVENT_TYPES.filter((name) => !seen.has(name)).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <input
            className="field w-56 text-xs"
            placeholder="request id, model, correlation"
            value={needle}
            onChange={(event) => setNeedle(event.target.value)}
          />

          <button type="button" className="chip" aria-pressed={hideTokens} onClick={() => setHideTokens(!hideTokens)}>
            hide token.delta
          </button>
          <button type="button" className="chip" aria-pressed={paused} onClick={() => setPaused(!paused)}>
            {paused ? 'paused' : 'live'}
          </button>
          <button type="button" className="chip" onClick={clear}>
            clear
          </button>
          <button type="button" className="chip" onClick={exportNdjson}>
            export ndjson
          </button>
        </div>
      </Section>

      <div className="flex min-h-0 flex-1 gap-4" style={{ height: '28rem' }}>
        <div className="panel-bare min-w-0 flex-1 py-1">
          <VirtualList items={filtered} rowHeight={20} follow={!paused} className="h-full">
            {(record) => (
              <EventRow
                record={record}
                selected={selected?.seq === record.seq}
                onSelect={() => setSelected(record)}
              />
            )}
          </VirtualList>
        </div>

        <div className="scroll-thin w-96 shrink-0 overflow-y-auto">
          {selected ? (
            <>
              <h3 className="micro-label mb-2" style={{ color: eventTone(selected.event.type) }}>
                {selected.event.type}
              </h3>
              <Json value={selected.event} maxHeight="24rem" />
            </>
          ) : (
            <p className="micro-label">select an event to inspect its payload</p>
          )}
        </div>
      </div>
    </>
  );
}
