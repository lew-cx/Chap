# Modules

How something that is not LewLM attaches to Chap.

Chap is a client for LewLM. That is the one thing about it that is not
negotiable — delete LewLM and there is no application left. Everything else is a
module: the retrieval store, the document service, whatever comes next. A
consumer who wants a chat and operations GUI and nothing else deletes two
directories and four lines and still has a working, coherent product.

That claim is checked, not asserted. `npm run module:check` fails the build if a
core file learns a module's name, in the same spirit as `skin:check` — see
`docs/skins.md` for the original of this idea and why a rule nobody enforces
stops being true within two commits.

---

## What a module is

A directory under `packages/`, with two entry points:

```
packages/module-docktizo/
  package.json          exports: { "./server", "./web" };  chap.budget
  src/server.ts         (context) => ServerModule
  src/web.tsx           WebModule
  src/client.ts         its own typed client
  src/ui/*.tsx          its screens
  src/generated/*       DO NOT EDIT
  proof.ts              its own probes, outside src/
docs/docktizo-gaps.md   what its upstream is missing, and what that costs
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

Two lines. One in `server/src/modules.ts`:

```ts
import { docktizo } from '@chap/module-docktizo/server';
export const MODULES: ServerModuleFactory[] = [collectionsModule, docktizo];
```

and one in `web/src/modules.ts`:

```ts
import { docktizo } from '@chap/module-docktizo/web';
export const MODULES: WebModule[] = [collections, docktizo];
```

Then `npm install`, which creates the workspace symlink. There is no third place.
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
holds DocKtizo's bearer, an artifact download is `<a href="/dk/v1/artifacts/…"
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

The payoff is concrete. A DocKtizo with authentication switched off answers its own
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
Lab tab. `module-docktizo` fronts a different service with sources, generations
and artifacts, and takes a nav entry of its own.

A module reuses core's `Screen` frame rather than inventing a second one. It
should look like the application it was installed into.

## Every module carries its own budget

`npm run loc:budget` reads `chap.budget` from each package's own `package.json`
and counts its `.ts` and `.tsx`, excluding `generated/` and tests. The script
names no package.

```
    646  lewlm              (budget 900)
    478  module-collections (budget 500)
    788  module-docktizo    (budget 850)
   1912  everything Chap hand-wrote
```

The split is the interesting part. `@chap/lewlm` is 646 lines for 56 LewLM
routes; `module-docktizo` is 788 for 13 of DocKtizo's 21. DocKtizo is not harder —
it publishes no integration bundle, no event stream and no capability vocabulary
Chap can join against, and each of those absences is a numbered entry in
`docs/docktizo-gaps.md` with the lines it costs written next to it.

That is what a gaps document is for, and it is why a module owns one rather than
filing against a shared list. Delete the module and its gaps go with it.

## Adding a module

1. `packages/module-<id>/package.json` with the two exports and a `chap.budget`.
2. `src/server.ts` exporting a factory. Give it a `probe` if it fronts something
   that can be down or misconfigured; leave it off if the only honest answer is
   "yes".
3. Register the server half, `npm install`, and check `/_chap/health`. Do this
   before writing any UI — it is the cheapest possible proof the seam works.
4. Generate types from the upstream's contract rather than hand-writing them.
   `scripts/gen-types.mjs --target <name>` is the pattern; vendor the spec so a
   machine without the upstream checked out can still build.
5. `src/web.tsx` and the screens.
6. `proof.ts` and `docs/<id>-gaps.md`, if the upstream has gaps worth arguing
   about. It will.
7. Set `chap.budget` from the measured number. If it is high, the gaps document
   should already explain why.
