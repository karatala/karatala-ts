# KoMandir UI variants

## Purpose

- Own existing KoMandir controls and their local DOM helpers with current behavior and styles.

## Ownership

- package.json lists explicit component, CSS and helper exports. README.md records provenance and integration limits.
- host.ts owns translation, icon-service and window-state callback contracts. The original Icon renderer and WindowDialog call these ports; the application supplies file/theme requests and persistence. shortcut-codec.ts retains key functions with caller-owned command IDs and validation. icon-picker-host.ts owns IconPicker metadata, validation, search translation, revision-cache and cancellable loading callbacks; icon-theme-search.ts retains its existing grouping and search behavior.

## Local Contracts

- Preserve public props and existing KoMandir theme roles. Keep these variants separate from Rachana controls until a common replacement is chosen.
- Do not import application source, filesystem policy, Settings or native services.
- Portal, Dialog, Popover and overlay-focus form one overlay cluster. Connect the cluster together so one document does not get two independent overlay stacks.
- controls.css retains existing global selectors. Consumers own theme roles and document styling; do not present it as an isolated theme reset.
- Copy the full local dependency closure. Only application-dependent code needs an adapter; extraction does not require a behavior redesign.
- IconPicker requires provideIconPickerHost before mounting. The application owns its icon catalog, allowed values, loaders, revision cache and active theme. Keep original request cancellation, debounce, batching and explicit commit behavior. Imports must not start a load.
- Tooltip requires an array in bindings and defaults for every ID in commands, including an empty array when unassigned. Retain this caller contract when checking the string-keyed maps under noUncheckedIndexedAccess.

- ColorPicker is the selected common color editor. Its private core owns drafts, RGB/OKLCH, canvas and Apply/Cancel. The Rachana wrapper supplies its native popup cluster through required snippets. Keep controls.css out of that helper import graph. MiniPopup and windows supply a distinct local field surface. Editable fields use a bottom focus line, without a full outline or surrounding border.

## Verification

- Distinguish source extraction, application connection and runtime checks. Run install/build/device checks only when requested.

## Child DOX Index

- `src/internal/AGENTS.md`: shared picker state and private native-control renderers without document styles.
