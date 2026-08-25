/**
 * How to *name* a modifier key on the machine that is reading the screen.
 *
 * Every shortcut Chap binds already accepts Cmd or Ctrl, so nothing is broken on
 * a non-Apple keyboard — but a label is a claim, and "⌘\" shown to someone on
 * Linux names a key their keyboard does not have. The showroom is watched more
 * often than it is driven, so the wrong glyph is read far more than it is typed.
 *
 * `userAgentData` is the supported question; `platform` is the deprecated one
 * every browser still answers. The fallback is Ctrl because it is the majority
 * and the harmless guess: an Apple user shown "Ctrl+\" can still press ⌘.
 */
const descriptor =
  typeof navigator === 'undefined'
    ? ''
    : ((navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
        ?.platform ??
      navigator.platform ??
      navigator.userAgent ??
      '');

export const IS_APPLE = /mac|iphone|ipad|ipod/i.test(descriptor);

/** Prefix for a chord, already carrying its own separator: `⌘\` or `Ctrl+\`. */
export const MOD_LABEL = IS_APPLE ? '⌘' : 'Ctrl+';
