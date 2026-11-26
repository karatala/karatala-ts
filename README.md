# karatala-ts

Shared TypeScript packages for Rachana, KoMandir, Shravanam and future applications.

| Package | Scope | Status |
| --- | --- | --- |
| [@karatala/dom-input](packages/dom-input/README.md) | Pointer focus release and document hover ownership | Connected to Rachana and Shravanam; portable checks passed, device coverage remains separate |
| [@karatala/ui-rachana](packages/ui-rachana/README.md) | Existing Rachana UI variants | 31 components extracted with local helpers/styles and host callbacks; connection pending |
| [@karatala/ui-komandir](packages/ui-komandir/README.md) | Existing KoMandir UI variants | All 35 components extracted with local helpers/styles and host callbacks; connection pending |

Consumers use a pinned Git submodule at `vendor/shared` and depend only on the required package folders. There is no umbrella runtime entry or root installation script. UI variants retain their existing props, behavior, theme roles and source names. Extraction does not wait for exhaustive comparison; unify variants only when a common replacement is selected. Common theme normalization, updates and platform adapters remain future work.

See [first consumer connection](docs/m01-connection.md). Applications keep commands, storage, permissions and their input policies.

[UI connection](docs/ui-connection.md) maps the application callbacks, mount points and overlay ownership needed by both UI packages. Source transfer and memory examples are complete; real application connection remains a separate step.

The [component catalog](demo/README.md) has one page per component plus shared family pages for side-by-side review. Start it with `bun run demo` and open http://127.0.0.1:3212/. `bun run check:demo` checks the packages and examples. [UI_TRANSFER_STATUS.md](docs/UI_TRANSFER_STATUS.md) records extraction, checks and remaining consumer work. There are no root install hooks or implicit native tools.
