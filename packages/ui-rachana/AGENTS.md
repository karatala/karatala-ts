# Rachana UI variants

## Purpose

- Own existing Rachana components copied with their public props, behavior and styles intact.

## Ownership

- The explicit exports in package.json and README.md form this package's current catalog. Source provenance is in README.md.

## Local Contracts

- Keep these variants separate from KoMandir controls. A shared repository does not require equal behavior or appearance.
- Accept data and callbacks; do not import application source, translation providers or the editor.
- Preserve the existing theme-role names for now. Consumers supply their theme values and compile Svelte with one peer runtime.
- Copy the complete local dependency closure when adding a component. Isolate a host dependency only when required for that transfer.
- Compare two variants only when choosing a common replacement or changing a contract. Exhaustive cross-project comparison is not a prerequisite for extraction.

## Verification

- Record copied source, consumer connection and runtime checks separately. Run installation/build/device checks only when requested.

## Child DOX Index

- No child scopes.
