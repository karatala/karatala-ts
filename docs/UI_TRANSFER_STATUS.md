# UI transfer status

## Current consumer connections, 2026-11-27

- ✅ KoMandir uses all 35 prepared ui-komandir controls and their helpers/styles. Application hosts retain translations, icon catalogs, settings and persisted window state. Its SHARED-REPOSITORY-REVIEW.md owns acceptance.
- ✅ Rachana connected ui-rachana in 3acb95e7. Its consumers use the package exports; local generic implementations are archived. Live translation/icon providers, the existing window-layout adapter and application theme cascade retain their owners. [Rachana's connection record](https://github.com/karatala/Komprohit/blob/dev/SHARED_REPOSITORY_PLAN.md#rachana-ui-connection) owns browser, type and interaction results.
- ✅ Shravanam uses the prepared Rachana/KoMandir controls, form extensions and independent bootstrap screen. Its own controls were drafts, not approved library sources. [Shravanam's feature plan](https://github.com/karatala/shravanam/blob/dev/FEATURE_PLAN.md) owns connection and generated-HTML failure checks.
- ✅ Context-menu fixes f16dd7d and 56f54d6 retain intrinsic label width and account for viewport, root zoom and scrollbar gutters. Provenance records this adaptation separately from the original source revision. Consumer repositories own their pins and local dependency refresh.
- [ ] Native WebView, touch/pen and platform icon acceptance remain consumer work. Common semantic theme roles and a cross-project style guide remain a later stage; preserved variants are not a merged design.

## Rachana source refresh, 2026-11-27

- ✅ Refresh UiStepControl and UiWheelButton from the current Rachana source before reconnecting that consumer. Preserve the shared dependency boundary and record exact provenance.
- ✅ Add horizontal child actions and wheel command-card examples to their existing component pages.
- ✅ Refresh all 68 catalog pages. Shared demo/package types pass with zero errors and warnings.
- ✅ Delivered d529733 before Rachana's connection. Application host and browser acceptance are recorded in its connection plan.

## Independent startup and emergency UI

- ✅ @karatala/ui-bootstrap derives static loading/error presentation, MDI actions and the DOM error field from Rachana. It has no Svelte, Bun or native runtime dependency. Applications supply language, failure text, clipboard/reload/window actions and global exception policy.
- ✅ Standalone lifecycle supports failure before initialization and after complete; a late complete cannot hide an error. Modal focus, background inert restoration and clipboard fallback are covered by six DOM tests with 29 assertions.
- ✅ Added the 68th catalog page, bootstrap/StartupScreen, with a separate no-Svelte preview. Browser checks passed for loading/logo, copy, reload, window callback, recovery after complete and denied clipboard/manual selection. The shared type/Svelte check has zero errors and warnings.
- ✅ Shravanam's generated-HTML checks reject the real application graph and exercise late failures. [ ] Native desktop/Android window acceptance stays with the application.

## Form extensions for Shravanam

- ✅ Extracted UiTextArea from Rachana BeatTextEditor and dialog field styles, with native rows, validation, events and a bound element reference.
- ✅ UiTextInput accepts time; UiCheckboxButton can hide visible text while retaining its label. UiPositionSlider supports fractional steps and optional commit on the native change event, with cancellation and optional reset. Existing defaults remain unchanged.
- ✅ The catalog contains 67 real component pages. The shared Svelte/type check has zero errors and warnings. Source derivations and adaptations are recorded in ui-provenance.json.
- ✅ Form extensions were delivered in 9bfe6d8. Consumer repositories own their pins and browser/device acceptance.


Owner: karatala-ts. This is a source transfer and demo record. Existing Rachana R-family and KoMandir K-family catalogs remain the owners of product approval. The application plans above own connection and acceptance.

## Extracted

- ✅ ui-rachana: all 30 components in src/frontend/ui plus ModalDialog, with local helpers and opt-in UI CSS. Application translation, icon metadata and window layout are context inputs.
- ✅ ui-komandir: all 35 components in src/web/ui, with local helpers/CSS. Icon rendering/service lookup, translation and persisted window state use context callbacks. The existing pure shortcut codec is retained without the product command catalog.
- ✅ Initial 66-component extraction: 46 component files were byte-identical; 20 contained import/host-boundary or type changes, and all 66 style blocks matched their sources. Later extensions and refreshes are recorded above and in ui-provenance.json. The opt-in Rachana stylesheet retains source cascade order.
- ✅ IconPicker: extracted with explicit catalog, validation, cache and signal-aware loading callbacks. Original search/grouping helpers and synonyms are retained. Source and consumer mappings are in ui-connection.md.
- ✅ All 66 components, including IconPicker, are available in 1f1fc62 on origin/dev. The strict Tooltip binding-map annotations added during consumer connection preserve the existing complete-map contract and runtime behavior.
- Application repositories own connection and acceptance records. Keep consumer pins reproducible; only pin delivered shared code. The agent does not push.

## Demo

- ✅ 69 component pages, each with a real shared-package example, import/usage markup, props/defaults and source information.
- ✅ Shared family pages put existing variants beside each other for later comparison. No behavior is normalized for the demo.
- ✅ Preview documents isolate legacy CSS and overlay stacks. Examples use memory-only values, bundled icons and no persisted window keys.
- ✅ Catalog update script rejects a public component without a live example branch.

## Checks on 2026-11-26

- ✅ bun run check:demo: zero errors and warnings for the demo and both UI packages.
- ✅ Browser mounted all 65 standalone preview routes and found the reserved result area on every route. No console errors in that pass.
- ✅ Representative actions: Rachana 150 percent normalized to 100; KoMandir ColorPicker applied #e08040; KoMandir nested menu ran Details; Rachana window Save returned its memory text; KoMandir window opened/closed. These are smoke checks, not an exhaustive behavior comparison.
- ✅ Added IconPicker route: Russian search/alias grouping, theme selection, file-resource selection, invalid-input guidance, Escape retaining the committed value and Inherit. Its component page and iframe also opened without console errors. This does not verify native resource decoding or application requests.
- ✅ Browser checks used the local server on 127.0.0.1:3212 with automatic browser opening disabled. Dependency installation used --ignore-scripts; no production build or deploy ran. This record does not assert that the server is still running.
- [ ] Native-device regressions and platform icon sources require consumer checks; the catalog does not prove them. Application hosts own keyboard, theme and persisted-geometry acceptance.

## Next

- Consumer owners pin delivered shared commits and refresh only the packages they use. Keep host contracts and acceptance records with each application. Archive superseded source only after its callers use the shared implementation.
- [ ] Extend the catalog when another ready component is extracted. Reuse approved controls for new features; keep distinct existing variants focused rather than adding flags to one universal control.

## Selected common color editor, 2026-11-27

- ✅ The user selected KoMandir ColorPicker to replace other color pickers. Its RGB/OKLCH editor, canvas and Apply/Cancel now have one core; UiColorPicker adapts it to the Rachana shell and overlay stack. Private native-control renderers avoid importing KoMandir document CSS into Rachana. Public Button/SegmentedControl APIs retain their behavior.
- ✅ Added the 69th public component page and a nested-picker example in UiMiniPopup. The colors family shows both host wrappers of the same editor. Provenance records retain the original source revisions/hashes and name these adaptations.
- [ ] Publish the prepared shared commit before changing application pins. Replace Rachana native color inputs in SettingsDialog, TrackSettings and FileUiPlayground with UiColorPicker. Theme changes will publish on Apply rather than native live input. KoMandir already uses ColorPicker; no competing picker was found in Shravanam. Keep application callbacks, validation, theme persistence and settings search targets.
- [ ] Refresh local file dependencies and verify consumer styles after publication. Rachana and Shravanam have their own theme focus rules; check them when connecting the prepared field styles.
