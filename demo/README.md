# Component catalog

From the shared repository root:

```text
bun install --ignore-scripts
bun run demo
```

Open http://127.0.0.1:3212/. The server is loopback-only and does not open a browser automatically. It is a development catalog; no hosting or publication is configured.

- `/rachana/UiButton`: one page for an individual component.
- `/komandir/ColorPicker`: another component page.
- `/compare/buttons`, `/compare/checks`, `/compare/selection`, `/compare/windows`: common pages with independent live variants.
- `/preview/rachana/UiNumberStepper`: a standalone live example, also used inside the documentation iframe.

Pages include live controls, supported disabled states, usage markup, props/defaults and source paths. Examples change only local memory. Every iframe has its own document, styles and overlay stack so comparison does not change either variant's appearance.

Shared pages align matching controls: Switch with Switch, Select with Dropdown, ModalDialog with WindowDialog. Components without a matching variant have their own row.

Run `bun run check:demo` for type/Svelte validation. `bun run catalog:update` refreshes the catalog after adding a package component or changing example markup. A full production build or deployment is a separate action.
