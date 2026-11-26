# Rachana UI variants

32 components from Rachana UI, ModalDialog and its native multiline form fields. Existing names, props, interaction code and component styles are retained. The package catalog is the explicit exports list in package.json; the runnable catalog is in ../../demo.

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

## Source and status

See ../../docs/ui-provenance.json for every component path, source revision, hash and adaptation status. Source: karatala/Komprohit at 02e63ce9827dc1d267e1a13758901f83da87f72a. Helpers come from src/frontend/ui. UI styling is selected from src/themes/base.css imports in their original order; selectors and declarations are retained in styles/legacy.css. UI fragments that own notation, projects, MIDI or playback remain in Rachana.

- ✅ Extracted 32 components and their local dependencies.
- ✅ Shared demo type/Svelte check and browser mounting completed; representative interactions recorded in ../../docs/UI_TRANSFER_STATUS.md.
- [ ] Deliver the new shared commit, bind the host callbacks in Rachana and replace its local imports. Existing consumers still use local UI implementations.
- [ ] Consumer/device acceptance after reconnection. Extraction and demo checks do not prove native integration.
