# Rachana UI variants

## Purpose

- Own existing Rachana components copied with their public props, behavior and styles intact.

## Ownership

- The explicit exports in package.json and README.md form this package's current catalog. Source provenance is in README.md.
- host.ts owns only translation, icon geometry and optional window-layout callbacks. It does not import the application language service or icon catalog. styles/legacy.css retains the existing UI rules in source cascade order.

## Local Contracts

- Keep these variants separate from KoMandir controls. A shared repository does not require equal behavior or appearance.
- Accept data and callbacks; do not import application source, translation providers or the editor.
- Preserve the existing theme-role names for now. Consumers supply their theme values and compile Svelte with one peer runtime.
- Copy the complete local dependency closure when adding a component. Isolate a host dependency only when required for that transfer.
- UiCheckboxButton text defaults to its accessible label; an explicit empty text keeps table selection cells compact without losing their label.
- UiTextArea derives the bound native field from Rachana BeatTextEditor and dialogs.css; use native rows and forward attributes/events instead of importing editor state. UiTextInput accepts native time fields. UiPositionSlider retains immediate oninput by default; optional oncommit owns a cancellable local draft and emits the native change once. Keep step and reset explicit and preserve existing consumers.
- UiStepControl preserves vertical arrow actions and the Rachana horizontal/child composition. UiWheelButton lets mouse and keyboard context actions on an action-enabled trigger reach its application command card; touch context and the open value popup retain their own behavior.
- Compare two variants only when choosing a common replacement or changing a contract. Exhaustive cross-project comparison is not a prerequisite for extraction.

## Verification

- Record copied source, consumer connection and runtime checks separately. Run installation/build/device checks only when requested.

## Child DOX Index

- No child scopes.
