/**
 * The events explorer.
 *
 * Reads the same ring buffer the rail does — one subscription, two views.
 *
 * The type picker and the token toggle are **sent to LewLM**, which narrows the
 * stream before an event is queued for this connection. That is the difference
 * between not displaying an event and not receiving it, and it matters at
 * exactly one event per generated token.
 *
 * The filter names what it wants and has no negation, so "hide token.delta" is
 * every other type — enumerated from `EVENT_TYPES`, which is generated from the
 * contract, so it is exact today and stays exact when LewLM adds a type.
 *
 * The free-text box stays client-side. It is a substring search across three
 * fields at once, which is not something the server offers or should.
 */

import { useEffect, useMemo, useState } from 'react';

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
  const setFilter = useEvents((state) => state.setFilter);

  const [type, setType] = useState('');
  const [needle, setNeedle] = useState('');
  const [hideTokens, setHideTokens] = useState(true);
  const [selected, setSelected] = useState<EventRecord | null>(null);

  // What arrives is what was asked for, so the only work left here is the
  // substring search. Records that predate a narrowing stay in the ring, which
  // is why the type check below is not redundant.
  const filtered = useMemo(
    () =>
      events.filter((record) => {
        if (record.gap) return true;
        const { event } = record;
        if (hideTokens && event.type.startsWith('token.')) return false;
        if (type && event.type !== type) return false;
        if (!needle) return true;
        const hay = `${event.type} ${event.request_id ?? ''} ${event.model_id ?? ''} ${event.correlation_id ?? ''}`;
        return hay.toLowerCase().includes(needle.toLowerCase());
      }),
    [events, type, needle, hideTokens],
  );

  /**
   * This screen owns the subscription's filter while it is open, and gives it
   * back when it closes.
   *
   * The two readers of the stream want different things: the telemetry rail
   * exists to watch an unfiltered stream go past, and this explorer opens with
   * `token.delta` hidden. Narrowing only matters while someone is looking at
   * this screen, so that is exactly how long it lasts — rather than a filter
   * that silently outlives the tab that set it.
   */
  useEffect(() => {
    setFilter(
      type
        ? { types: [type] }
        : hideTokens
          ? { types: EVENT_TYPES.filter((name) => !name.startsWith('token.')) }
          : {},
    );
    return () => setFilter({});
  }, [type, hideTokens, setFilter]);

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
        hint={
          `${filtered.length} shown · ${received} received` +
          `${dropped > 0 ? ` · ${dropped} aged out` : ''}` +
          `${type || hideTokens ? ' · narrowed at the server' : ''}`
        }
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
