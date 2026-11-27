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
- `/guide`: common usage rules and the complete prepared list from the existing catalog.
- `/themes`: live palettes and semantic color roles. The independent `/theme-preview/rachana` and `/theme-preview/komandir` documents use real controls, memory values and source-derived color snapshots. Rachana also previews Shravanam colors. Applications still own their palettes and settings.
- `/preview/rachana/UiNumberStepper`: a standalone live example, also used inside the documentation iframe.

- `/bootstrap/StartupScreen`: independent loading and recovery UI, with standalone scenarios at `/startup-preview.html?state=loading`, `?state=error`, `?state=late-error`, and `?state=error&clipboard=denied`. The preview imports no Svelte.

Pages include live controls, supported disabled states, usage markup, props/defaults and source paths. Examples change only local memory. Every iframe has its own document, styles and overlay stack so comparison does not change either variant's appearance.

Shared pages align matching controls: Switch with Switch, Select with Dropdown, ModalDialog with WindowDialog. Components without a matching variant have their own row.

The IconPicker example has a memory theme with an alias, bundled choices and two memory resource records. Use /memory/icons/sample.dll in its source field to view the resource gallery. No native file is read. memory-folder.svg and memory-file.svg retain source Lucide artwork from KoMandir src/icon-assets.json, with the external-use root ID added; see ../packages/ui-komandir/ICON-LICENSES.md.

Run `bun run check:demo` for type/Svelte validation. `bun run catalog:update` refreshes the catalog after adding a package component or changing example markup. A full production build or deployment is a separate action.
