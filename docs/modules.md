# Modules

How something that is not LewLM attaches to Chap.

Chap is a client for LewLM. That is the one thing about it that is not
negotiable — delete LewLM and there is no application left. Everything else is a
module, and there are two kinds:

| kind | what it is | on by default | example |
| --- | --- | --- | --- |
| **built-in** | a Chap feature built on LewLM alone | yes | `module-collections` — a retrieval store over LewLM's embeddings and reranking |
| **companion** | an adapter for a *different product* that runs on LewLM, so Chap can test it too | no — `CHAP_COMPANIONS=<id>` | `module-docktizo` — [DocKtizo](../packages/module-docktizo/README.md), an experimental document-generation service |

The split exists so that Chap never depends on anything but LewLM. A companion's
upstream may be unfinished, private, or simply not running, and none of that can
be allowed to break the build, the dev server, `npm run proof`, or the gaps
screen. With no companions switched on, a checkout behaves exactly as if they
had been deleted. A consumer who wants a chat and operations GUI and nothing else
can delete every module directory and the registry lines, and still have a
working, coherent product.

That claim is checked, not asserted. `npm run module:check` fails the build if a
core file learns a module's name, in the same spirit as `skin:check` — see
`docs/skins.md` for the original of this idea and why a rule nobody enforces
stops being true within two commits.

---

## What a module is

A directory under `packages/`, with two entry points:

```
packages/module-docktizo/
  package.json          exports: { "./server", "./web" };  chap.budget (×2)
  README.md             what the upstream is, and how to turn the module on
  src/server.ts         (context) => ServerModule
  src/web.tsx           WebModule
  src/client.ts         its own typed client
  src/ui/*.tsx          its screens
  src/generated/*       DO NOT EDIT
  proof.ts              its own probes, outside src/
  GAPS.md               what its upstream is missing, and what that costs
```

The two subpath exports keep the halves apart: the server process never loads
React and the browser bundle never loads Hono. `module-check` walks the imports
out from each entry point and fails if either half reaches the other's world, so
the split is a fact rather than an intention.

It is **not** a redistributable package. A module's UI imports Chap's own
components through `@/components/…`, which makes `web` and the module mutually
dependent at the package level. That is a deliberate trade: extracting a `@chap/ui`
package to make the graph acyclic would be real churn with no user-visible
benefit. The direction is enforced instead — a module may reach `@/components`,
`@/lib` and `@/store` and nothing else, and it may never reach into core with a
relative path.

## Registering one

Two lines, one in each registry. A built-in goes in `MODULES`; a companion goes
in `COMPANIONS`, keyed by the id `CHAP_COMPANIONS` will use. In
`server/src/modules.ts`:

```ts
export const MODULES: ServerModuleFactory[] = [collectionsModule];
export const COMPANIONS: Readonly<Record<string, ServerModuleFactory>> = { docktizo };
```

and in `web/src/modules.ts`:

```ts
export const MODULES: WebModule[] = [collections];
export const COMPANIONS: WebModule[] = [docktizo];
```

Then `npm install`, which creates the workspace symlink. There is no third place.

A companion that is not named in `CHAP_COMPANIONS` is never built on the server.
Its routes do not exist, it is absent from `/_chap/health`, and the browser hides
its screens and tabs. Settings → modules lists it as available and says how to
turn it on. Naming an unregistered id is refused at startup, so a typo cannot
look like an upstream being down. A companion's proof is declared in the root
`package.json` as `proof:<id>`, and `npm run gen:gaps` runs it only when that
companion is switched on.
Removing a module is those two lines and `rm -rf`; the `packages/*` workspace glob
and the wildcard `paths`/alias entries name no module and never need editing.

Two registries rather than one because a single file importing `./web.tsx` would
drag JSX into the server's TypeScript program.

## The server half

```ts
interface ServerModule {
  id: string;
  label: string;
  prefix: string;                                 // one path, no exceptions
  mount?: Hono;                                   // routes it implements
  proxy?: { baseUrl, headers };                   // an upstream it fronts
  env?: readonly string[];                        // reported by /_chap/health
  probe?: () => Promise<{ ready, reason }>;
}
```

A module gets a `ModuleContext` — `env`, a `dataDir`, and LewLM — rather than
Chap's `ChapConfig`. It does not import core's types at all; the shape is checked
structurally where it is registered, which is the only place a mismatch matters.

