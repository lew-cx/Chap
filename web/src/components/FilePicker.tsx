/**
 * A file control a keyboard can reach.
 *
 * The obvious markup — a `<label>` wrapping a `display: none` input — is
 * unreachable twice over: a label is not focusable, and a display-none input is
 * out of the tab order. So the visible control is a real `<button>` and the
 * input is a hidden mechanism it clicks. Programmatic `.click()` still opens the
 * picker on a hidden input, so nothing is lost by keeping it out of the way.
 */

import { useRef, type ReactNode } from 'react';

export function FilePicker({
  label,
  onFiles,
  accept,
  multiple = false,
  className = 'btn',
  disabled = false,
}: {
  label: ReactNode;
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  /** Recipe to wear — `btn` reads as an action, `chip` as one control among many. */
  className?: string;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        className={className}
        disabled={disabled}
        onClick={() => input.current?.click()}
      >
        {label}
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const chosen = [...(event.target.files ?? [])];
          // Cleared before the handler runs, so re-picking the same file fires.
          event.target.value = '';
          if (chosen.length > 0) onFiles(chosen);
        }}
      />
    </>
  );
}
