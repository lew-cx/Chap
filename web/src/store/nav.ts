/**
 * Which top-level screen is showing, and which tab inside it.
 *
 * A store rather than `useState` in App because a module may contribute a screen
 * and may need to switch to one — and a module cannot be handed a setter by a
 * core component that is not allowed to know the module exists. `screen` is a
 * plain string for the same reason: the union of valid values is not knowable at
 * compile time once modules can add to it.
 *
 * The route lives in the URL fragment as `#/screen/tab`. A bench whose selling
 * point is showing someone a specific behaviour has to survive a reload and fit
 * in a link — and `?skin=` already established that this app reads state from the
 * URL. The fragment rather than a path because chap-server serves one file and
 * has no route table; a fragment needs no server support at all.
 */

import { create } from 'zustand';

interface Route {
  screen: string;
  /** `null` means "whichever tab the screen defaults to". */
  tab: string | null;
}

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [screen = '', tab = ''] = raw.split('/');
  return {
    screen: screen ? decodeURIComponent(screen) : 'chat',
    tab: tab ? decodeURIComponent(tab) : null,
  };
}

function toHash(route: Route): string {
  const tail = route.tab ? `/${encodeURIComponent(route.tab)}` : '';
  return `#/${encodeURIComponent(route.screen)}${tail}`;
}

/**
 * Moving between screens is navigation and earns a history entry; changing tab
 * within a screen is refinement and replaces the current one. Otherwise Back
 * would walk a visitor through every tab they glanced at.
 */
function write(route: Route, push: boolean) {
  const hash = toHash(route);
  if (window.location.hash === hash) return;
  const url = `${window.location.pathname}${window.location.search}${hash}`;
  if (push) window.history.pushState(null, '', url);
  else window.history.replaceState(null, '', url);
}

interface NavState extends Route {
  go: (screen: string, tab?: string | null) => void;
  setTab: (tab: string) => void;
}

export const useNav = create<NavState>((set, get) => ({
  ...parseHash(),

  go: (screen, tab = null) => {
    const next = { screen, tab };
    write(next, true);
    set(next);
  },

  setTab: (tab) => {
    const next = { screen: get().screen, tab };
    write(next, false);
    set(next);
  },
}));

/** Back, forward, and a hash typed by hand all mean the same thing here. */
export function registerNavHistory(): () => void {
  const sync = () => useNav.setState(parseHash());
  window.addEventListener('popstate', sync);
  window.addEventListener('hashchange', sync);
  return () => {
    window.removeEventListener('popstate', sync);
    window.removeEventListener('hashchange', sync);
  };
}
