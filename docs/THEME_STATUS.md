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
- ✅ Corrected the initial popup/control mapping after checking real shells: KoMandir MiniPopup uses workbench-surface; controls and Dropdown lists use workbench-raised. The popup alias now describes the MiniPopup shell. This corrects the role map without changing those controls.
- [ ] A common palette generator and saved schema are not selected. This layer reads existing palettes without migrating saved themes.
- [ ] Native WebView, touch/pen, custom high-contrast palettes, screen-reader and multiwindow acceptance remain application work.

## Popup and menu corrections, 2026-11-27

- ✅ Added the prepared UiTextInput to KoMandir's theme popup with memory binding and local semantic text/field/focus inputs. The full Rachana stylesheet is not loaded there.
- ✅ Found the oversized Dropdown text: the trigger inherited 12 px from its wrapper, but its body portal inherited the documentation root's 16 px font. Native buttons also kept the browser's Arial default. Preview documents now supply the standard root font and native form inheritance.
- ✅ Added explicit preview palette adjustments for visible button surfaces in KoMandir, Rachana light and Shravanam colors. Rachana dark source colors remain the reference. These memory-preview adjustments do not migrate application palettes.
- ✅ Final shared Svelte/type checks: zero errors and warnings. Browser checks passed in all six palettes: popup buttons/fields use 12 px, values survive closing and palette changes, Escape closes the active popup, and KoMandir Save reads the new field. Both standalone Dropdown/UiSelect pages also use 12 px options and publish the selected value.
- ✅ Checked actual button/popup colors after the preview adjustments. Rachana dark colors match the previous reference. Other default button surfaces are visibly separate from their popup; no borders or decorative shadows were added. These checks do not claim native-device or full accessibility acceptance.

## Field and common color editor corrections, 2026-11-27

- ✅ Editable text, numeric, multiline and dropdown fields now reserve a bottom focus line, with no surrounding border or full color outline. Removed the legacy Rachana popup rule that overrode the field styles. Functional button, slider, table and color-wheel focus indicators remain.
- ✅ Added popup-field as the thirteenth color role. Popup fields mix the popup surface with text at 24%; popup components map it locally to the existing field token and restate the field alias without a cycle. Window fields derive the same mix from their actual shell. Existing application palette values are retained.
- ✅ Both picker variants use the selected KoMandir editor. One body scroller owns the wheel and fields; heading and actions stay outside it. Pointer opening starts at the form without scrolling down to Hex. Keyboard opening focuses Hex. The wheel shrinks for short viewports and rows keep their natural height inside the scroller. Invalid-color help has reserved space.
- ✅ Browser checks covered distinct popup field colors across the six palette choices, bottom-only text/Hex focus, Apply, Cancel, invalid Hex and RGB keyboard selection. At 360 x 320 the KoMandir popup is 296 px high, its outer shell does not scroll, rows do not overlap and its actions remain visible at y=300. Rachana nested Escape closes the picker first, retains the parent and restores the keyboard trigger; the next Escape closes the parent. These are browser checks, not touch/native acceptance.
- [ ] Publish and connect these control changes before application acceptance. The optional root color-alias connection remains a separate step.
