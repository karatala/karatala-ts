# KoMandir UI variants

Existing controls and local helpers with their original props, behavior and CSS.

```ts
import Button from "@karatala/ui-komandir/Button.svelte";
import DataTable from "@karatala/ui-komandir/DataTable.svelte";
import TableRow from "@karatala/ui-komandir/TableRow.svelte";
```

Also exported: MessageBar, PathLabel, Portal, Dialog and Popover, plus their CSS and path/portal/overlay helpers. The package has only a Svelte 5 peer and no installation/build hooks. The application compiles the source and supplies the existing `--theme-workbench-*`, `--theme-list-*` and `--ui-*` roles. Imported CSS retains the source selectors, including controls.css global field rules. MessageBar is semantic markup; Dialog/Popover provide behavior and accept caller-owned classes/styles. They do not create a new window design.

Adopt Portal, Dialog, Popover, portal.ts and overlay-focus.ts as one group with all related callers. Their shared stack must not coexist with a second local overlay stack in the same document. File-table commands, selection ownership, path access and persisted window geometry remain application responsibilities.

Source: KoMandir in the Bun utilities repository, revision `ffb699e5b5d31007932ebe912dc5e20d3d77cad4`, `folder-sync/src/web/ui/`: Button, DataTable, TableRow, MessageBar, PathLabel, Portal, Dialog, Popover, controls.css, data-table.css, table-row.css, path-label.ts, portal.ts and overlay-focus.ts. All fourteen files are copied byte for byte. GPL v3 license text and original notices are retained.

- ✅ Extracted eight controls and their six local CSS/helper files.
- [ ] Deliver the shared commit and connect consumers. Current application imports still use local implementations.
- [ ] Verify consumer resolution and behavior after connection.

The next group includes the preferred check controls, close controls and ColorPicker. Their common icon/translation dependencies need a small application boundary; copying the current Icon component would also copy icon-theme requests and file-command dependencies. This is a transfer dependency, not a requirement for an exhaustive UI comparison.
