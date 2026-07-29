# Skins

Chap runs in two aesthetics from one component tree. Press `⌘\` to switch, or
append `?skin=showroom` to any URL.

- **Bench** — dense dark instrument panel, one amber accent, tabular numerals,
  a persistent telemetry rail, instant transitions. The working environment.
- **Showroom** — layered glass over a slow gradient, two-tone accent, spacious,
  everything eased. The display environment.

They are not two applications. `web/src/styles/tokens.css` defines about forty
`--skin-*` variables twice; `web/src/styles/recipes.css` turns them into a small
vocabulary of utilities; components use that vocabulary and never learn which
skin they are in.

## The one rule

> No file under `web/src/components`, `web/src/chat`, `web/src/ops` or
> `web/src/lab` may reference `useSkin`, `data-skin`, or the strings `bench` /
> `showroom`.

Exactly four files know a skin exists:

| File | Why |
|---|---|
| `web/src/store/skin.ts` | holds the state and applies `data-skin` |
| `web/src/shell/AppShell.tsx` | picks a shell |
| `web/src/shell/BenchShell.tsx` | three-column layout |
| `web/src/shell/ShowroomShell.tsx` | centred column, floating chrome |

`npm run skin:check` enforces this. A violation is a design bug, not a lint nit:
the first `skin === 'bench' ? … : …` in a component goes unnoticed, the second is
precedent, and within a month there are two applications to maintain.

## Why `@theme inline` is load-bearing

```css
@theme inline {
  --color-surface: var(--skin-surface);
  --spacing: var(--skin-step);
}
```

`@theme inline` makes Tailwind's generated utilities emit `var(--skin-surface)`
rather than resolving the value at build time. **Without `inline`, runtime skin
switching does not work at all** — every utility freezes to whichever skin
compiled first.

`--spacing` deserves special mention. Tailwind v4 derives its whole numeric
spacing scale from it: `p-4` is `calc(var(--spacing) * 4)`. Bench sets it to
`0.2rem` and Showroom to `0.3rem`, so one variable rescales every padding, gap,
margin and inset in the application. That single token does most of the work of
"dense instrument panel" versus "spacious showroom", with no component changes.

## What the tokens cover

Not just colour. Radius, the spacing scale, blur, shadow, border width, font
stack, numeral style (`tabular-nums slashed-zero` versus `proportional-nums`),
label casing and tracking, row height, grid-line visibility, message geometry,
gutter visibility, rail width, and motion.

Motion is worth calling out. Decorative animations declare:

```css
animation-duration: calc(24s * var(--skin-motion-scale));
```

Bench sets `--skin-motion-scale: 0`, which collapses the duration and disables
the animation — no JavaScript, no conditional, no `prefers-reduced-motion`
duplication (that media query simply sets the same variable to `0`).

## The proof that it works

`web/src/chat/Message.tsx` is byte-identical across skins. In Bench it renders as
a dense transcript row with a mono metadata gutter; in Showroom as a wide rounded
translucent bubble with no gutter. Same DOM, same JSX. The difference is entirely
`bubble` and `gutter` reading different token values.

If that file ever needs a skin conditional, something upstream is wrong.

## Where the skins genuinely differ

Three places, each with the cheapest mechanism that works:

| Difference | Mechanism |
|---|---|
| Bench has a persistent telemetry rail; Showroom does not | **CSS only** — `--skin-rail-display` and `--skin-rail-width`. The rail always mounts. |
| Bench is a three-column grid with a status strip; Showroom is a centred column with floating chrome and a drawer | **Two shells.** A real DOM difference; ~70 lines each. |
| One-offs | **`@custom-variant bench` / `showroom`.** Budget: under 25 app-wide, counted by `skin:check`. Currently 0. |

## Presentation differs; information does not

Showroom hides the **rail**, never the **data** — the same telemetry moves into a
drawer. If you ever find yourself removing a field because it looks cluttered in
Showroom, stop: you have started building a lesser second app and the token
architecture has failed. Make it smaller, move it, or put it behind a
disclosure — but do not drop it.

## The shell contract

Both shells give the `main` slot a **definite height** inside a flex column, and
the screen owns its internal scrolling. Screens may rely on that; a screen must
not assume the page scrolls.

This is not cosmetic. When Showroom's `main` was a scrolling document, the chat
screen's `h-full flex` collapsed, its transcript scroller had no height, and a
`scrollIntoView()` escaped upward and dragged the floating nav off the top of the
viewport.
