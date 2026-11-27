# Shared component guide

Owner: karatala-ts owns package contracts, reusable controls and the live catalog. Applications own product approval, commands, data, translation, persistence and platform policy. Rachana's [UI rules and approved catalog](https://github.com/karatala/Komprohit/blob/dev/UI_COMPONENT_LIBRARY_PLAN.md#rachana-ui-rules) and KoMandir's SHARED-UI-COMPARISON.md retain their existing decisions. This guide does not approve unresolved product layouts.

## Choose an existing control

The complete prepared list is the explicit exports in [ui-rachana](../packages/ui-rachana/package.json), [ui-komandir](../packages/ui-komandir/package.json) and [ui-bootstrap](../packages/ui-bootstrap/README.md), with provenance and a live page for each component. The generated [catalog](../demo/src/catalog.json) drives /guide, individual pages and family comparisons. Do not maintain a second handwritten full registry.

New features use a listed control and its existing props, size, spacing, icon scale and states. Do not copy its implementation into a feature. Plain layout markup may arrange controls. Shravanam has no approved local control variants; use the prepared Rachana/KoMandir packages there.

| Task | Start with | Keep explicit |
| --- | --- | --- |
| Action or icon action | UiButton; Button/IconButton | Accessible label, disabled state, command callback |
| Boolean or mixed choice | UiCheckboxButton, UiSwitch; CheckButton/CheckMark, Switch | Mixed state, caption and application value |
| Bounded number | UiNumberStepper | Min/max/step, commit timing and suffix after the number inside the control |
| Text, search, time or multiline value | UiTextInput, UiTextArea, UiField | Form label, native attributes, draft and validation owner |
| Step, wheel or slider value | UiStepControl, UiValueControl, UiWheelButton, UiPositionSlider | Immediate/committed updates, reset and cancellation |
| Segment or page choice | UiSegmentedButton/Control/Group; SegmentedControl/TabSurface | Both variants are allowed. Preserve keyboard and repeat-selection contracts. |
| Dropdown or grid | UiSelect, UiComboButton, UiZoomSelect; Dropdown | Value type, disabled options, pointer focus and unchanged-value behavior |
| Window or popup | ModalDialog, UiMiniPopup; WindowDialog, Dialog, MiniPopup, Popover, ConfirmPopover | Modal/nonmodal focus, nested Escape, trigger return and optional application geometry |
| Context menu | UiContextMenu; ContextMenu, ContextSubmenu, ContextAction | Application commands, one overlay stack and keyboard opening |
| Help and key hints | UiHelp, UiTooltip, UiKeycap, UiShortcutHint; HelpButton, Tooltip, Keycap, ShortcutHint | Automatic hint, explicit longer help and the correct shortcut save policy |
| Color or icon | KoMandir ColorPicker; UiColorPicker for a Rachana host; IconPicker; UiIcon/Icon/SvgIcon | Commit/cancel, authored viewBox, catalog and cancellable loaders |
| Table or list | Existing data-table/menu-list/presentation CSS; DataTable, TableRow, ColumnHeader, RowSweepHandle, PathLabel, FileDate | Selection, sorting, row commands, permissions and content remain application-owned |
| Loading, notice or emergency UI | UiLoading; MessageBar/Notification; ui-bootstrap | Lifecycle, reserved status space and recovery independent of Svelte when needed |

Other prepared layout, favorite, filter, resize and timeline controls remain listed on /guide. Compositions that depend on music, playback, file operations or editor state stay in their application until a concrete reusable boundary exists.

Use the KoMandir color editor for new color fields and replacements of native/system color pickers. UiColorPicker uses the same editor with the Rachana overlay shell. Both use a local draft and Apply/Cancel; applications own the committed value and persistence. Do not add another native color input.

## Text and layout

- Editable fields have no full color outline or surrounding border. Use the reserved bottom line for keyboard focus and a distinct field surface in popups. Keep existing functional focus indicators on buttons, sliders and color-wheel handles.
- Use short labels. Give icon-only buttons accessible action names. Put long explanations in Help.
- Errors say what failed, quote an invalid value when useful, give a valid example and explain recovery. Keep parser positions and diagnostic codes in developer logs.
- Numeric units follow the number inside the control, for example 75 % or 120 BPM. Avoid repeating the unit in the visible field label.
- Keep window actions at the bottom. Fit nonstretching content; do not add empty card/window height. Use standard group, field and table spacing.
- Temporary messages use an overlay notification or reserved status area. They must not move toolbar, address, rows or content.
- Separate flat surfaces with space and color. Do not add decorative borders or shadows. Retain functional focus, active-item, drop-target, tab and separator indicators, and approved popup-shell treatment. Do not rewrite existing variant styles as part of new feature layout.

## Behavior and ownership

- Controls receive data and callbacks. Applications own commands, allowed values, storage, translation, capabilities and permissions. Imports must not start services or request permission.
- Keep one Svelte peer, a narrow host at every independent mount, and one document overlay/submenu stack. See [host connections](ui-connection.md).
- Set the standard UI font on the document root and let native form controls inherit it. A font set only on a feature wrapper does not reach menus portaled to body. Check the open menu's computed size, not only its trigger.
- Use the host's configured control/style variant. Both legacy stylesheets contain global selectors; color aliases do not isolate them. Comparisons use separate documents. Review a mixed application composition before connecting both full stylesheets.
- Preserve keyboard focus. Pointer use must not trap configured editor shortcuts on toolbar controls. Keep application shortcuts outside text fields, selects, sliders, application menus and open dialogs.
- Preserve validation, commit, cancel and repeat-selection behavior. KoMandir tooltip shortcut assignment saves on key release; a confirmed settings draft is separate. Color preview and Apply/Cancel also remain distinct.
- Abort caller-owned reads on close or input replacement. Keep stale-result guards and cleanup. A file reference is not a permission grant.
- Use real controls and callbacks in examples. Memory examples do not prove native/device behavior.

## Colors and themes

Use [semantic color roles](../packages/ui-theme/README.md) for new shared presentation. The optional CSS adapters read existing tokens. Applications own palettes, system mode, storage and meaningful content colors. Existing controls keep native role names.

Install the adapter on the document root so portals receive the same theme. Use a separate document or restate aliases for a subtree with local source overrides. Never feed an alias back into its own source token.

Accent, focus and selection are separate roles. KoMandir couples accent/focus; its MiniPopup uses the panel surface, while default controls and Dropdown lists use the raised surface. /themes shows these differences. Notation, playback, track, file-status and syntax colors stay with their applications. Dimensions, opacity and focus policy are not color roles.

## Extend a control

1. Check its live page, props and consumers. Choose another prepared control when it already does the job.
2. Propose a small extension with an unchanged default, or a focused component when behavior conflicts. Do not create a universal control with many flags.
3. Record source/adaptation, public export and ownership. Add a real memory example and refresh the catalog.
4. When checks are authorized, verify changed behavior, focus, disabled/mixed states, commit/cancel and dynamic colors. Run relevant type checks. Record source, connection and device verification separately.
5. Deliver the shared commit before pinning consumers. Replace callers, then archive superseded copies. Keep unrelated changes out of commits. Never push automatically.
