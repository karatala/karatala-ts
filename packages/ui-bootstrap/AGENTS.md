# Independent startup UI

## Purpose

- Own the first-paint, emergency and startup window controls without Svelte or application imports.

## Ownership

- markup.ts renders escaped static HTML. index.ts connects that DOM to caller-supplied labels, clipboard, reload and optional window actions. styles.css owns namespaced presentation; application branding uses its CSS variables.
- Source derivation and licenses are recorded in README.md and ../../docs/ui-provenance.json. The DOM error panel derives from Rachana, not Shravanam's draft controls.

## Local Contracts

- Importing the package performs no I/O and installs no listeners. It needs only browser DOM and @karatala/dom-input; never import Svelte, Bun or a native bridge.
- Insert startupMarkup before connectStartup. Inline its styles and the independent connection bundle before loading the application graph, so an application import, parse or mount failure cannot remove recovery controls.
- Callers own language, error wording, global exception policy, clipboard permissions and native commands. Render error text as a textarea value, never HTML.
- Error state is sticky until reload or disposal. A late complete call must not hide it. showError can restore the root after a successful startup removed it.
- Error mode makes background siblings inert and contains Tab. dispose restores previous inert state and removes owned listeners. Pending copy completion must not relabel a replaced error.

## Verification

- tests/startup.test.ts checks the standalone DOM lifecycle, safe text, callbacks, clipboard fallback, modal focus and cleanup. Consumer checks must also fail the real application import/mount while using the generated HTML.

## Child DOX Index

- No child scopes.