`proxy.headers` is how a credential reaches an upstream without reaching the
browser. It is worth noticing what this buys beyond secrecy: because the proxy
holds the DocKtizo companion's bearer, an artifact download is `<a href="/dk/v1/artifacts/…"
download>` — no blob, no `Content-Disposition` parsing, no token in the bundle.

## Readiness is discovered, not declared

`/_chap/health` reports every module's `probe()` result, and
`web/src/lib/useModules.ts` reads it. This is `useCapability` one scale up: there
it is "can any model on this host embed", here it is "can this module reach what
it fronts, and is it configured". Both answers come from the backend and both
carry the upstream's own words.

`components/ModuleGate.tsx` wraps every module contribution. An unready module
still appears in the nav and renders a `CapabilityNotice` inside — hiding it would
turn an environment fact into a missing feature.

The payoff is concrete. A DocKtizo (the companion) with authentication switched off answers its own
`/healthz` with `ok`, because that route checks nothing. Chap says:

> **DocKtizo is not available** — authentication is not configured

which is DocKtizo's sentence, not Chap's guess.

## The web half

```ts
interface WebModule {
  id: string;
  label: string;
  screen?: ComponentType;                                 // a top-level nav entry
  tabs?: readonly (ScreenTab & { screen: HostScreen })[]; // tabs into a core screen
}
```

Both exist because modules genuinely differ in size. `module-collections` is one
Lab tab. `module-docktizo` fronts a different service — sources, generations,
documents, review, revisions, migrations and artifacts — and takes a nav entry of
its own with five tabs inside it.

A module reuses core's `Screen` frame rather than inventing a second one. It
should look like the application it was installed into.

## Every module carries two budgets

`npm run loc:budget` reads `chap.budget` from each package's own `package.json`
and counts its `.ts` and `.tsx`, excluding `generated/` and tests. The script
names no package.

```json
"chap": { "budget": { "integration": 340, "ui": 1400 } }
```

`integration` is what it costs to **talk** to the upstream — the client, the
store, the server half, the types. `ui` is what it costs to **show** it. The
split is by extension: a file that renders is `.tsx`, a file that talks is `.ts`.
Nothing to keep tidy, and JSX cannot hide on the wrong side of it.

```
                       integration     ui      budgets
    lewlm                      685      —      900 / none
    module-collections         268     210     300 / 260
    module-docktizo            288    1221     340 / 1400
```

They were one number until it started saying the wrong thing. DocKtizo's
integration is 288 lines against module-collections' 268 — nearly the same —
while its UI is six times the size, because it reaches into review, revision and
migration where collections reaches into one search box. Summed, DocKtizo read as
three times more expensive to integrate, which is not true and was never the
claim. `integration` is the line that carries the argument; it should barely move
when a screen is added, and it should rise when a thin contract forces a
workaround. `ui` is product surface, and raising it is a scope decision rather
than a concession.

A package may omit `ui` — `@chap/lewlm` has no screens — but then it may have no
UI at all, and that is checked. A *module* always has one, because `./web` is
half of what a module is, so `module-check` requires both.

The split is the interesting part, and watching it move is the point. When
`module-docktizo` was written its upstream published no committed spec, no event
stream and no capability vocabulary, and the module carried a hand-maintained
copy of DocKtizo's state machine to make up for it. All six gaps closed within a
day. The state machine is generated now, the poll loop is a stream read with
`readSSE` from `@chap/lewlm`, and the module is **larger** — because each fix
made a feature cheap that had not been possible at all.

It has since roughly doubled again, 950 → ~1,500, and again no gap forced it.
DocKtizo grew a document lifecycle — review, revisions, and explicit
workflow-version migration — and the module's covered surface went from 12 of its
operations to 23 of 31 — 78 lines per operation before, 66 after. Nearly all of
that growth landed in `ui`; `integration` barely moved, which is exactly the
distinction the two budgets exist to draw. A budget that rose because the module
now fronts twice as much upstream reads very differently from one that rose
because the upstream made it work twice as hard.

A budget that only ever goes down would be measuring effort, not contract. This
one measures both, which is why raising it needs an argument recorded in a gaps
document, and why `packages/module-docktizo/GAPS.md` ends with the argument for the last
raise.

That is what a gaps document is for, and it is why a module owns one rather than
filing against a shared list. Delete the module and its gaps go with it.

## Adding a module

1. Decide which kind it is. If it only needs LewLM, it is built-in. If it fronts
   another service, it is a companion.
2. `packages/module-<id>/package.json` with the two exports and a `chap.budget`
   naming both an `integration` and a `ui` figure.
3. `src/server.ts` exporting a factory. Give it a `probe` if it fronts something
   that can be down or misconfigured; leave it off if the only honest answer is
   "yes".
4. Register the server half, `npm install`, and check `/_chap/health`. Do this
   before writing any UI — it is the cheapest possible proof the seam works.
5. Generate types from the upstream's contract rather than hand-writing them.
   `scripts/gen-types.mjs --target <name>` is the pattern; vendor the spec so a
   machine without the upstream checked out can still build.
6. `src/web.tsx` and the screens.
7. `proof.ts` (declared as `proof:<id>` in the root `package.json`) and a
   `GAPS.md` in the package, if the upstream has gaps worth arguing about. It will.
   A companion also gets a `README.md` that says, first, what the upstream *is*
   — a reader of Chap should never have to guess.
8. Set both budgets from the measured numbers. If `integration` is high, the gaps
   document should already explain why; `ui` only has to be a size the screen
   earns.
