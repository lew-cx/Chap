/**
 * A destructive control that takes two presses.
 *
 * Dropping a collection, deleting a session and unloading a model are all
 * irreversible and all one click away from a hover. A modal would be heavier
 * than the action deserves; arming the button in place says the same thing in
 * the same spot, and disarms itself if you walk away from it.
 */

import { useEffect, useRef, useState } from 'react';

/** Long enough to read the second label, short enough not to stay armed. */
const DISARM_MS = 4000;

export function ConfirmButton({
  label,
  confirmLabel = 'sure?',
  onConfirm,
  className = 'chip',
  disabled = false,
  title,
}: {
  label: string;
  /** What the armed button says. Should name the consequence, not repeat the verb. */
  confirmLabel?: string;
  onConfirm: () => void;
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!armed) return;
    timer.current = setTimeout(() => setArmed(false), DISARM_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [armed]);

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      title={title}
      style={armed ? { borderColor: 'var(--skin-danger)', color: 'var(--skin-danger)' } : undefined}
      onBlur={() => setArmed(false)}
      onClick={() => {
        if (!armed) {
          setArmed(true);
          return;
        }
        setArmed(false);
        onConfirm();
      }}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}
