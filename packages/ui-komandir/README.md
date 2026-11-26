# KoMandir UI variants

All 35 existing controls from KoMandir's src/web/ui with their props, interaction code, styles and local helper closure. IconPicker takes its catalog and loading operations from icon-picker-host.ts.

```ts
import CheckButton from "@karatala/ui-komandir/CheckButton.svelte";
import ColorPicker from "@karatala/ui-komandir/ColorPicker.svelte";
import WindowDialog from "@karatala/ui-komandir/WindowDialog.svelte";
```

Svelte 5 is the only peer runtime. CSS keeps existing --theme-workbench-*, --theme-list-* and --ui-* roles. Imported controls.css retains its original global field selectors; use the source application's theme adapter when reconnecting it. There are no install/build hooks, requests on import or native dependencies.

## Host boundary

provideKomandirUiHost in host.ts accepts the application's existing message formatter, icon lookup/theme/file-reference functions, command-icon URL provider and window-state load/save callbacks. It stores callbacks in Svelte context per shell. The copied Icon renderer retains its mask/SVG/native-image layers, error paths, size and authored viewBox behavior. The copied WindowDialog retains its optional stateKey branch and lifecycle. Only the service imports are replaced by host callbacks.

Defaults provide bundled semantic icons and English parameter interpolation. File/command icons, theme loading and persisted geometry require the corresponding host callbacks. Unconfigured required capabilities report an explicit error. Omit stateKey for a memory-only window. The demo uses these memory-only defaults and performs no application requests. Bundled artwork and attribution are recorded in builtin-icons.json and ICON-LICENSES.md.

Tooltip/ShortcutHint use the existing key capture/signature/format functions in shortcut-codec.ts. Command IDs are strings supplied by the consumer, with binding/default maps and validate/onAssign callbacks. The source recorder still assigns on key release; this is not a new universal shortcut policy. Product command catalogs and conflict scopes remain in the application.

Supply a bindings and defaults array for every ID in commands, including empty arrays for unassigned commands. This retains the source catalog contract and supports consumers with noUncheckedIndexedAccess enabled.

IconPicker requires provideIconPickerHost from icon-picker-host.ts in addition to the icon-rendering host. Its contract supplies choices, allowed-value validation, error guidance, search translation, active theme, revision cache and three cancellable loading paths: installed themes, file resources and cached icons. The component keeps original batching, debounce, alias grouping, keyboard grid navigation and commit/cancel behavior. See ../../docs/ui-connection.md for source mappings and connection order. The memory example never reads an executable or application cache.

## Integration and status

Adopt Portal, Dialog, Popover, portal.ts and overlay-focus.ts together with their callers so one document has one stack. Table selection/commands, path authorization and persisted window policy stay with callers. See ../../docs/ui-provenance.json for every source path/hash and ../../docs/UI_TRANSFER_STATUS.md for checks. Source revision: ffb699e5b5d31007932ebe912dc5e20d3d77cad4 in the KoMandir Bun utilities repository.

- ✅ Extracted all 35 components and local CSS/helpers with host boundaries for translations, icons, window storage and picker loading.
- ✅ Shared demo type/Svelte check, all preview mounts and representative actions completed.
- [ ] Deliver the new shared commit, connect KoMandir's real host callbacks and replace local imports.
- ✅ IconPicker transferred with its source styles and cancellable host callbacks; memory browser checks passed.
- [ ] Consumer/native-device acceptance after reconnection.
