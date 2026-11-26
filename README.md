# karatala-ts

Shared TypeScript packages for Rachana, KoMandir, Shravanam and future applications.

| Package | Scope | Status |
| --- | --- | --- |
| [@karatala/dom-input](packages/dom-input/README.md) | Pointer focus release and document hover ownership | Connected to Rachana and Shravanam; portable checks passed, device coverage remains separate |
| [@karatala/ui-rachana](packages/ui-rachana/README.md) | Existing Rachana UI variants | First three independent components extracted; connection pending |
| [@karatala/ui-komandir](packages/ui-komandir/README.md) | Existing KoMandir UI variants | First eight components and local dependencies extracted; connection pending |

Consumers use a pinned Git submodule at `vendor/shared` and depend only on the required package folders. There is no umbrella runtime entry or root installation script. UI variants retain their existing props, behavior, theme roles and source names. Extraction does not wait for exhaustive comparison; unify variants only when a common replacement is selected. Common theme normalization, updates and platform adapters remain future work.

See [first consumer connection](docs/m01-connection.md). Applications keep commands, storage, permissions and their input policies.
