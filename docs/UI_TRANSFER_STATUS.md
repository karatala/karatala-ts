# UI transfer status

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

- ✅ 66 component pages, each with a real shared-package example, import/usage markup, props/defaults and source information.
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
