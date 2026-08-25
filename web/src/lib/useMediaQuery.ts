/**
 * A media query as React state.
 *
 * Layout that has to *restructure* — a persistent column becoming an overlay —
 * cannot be done with a class alone, and the shells are the only place in Chap
 * that restructures. Everything else responds with Tailwind variants.
 */

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    // Re-read on subscribe: the viewport may have changed between the initial
    // state and this effect.
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}
