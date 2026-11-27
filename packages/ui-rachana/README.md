# Rachana UI variants

33 components from Rachana UI, ModalDialog, its native multiline form fields and the selected KoMandir color editor in a Rachana shell. Existing names, props, interaction code and component styles are retained. The package catalog is the explicit exports list in package.json; the runnable catalog is in ../../demo.

```ts
import UiButton from "@karatala/ui-rachana/UiButton.svelte";
import UiNumberStepper from "@karatala/ui-rachana/UiNumberStepper.svelte";
import UiSelect from "@karatala/ui-rachana/UiSelect.svelte";
import "@karatala/ui-rachana/styles.css";
```

Svelte 5 is a peer. @karatala/dom-input supplies the shared pointer helper. There is no Bun/native runtime or install hook. The consumer compiles source and supplies the existing theme roles. styles.css is an opt-in bundle of existing UI selectors/tokens in original cascade order; it does not import music layout, audio or application services. Retain existing application theme styles while reconnecting consumers, then remove duplicates as a separate style-owner change.

## Host boundary

Call provideRachanaUiHost from host.ts in the application shell before mounting children. It accepts translate(text, values), an optional iconPathOptions(path) resolver and optional windowLayouts.read/save. Pass the application's existing translation function, icon geometry lookup and geometry owner. The default is plain English with parameter interpolation, ordinary 24x24 SVG geometry and no persisted window layout.

UiIcon still accepts path/src and preserves authored geometry supplied by the resolver. Only the eight MDI paths used internally by these controls are bundled in icons.ts; musical and feature icon catalogs stay with the application. MDI attribution and Apache-2.0 text are retained in MDI-LICENSE.txt. All original source comments/notices and GPL v3 text are retained.

## Form and slider extensions

UiCheckboxButton accepts optional visible text, which defaults to its accessible label; empty text keeps labelled selection cells compact. UiTextArea extracts the native bound textarea and field styling from Rachana BeatTextEditor/dialogs.css. It forwards native attributes/events, supports a typed element reference and uses native rows (four by default). UiTextInput also accepts the native time type. UiPositionSlider keeps its original oninput callback by default; optional oncommit holds the local drag value and publishes only the native change event. Escape, pointer cancellation and disabling discard that local draft. step defaults to 1; omit resetValue to disable double-click reset. No application commands or persistence are included.

## Common color editor and fields

UiColorPicker accepts value, label, class and onchange. It uses the KoMandir color core from the sibling ui-komandir package, with Rachana UiButton/UiMiniPopup and its existing overlay stack. No KoMandir document stylesheet is loaded. RGB/OKLCH edits stay in a draft; Apply publishes once, Cancel/Escape discards it. UiMiniPopup adds optional initialFocus and restoreFocus with unchanged defaults. Pointer opening focuses the form; keyboard opening focuses Hex and returns to the trigger after closing.

Editable fields have no full outline or surrounding border. A reserved bottom line shows keyboard focus. Popup/window fields use a distinct local surface. Existing number, validation and commit behavior is retained.

## Rachana source refresh

UiStepControl includes the existing horizontal/child composition, with vertical arrows unchanged by default. UiWheelButton passes mouse and keyboard context actions on its action-enabled trigger to the application command card. Touch-generated context actions and the open value popup keep their existing handling. Both component pages contain live examples. Exact refreshed source revisions are in ui-provenance.json.

UiContextMenu measures intrinsic content width before clamping its position, with visual-viewport, root-content and zoom bounds. Placement accounts for the fixed containing-block origin, including reserved scrollbar gutters. Opening at the right edge keeps action labels readable and inside the viewport.

## Source and status

See ../../docs/ui-provenance.json for every component path, source revision, hash and adaptation status. Source: karatala/Komprohit at 02e63ce9827dc1d267e1a13758901f83da87f72a. Helpers come from src/frontend/ui. UI styling is selected from src/themes/base.css imports in their original order; selectors and declarations are retained in styles/legacy.css. UI fragments that own notation, projects, MIDI or playback remain in Rachana.

- ✅ Extracted 32 Rachana-derived components and their local dependencies; added UiColorPicker over the common KoMandir core.
- ✅ Shared demo type/Svelte check and browser mounting completed; representative interactions recorded in ../../docs/UI_TRANSFER_STATUS.md.
- ✅ Rachana connected the package in 3acb95e7 with application host callbacks and package imports; Shravanam also uses prepared controls. Current consumer records are linked from ../../docs/UI_TRANSFER_STATUS.md.
- [ ] Native/device acceptance remains application-owned. Extraction, type checks and browser examples do not prove native integration.
