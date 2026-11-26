# Shared TypeScript contracts

## Purpose

- Own portable packages for Rachana, KoMandir, Shravanam and future consumers.

## Ownership

- Each package owns its implementation, contract, provenance and checks. Applications own commands, data, persistence, permissions and activation policy.
- `packages/dom-input/AGENTS.md` owns M01. Other packages are not approved by its presence.
- `packages/ui-rachana/AGENTS.md` and `packages/ui-komandir/AGENTS.md` own the preserved UI variants from each application. Extract ready components with their dependency closure; compare variants only when choosing a common replacement or changing behavior.

## Local Contracts

- Never import application source. Importing a package must not start services, request permissions or perform I/O.
- Keep packages independently consumable. A DOM helper must not require Svelte, Bun, native bridges or Android tools at runtime.
- Preserve source licenses and notices. Keep generated files, local settings and node_modules outside Git.
- Keep APIs focused. Shared controls must follow their approved contract; do not combine incompatible behaviors with many flags.
- Record extraction, consumer connection and verification separately. Consumers pin a commit available from upstream.

## Work Guidance

- Read the nearest contract before editing. Update ownership and source records when behavior changes.
- Use simple English. Do not hard-wrap prose or use em dashes.
- Commit completed requested changes locally. Never push. Run installation, tests, builds and deployment only when requested.

## Child DOX Index

- `packages/dom-input/AGENTS.md`: DOM focus/hover helpers and their tests.
- `packages/ui-rachana/AGENTS.md`: preserved Rachana component variants.
- `packages/ui-komandir/AGENTS.md`: preserved KoMandir component variants and overlay cluster.
