# UI color roles

An optional CSS-only layer for shared presentation. Existing Rachana and KoMandir controls keep their native tokens, sizes, styles and behavior. The aliases read the application's current palette. They do not install a new palette or select light/dark mode.

```ts
import "@karatala/ui-theme/rachana.css";
document.documentElement.dataset.karatalaTheme = "rachana";
```

KoMandir uses komandir.css and data-karatala-theme="komandir". Shravanam uses rachana.css with its existing Rachana control tokens. Install the selected adapter on the document root, together with the existing control styles and application palette. Each detached window or iframe owns its document theme. A subtree override does not recompute an alias inherited from its ancestor; restate the aliases at that boundary or use a separate themed document. Existing controls also portal to their document.

New shared presentation can use background: var(--karatala-color-background) and color: var(--karatala-color-text). Existing controls continue to read their original tokens. Change the application's source values to recolor both; setting an alias alone changes only presentation that reads it. Do not define a source token in terms of its own alias because that creates a variable cycle.

| Role suffix after --karatala-color- | Rachana source | KoMandir source |
| --- | --- | --- |
| background | --ui-surface | --theme-workbench-background |
| control | --ui-control-surface | --theme-workbench-raised |
| control-hover | --ui-control-hover | --theme-workbench-hover |
| field | --ui-field-surface, then --ui-control-surface | --theme-workbench-input |
| popup | --ui-menu-surface | --theme-workbench-surface |
| text | --ui-text | --theme-workbench-foreground |
| muted | --ui-text-muted | --theme-workbench-muted |
| accent | --ui-accent-fill | --theme-workbench-accent |
| on-accent | --ui-on-accent | --theme-workbench-background |
| focus | --ui-accent | --theme-workbench-accent |
| selection | --ui-table-selected-surface, then system Highlight | --theme-list-selectionBackground |
| on-selection | --ui-table-selected-text, then system HighlightText | --theme-list-selectionForeground |

The popup role describes the MiniPopup shell. KoMandir uses workbench-surface for that shell and workbench-raised for default controls and Dropdown lists. Focus and accent share a source; primary button text uses the workbench background. Rachana can use different focus/accent/on-accent values. Selection and accent remain distinct roles. The /themes demo shows these contracts, with explicit preview adjustments that keep buttons visible against popup surfaces.

Disabled opacity, active/hover derivation, danger/notice colors, keycaps, icon artwork and popup shadows remain with their existing style owners. Notation, playback, track colors, file comparison status and syntax colors remain application roles. Do not use a generic accent to replace those meanings.

This first adapter is available to consumers but is not yet connected to their application roots. The shared demo owns memory examples; application plans own later connection and device acceptance. See ../../docs/UI_GUIDE.md and ../../docs/THEME_STATUS.md.

Color aliases do not isolate the legacy global selectors. Select the host's prepared control/style variant; do not load both complete variant stylesheets into one document without reviewing their collisions. Family and theme comparisons use independent iframe documents.
