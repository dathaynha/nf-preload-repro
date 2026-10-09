# Native Federation: lazy route breaks with SSR and native import maps

Minimal reproduction for a Native Federation host that uses SSR and native
import maps (`shimMode: false`).

A server-rendered page carries `<link rel="modulepreload">` hints for the
lazy chunks of its route. The browser fetches those chunks before
`initFederation` has added the import map, fails to resolve the bare
specifier `@angular/core`, and caches the failure. The lazy route then never
loads on the client, and the server-rendered content disappears on hydration.

## Versions

| Package | Version |
|---|---|
| `@angular/core`, `@angular/build`, `@angular/ssr` | 22.2.2 |
| `@angular-architects/native-federation` | 22.2.2 |
| `@softarc/native-federation-orchestrator` | 4.7.0 |
| `es-module-shims` | 2.8.4 |
| Node | 24.21.0 |
| Chromium (Playwright 1.62) | headless |

## What was changed from a fresh project

1. `ng new nf-preload-repro --ssr --zoneless`
2. `ng add @angular-architects/native-federation --type dynamic-host`
3. Native import maps, set in both places they must agree:
   - `esmsInitOptions: { "shimMode": false }` on the `build` and `serve`
     targets in `angular.json`
   - `shimMode: false` in the `initFederation` options in `src/main.ts`
4. One lazy route (`src/app/app.routes.ts` loads `src/app/home.ts`).

## Steps

```sh
pnpm install
pnpm start          # http://localhost:4210/
```

Open http://localhost:4210/ in Chrome.

**Expected:** "Lazy home rendered" stays on the page.

**Actual:** the server-rendered heading is shown, then removed on hydration.
The console shows:

```
ERROR TypeError: Failed to resolve module specifier "@angular/core".
Relative references must start with either "/", "./", or "../".
```

The served HTML contains the preload hints before any import map exists:

```html
<script src="polyfills.js" type="module"></script>
<script src="main.js" type="module"></script>
<link rel="modulepreload" href="chunk-P2KI3XCI.js">
<link rel="modulepreload" href="chunk-YQOESBWP.js">
```

## Control

Make the route eager (`{ path: '', component: Home }` with a static import)
and the page renders and hydrates normally. This is the workaround we use
today, at the cost of lazy loading for the host's own routes.
