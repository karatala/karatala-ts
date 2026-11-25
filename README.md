# karatala-ts

Shared TypeScript packages for Rachana, KoMandir, Shravanam and future applications.

| Package | Scope | Status |
| --- | --- | --- |
| [@karatala/dom-input](packages/dom-input/README.md) | Pointer focus release and document hover ownership | Extracted locally; consumer connection and verification pending |

Consumers use a pinned Git submodule at `vendor/shared` and depend only on the required package folders. There is no umbrella runtime entry or root installation script. UI components, themes, updates and platform adapters are not included yet.

See [first consumer connection](docs/m01-connection.md). Applications keep commands, storage, permissions and their input policies.
