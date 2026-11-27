# UI transfer status

## Rachana source refresh, 2026-11-27

- ✅ Refresh UiStepControl and UiWheelButton from the current Rachana source before reconnecting that consumer. Preserve the shared dependency boundary and record exact provenance.
- ✅ Add horizontal child actions and wheel command-card examples to their existing component pages.
- ✅ Refresh all 68 catalog pages. Shared demo/package types pass with zero errors and warnings.
- [ ] Deliver the shared commit before pinning the Rachana consumer; the application owns host and browser acceptance.

## Independent startup and emergency UI

- ✅ @karatala/ui-bootstrap derives static loading/error presentation, MDI actions and the DOM error field from Rachana. It has no Svelte, Bun or native runtime dependency. Applications supply language, failure text, clipboard/reload/window actions and global exception policy.
- ✅ Standalone lifecycle supports failure before initialization and after complete; a late complete cannot hide an error. Modal focus, background inert restoration and clipboard fallback are covered by six DOM tests with 29 assertions.
- ✅ Added the 68th catalog page, bootstrap/StartupScreen, with a separate no-Svelte preview. Browser checks passed for loading/logo, copy, reload, window callback, recovery after complete and denied clipboard/manual selection. The shared type/Svelte check has zero errors and warnings.
- [ ] Consumer generated-HTML checks must reject the real application graph and exercise late failures. Native desktop/Android window acceptance stays with the application.

## Form extensions for Shravanam

- ✅ Extracted UiTextArea from Rachana BeatTextEditor and dialog field styles, with native rows, validation, events and a bound element reference.
- ✅ UiTextInput accepts time; UiCheckboxButton can hide visible text while retaining its label. UiPositionSlider supports fractional steps and optional commit on the native change event, with cancellation and optional reset. Existing defaults remain unchanged.
- ✅ The catalog contains 67 real component pages. The shared Svelte/type check has zero errors and warnings. Source derivations and adaptations are recorded in ui-provenance.json.
- ✅ Form extensions were delivered in 9bfe6d8. Consumer repositories own their pins and browser/device acceptance.


Owner: karatala-ts. This is a source transfer and demo record, not a merged cross-project design. Existing Rachana R-family and KoMandir K-family catalogs remain the owners of product approval until consumers connect to these packages.

## Extracted

- ✅ ui-rachana: all 30 components in src/frontend/ui plus ModalDialog, with local helpers and opt-in UI CSS. Application translation, icon metadata and window layout are context inputs.
- ✅ ui-komandir: all 35 components in src/web/ui, with local helpers/CSS. Icon rendering/service lookup, translation and persisted window state use context callbacks. The existing pure shortcut codec is retained without the product command catalog.
- ✅ 46 component files are byte-identical; 20 contain import/host-boundary or type changes. Component styles and interaction implementations are retained. Exact source hashes, revisions and paths are in ui-provenance.json.
- ✅ All 66 component style blocks match the source files. The opt-in Rachana stylesheet keeps the existing UI folder CSS and selected theme rules in source cascade order.
- ✅ IconPicker: extracted with explicit catalog, validation, cache and signal-aware loading callbacks. Original search/grouping helpers and synonyms are retained. Source and consumer mappings are in ui-connection.md.
- ✅ All 66 components, including IconPicker, are available in 1f1fc62 on origin/dev. The strict Tooltip binding-map annotations added during consumer connection preserve the existing complete-map contract and runtime behavior.
- Application repositories own connection and acceptance records. Keep consumer pins reproducible; only pin delivered shared code. The agent does not push.

## Demo

- ✅ 68 component pages, each with a real shared-package example, import/usage markup, props/defaults and source information.
- ✅ Shared family pages put existing variants beside each other for later comparison. No behavior is normalized for the demo.
- ✅ Preview documents isolate legacy CSS and overlay stacks. Examples use memory-only values, bundled icons and no persisted window keys.
- ✅ Catalog update script rejects a public component without a live example branch.

## Checks on 2026-11-26

- ✅ bun run check:demo: zero errors and warnings for the demo and both UI packages.
- ✅ Browser mounted all 65 standalone preview routes and found the reserved result area on every route. No console errors in that pass.
- ✅ Representative actions: Rachana 150 percent normalized to 100; KoMandir ColorPicker applied #e08040; KoMandir nested menu ran Details; Rachana window Save returned its memory text; KoMandir window opened/closed. These are smoke checks, not an exhaustive behavior comparison.
- ✅ Added IconPicker route: Russian search/alias grouping, theme selection, file-resource selection, invalid-input guidance, Escape retaining the committed value and Inherit. Its component page and iframe also opened without console errors. This does not verify native resource decoding or application requests.
- ✅ Local server runs on 127.0.0.1:3212 with automatic browser opening disabled. Dependency installation used --ignore-scripts; no production build or deploy ran.
- [ ] Native-device regressions and platform icon sources require consumer checks; the catalog does not prove them. Application hosts own keyboard, theme and persisted-geometry acceptance.

## Next

- Consumer owners deliver a shared code commit before pinning it, connect their hosts and replace imports in groups. Archive superseded local source only after callers use the shared implementation.
- [ ] Extend the catalog when another ready component is extracted. Reuse approved controls for new features; keep distinct existing variants focused rather than adding flags to one universal control.
