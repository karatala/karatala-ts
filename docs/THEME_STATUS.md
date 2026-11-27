# Theme roles and guide

Owner: karatala-ts owns the CSS alias contract and memory examples. Application plans own palette policy, root connection and device acceptance.

## First color layer

- ✅ Found Rachana src/frontend/ui/application-theme.ts and src/themes/interface-theme.css at 9054f651. Notation and instrument colors are separate owners.
- ✅ Matched KoMandir workbench/control/tab/list roles against the existing demo/palettes.json source snapshot and current controls. Keep selection distinct from the workbench accent.
- ✅ Reviewed Shravanam src/theme.css at 5113654. It supplies prepared Rachana controls, not a third approved control design.
- ✅ Extracted 12 semantic aliases into CSS-only @karatala/ui-theme, with no runtime, default palette or layout dependency. Mappings read existing tokens in one direction.
- ✅ Added /themes and isolated /theme-preview/rachana and /theme-preview/komandir with real controls. Palette/accent edits are memory-only; fields and selection retain their values.
- ✅ Added docs/UI_GUIDE.md and /guide. The full list comes from the generated catalog; source plans keep product approval.
- ✅ Shared demo/package type checks pass with zero errors and warnings. /guide contains all 68 generated component links.
- ✅ Browser checks cover real dark/light and Shravanam colors, retained text/selection, Rachana fill editing versus KoMandir confirmed ColorPicker editing, and document-to-popup color inheritance. Invalid hex input gives a concrete recovery example; the reserved 48 px status area leaves the following content at the same position. Returning from Shravanam colors restores Rachana values.
- [ ] Browser automation reports MutationObserver.observe diagnostics during iframe inspection. A controlled page error listener still reports no page errors. The source of the automation log is not confirmed; do not change a component on that evidence. Standalone controls and the checked actions work. Native and full automated acceptance remain separate.
- [ ] Connect optional aliases to application roots after delivery and review. This iteration keeps existing application palettes and component implementations.

## Decisions to view before changing components

- [ ] KoMandir couples accent/focus and uses workbench background for primary text. Decide whether independent focus/on-accent values are needed only after viewing /themes.
- [ ] KoMandir couples popup/control surfaces; Rachana has separate values. Keep both until a replacement is chosen.
- [ ] A common palette generator and saved schema are not selected. This layer reads existing palettes without migrating saved themes.
- [ ] Native WebView, touch/pen, custom high-contrast palettes, screen-reader and multiwindow acceptance remain application work.
