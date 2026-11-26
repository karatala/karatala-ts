# Web bundle updater

## Purpose

- Own the extracted Rachana release/update mechanism without application imports.

## Ownership

- The root export is core.ts only: release validation, compatibility and explicit orchestration. /bun owns verified local staging, complete asset maps, trial confirmation and rollback; /zip owns bounded ZIP paths/size/CRC checks. /capacitor owns the optional Capgo/WebUpdateInfo adapter.
- All four implementation files retain their source bytes. docs/module-provenance.json records the source revision and hashes. Applications own repository/asset patterns, build metadata, runtime fingerprint, startup watchdog, save/flush and activation decisions.

## Local Contracts

- Importing an entry never starts an update. Core needs standard fetch/streams only. Do not import Bun, ZIP or Capacitor through the root export. Capacitor/Capgo are optional peer dependencies and require the native startup handshake before application storage.
- update(false) checks, stages and schedules; it is not a read-only check. checkForWebUpdate only discovers. Immediate activation and applyPrepared require the application to enforce save/flush. Preserve this contract rather than silently changing the original API.
- Keep compatible app/runtime/release checks, exact public GitHub asset URLs, archive size/hash and ZIP CRC/path limits. Never write into application data collections. Retain failed attempts and previous bundles; confirm a trial only after successful startup.
- There is no caller AbortSignal/disposer contract. Existing metadata/download timeouts remain. Do not claim native/device acceptance from source transfer or portable tests.

## Work Guidance

- Preserve source behavior and GPL notices. New capabilities need a real consumer; never transfer a product file executor into this package.
- Installation, checks and native workflows require the user's request. Never push.

## Verification

- tests contains the adapted source core/ZIP/Bun tests with mocked HTTP and isolated ignored tmp/ fixtures, archived under .deleted/ afterward. The package check covers core/Bun/ZIP; Capacitor types/device checks require its optional peers and native overlays.

## Child DOX Index

- No child scopes.
