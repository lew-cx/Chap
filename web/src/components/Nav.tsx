import type { ReactNode } from 'react';

interface NavItemProps {
  label: string;
  active: boolean;
  onSelect: () => void;
}

export function NavItem({ label, active, onSelect }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? 'page' : undefined}
      className="micro-label rounded-(--radius-control) px-3 py-1.5 text-left transition-colors duration-(--skin-fast)"
      style={active ? { background: 'var(--skin-accent-wash)', color: 'var(--skin-accent)' } : undefined}
    >
      {label}
    </button>
  );
}

export function StatusDot({ tone, children }: { tone: 'ok' | 'warn' | 'danger'; children: ReactNode }) {
  const color = { ok: 'var(--skin-ok)', warn: 'var(--skin-warn)', danger: 'var(--skin-danger)' }[tone];
  return (
    <span className="micro-label flex items-center gap-2">
      <span className="dot" style={{ color }} />
      {children}
    </span>
  );
}
