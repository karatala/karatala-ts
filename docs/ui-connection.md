# UI consumer connection

Owner: karatala-ts. This document owns shared host contracts and connection order. Product approval stays in Rachana UI_COMPONENT_LIBRARY_PLAN.md and KoMandir KOMANDIR_UI_INVENTORY.md / SHARED-UI-COMPARISON.md. The source register is ui-provenance.json. Do not copy those application catalogs here.

## Delivery and runtime

- ✅ Initial UI packages are published in ebf477b on origin/dev.
- ✅ All 31 Rachana and 35 KoMandir components now have shared source and a live memory example.
- [ ] Deliver the IconPicker addition, then pin that available commit in consumers before connecting it.
- [ ] Add only the required file dependency: @karatala/ui-rachana or @karatala/ui-komandir from vendor/shared/packages. Rachana also needs the existing dom-input package. Keep one Svelte peer runtime per consumer.
- [ ] Refresh each consumer lockfile and check its real host after dependency updates are authorized. No application build or deploy is part of extraction.

## KoMandir hosts

The shared components call application functions through Svelte context. Install the rendering host at each independently mounted root before its children: BrowserHost, NativeHost and AppTooltip. The memory review page uses a separate memory host. Shared code must not import these application modules.

| Rendering callback | Existing application owner |
| --- | --- |
| message | src/web/localization.svelte.ts |
| iconImage, iconFallback | src/icons.ts; retain the application IconName lookup |
| iconFileReference, iconThemeReference | src/icon-catalog.ts |
| ensureReferencedTheme, referencedIcon, themedIcon | src/web/icon-theme.svelte.ts; reads must remain reactive |
| commandIconUrl | src/web/command-icon-client.ts |
| loadInterfaceState, saveInterfaceState | src/web/interface-state-client.ts; application retains the write queue and persistence policy |

Export the shared ICON_THEME_ENABLED symbol from the application theme module when migrating. SettingsForm and the memory review currently set the application symbol to false. They must set the same symbol that the shared Icon reads.

IconPicker needs a separate provideIconPickerHost call in the same component context. Its required callbacks map directly to existing functions:

| Picker input or operation | Existing application owner and contract |
| --- | --- |
| choices, valueError, isConfiguredIcon | ICON_CHOICES, ICON_VALUE_ERROR, isConfiguredIcon from src/icon-catalog.ts. Allowed values and product symbols stay with the application. |
| searchTranslation(text) | text => translate("ru", text) from src/localization.ts, matching the original bilingual search. Visible labels still use message. |
| activeIconThemeId, cachedIconTheme, rememberIconTheme | src/web/icon-theme.svelte.ts; metadata is cached by ID/revision and the active theme sorts first. |
| loadIconThemes(signal) | src/web/icon-theme-client.ts; returns theme summaries. The component loads metadata in batches of four. |
| loadIconTheme(id, signal) | src/web/icon-theme-client.ts; returns assets/mappings. The application owns requests, permission policy and revision cache. |
| loadCommandIconCatalog(path, signal) | src/web/command-icon-client.ts; returns version and resource index/name pairs. The component retains the 180 ms debounce. |
| loadCachedCommandIcons(filter, limit, signal) | src/web/command-icon-client.ts; returns records plus total. The component retains the query debounce and bounded load-more requests. |

No loader starts on import or while the picker is closed. Opening starts reads; close, replacement and removal abort their signals. The component ignores aborted replies. The application loader must stop its own request/work when the signal aborts. File values are metadata references, not permission grants. Platform decoding, native URLs and file authorization remain application-owned.

The copied sources are src/web/ui/IconPicker.svelte, src/icon-theme-search.ts and src/presets/icon-search-synonyms.json in gaabora/bun-kai at 2ce59b840c2bc88eb00a8a92007e71cd9611a6c4. icon-picker-host.ts retains only the data shapes from src/api/icon-theme-types.ts, src/api/command-icon-types.ts and src/web/command-icon-client.ts. No application requests or product catalog are copied. The demo supplies a theme, alias, two resource records and bundled choices in memory; its loaders accept and check AbortSignal.

## Rachana hosts

Install provideRachanaUiHost through the existing language/window-layout provider boundary. Main App and FileUiPlayground use provideLanguage; StandaloneMetronomeWindow uses provideTranslation. Preserve these independent mount paths and live language changes.

| Shared callback | Existing application owner |
| --- | --- |
| translate(text, values) | The current TranslationState or LanguageState translate method. Use a closure so this and reactive locale reads are retained. |
| iconPathOptions(path) | src/frontend/ui/icons.ts iconPathOptions[path]. Keep the musical catalog in Rachana and preserve authored viewBox/fillRule. |
| windowLayouts.read(key) | Current InterfaceController snapshot.windowLayouts[key] from src/frontend/dialogs/window-layout-context.ts. |
| windowLayouts.save(key, geometry) | The existing InterfaceController setWindowGeometry callback. Omit the layout host for read-only detached tools. |

Keep existing application theme CSS active during import migration. The shared opt-in stylesheet is for independent consumers and demos; adding it over the full application theme can duplicate selectors. Keep one installHoverInput owner in each document as already connected through dom-input.

## Connection groups

- [ ] Wire each application host before replacing its dependent components. Keep local icon catalogs, commands, settings data and storage services with the application.
- [ ] Move KoMandir Portal, Dialog, Popover, portal.ts, overlay-focus.ts and their callers together. A document must not have two independent overlay or submenu stacks.
- [ ] Move Rachana popup/tooltip/dialog components with their portal/menu helpers and callers. Preserve existing Escape and pointer-focus ownership.
- [ ] Connect the remaining presentation controls in small groups, with current props and callbacks. Use package imports for new features and document a focused extension when a capability is missing.
- [ ] Check language changes, theme changes, keyboard/pointer focus, nested popups and persisted geometry in each real host. Check native icon loading on supported platforms separately from the memory demo.
- [ ] After callers and checks use the shared source, move superseded local implementations into .deleted. Preserve unrelated changes and follow the consumer stash rules before reverting temporary work.

These are connection tasks. They do not require choosing one visual or keyboard variant for both applications.
