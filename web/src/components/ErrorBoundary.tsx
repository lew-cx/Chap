/**
 * A blast wall around one screen.
 *
 * React unmounts the entire tree when a render throws and nothing catches it —
 * so before this existed, one bad value anywhere left a blank page that only a
 * reload recovered from. A bench that goes dark tells you nothing about the
 * service it was pointed at, which is the opposite of the job.
 *
 * Keyed by the screen id: navigating away from a broken screen resets the
 * boundary, so a failure is confined in time as well as in space.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Named in the notice, so it is obvious which surface failed. */
  label?: string;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // The console is the only place the stack survives; the notice below is
    // deliberately short.
    console.error('Chap: render failed', error, info.componentStack);
  }

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="p-5">
        <div
          className="panel"
          style={{ borderColor: 'var(--skin-danger)' }}
          role="alert"
        >
          <div className="micro-label" style={{ color: 'var(--skin-danger)' }}>
            {this.props.label ? `${this.props.label} failed to render` : 'this screen failed to render'}
          </div>
          <p className="mt-1 text-sm">
            A bug in Chap, not a response from an upstream service. The rest of the app is still
            running.
          </p>
          <p className="numeric mt-2" style={{ color: 'var(--skin-muted)' }}>
            {error.message}
          </p>
          <button
            type="button"
            className="btn mt-3"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
