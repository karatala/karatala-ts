# karatala-ts

Shared TypeScript packages for Rachana, KoMandir, Shravanam and future applications.

| Package | Scope | Status |
| --- | --- | --- |
| [@karatala/ui-bootstrap](packages/ui-bootstrap/README.md) | Static loading, emergency and window controls without Svelte | Derived from Rachana DOM startup UI; caller owns language, failures and actions |
| [@karatala/ui-theme](packages/ui-theme/README.md) | Optional semantic color aliases over existing palettes | CSS only; demo connection, application roots remain separate |
| [@karatala/web-updater](packages/web-updater/README.md) | Release/core plus explicit Bun/Capacitor/ZIP entries | Connected to Rachana; other consumer hosts and native acceptance remain separate |
| [@karatala/offline-shell](packages/offline-shell/README.md) | Standalone worker generators with three preserved cache policies | Connected to Rachana and Shravanam; no worker registration on import |
| [@karatala/browser-files](packages/browser-files/README.md) | Read-only browser picker and drop capture | Connected to Shravanam with caller-owned media filters |
| [@karatala/dom-input](packages/dom-input/README.md) | Pointer focus release and document hover ownership | Connected to Rachana and Shravanam; portable checks passed, device coverage remains separate |
| [@karatala/ui-rachana](packages/ui-rachana/README.md) | Existing Rachana UI variants | 32 components extracted with local helpers/styles and host callbacks |
| [@karatala/ui-komandir](packages/ui-komandir/README.md) | Existing KoMandir UI variants | All 35 components extracted with local helpers/styles and host callbacks |

Consumers use a pinned Git submodule at `vendor/shared` and depend only on the required package folders. There is no umbrella runtime entry or root installation script. UI variants retain their existing props, behavior, theme roles and source names. Extraction does not wait for exhaustive comparison; unify variants only when a common replacement is selected. Common palette generation, remaining updater hosts, development tooling and platform adapters remain future work.

See [first consumer connection](docs/m01-connection.md). Applications keep commands, storage, permissions and their input policies.

The [component guide](docs/UI_GUIDE.md) defines prepared control use for new features. The [theme contract](packages/ui-theme/README.md) and [status](docs/THEME_STATUS.md) separate color aliases from application palettes. Inspect /guide and /themes in the running demo.

[UI connection](docs/ui-connection.md) maps the application callbacks, mount points and overlay ownership needed by both UI packages. Source transfer and memory examples are complete. Consumer repositories own their current connection and acceptance records.

The [component catalog](demo/README.md) has one page per component plus shared family pages for side-by-side review. Start it with `bun run demo` and open http://127.0.0.1:3212/. `bun run check:demo` checks the packages and examples. [UI_TRANSFER_STATUS.md](docs/UI_TRANSFER_STATUS.md) records extraction, checks and remaining consumer work. There are no root install hooks or implicit native tools.

[MODULE_TRANSFER_STATUS.md](docs/MODULE_TRANSFER_STATUS.md) records common update, offline and browser-file source transfer separately from consumer connection and native acceptance. New module checks use `bun run test:modules` when authorized; each package has its own `check` script.
