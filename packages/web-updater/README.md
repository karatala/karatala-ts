# Web bundle updates

Extracted unchanged from Rachana modules/web-updater. This updates a native application's HTML/JS/CSS and runtime assets. It does not install EXE/APK packages. See ../../docs/module-provenance.json for exact revisions and hashes; the package retains GPL v3.

| Entry | Runtime dependencies | Ownership |
| --- | --- | --- |
| @karatala/web-updater | Standard fetch, streams, URLs | Public GitHub release discovery, metadata/runtime checks and explicit orchestration |
| @karatala/web-updater/bun | Node-compatible fs/path/crypto and ZIP/zlib, checked in Bun | Verified staging, complete asset maps, trial/rollback and retained failed attempts |
| @karatala/web-updater/zip | node:zlib | Bounded ZIP names, size and CRC validation |
| @karatala/web-updater/capacitor | Optional @capacitor/core 8 and @capgo/capacitor-updater 8.54.0 | Manual Capgo lifecycle and application-native WebUpdateInfo startup handshake |

The root export imports no host. Importing never starts a check. Callers supply UpdateSource { repository, manifestName, archiveName }, WebBuild { appId, runtime, version, revision, sequence }, and a WebUpdateHost. Asset patterns can contain {tag}; exact release tags remain in encoded GitHub URLs. Keep complete build metadata and archive limits from the source module.

```ts
import { createWebUpdater, checkForWebUpdate } from "@karatala/web-updater";
const updater = createWebUpdater(source, runningBuild, host);
await updater.ready(); // Only after successful application startup.
const check = await checkForWebUpdate(source, runningBuild); // Metadata only.
await updater.update(false); // Also downloads and schedules for a later launch.
await updater.update(true, saveAndFlush); // Explicit user action, after preparation.
```

Automatic discovery is not automatic reload. The existing beforeActivate callback is optional, and applyPrepared has no save callback: applications must wrap every immediate activation route with their save/flush barrier. No periodic checking, caller AbortSignal or disposer is supplied. Existing metadata/download timeouts remain. Release trust comes from the configured public GitHub repository; SHA-256/CRC detect damaged content rather than a compromised release account.

Bun callers explicitly create createBunUpdateHost(cacheDirectory, builtinBuild, repository). Creation selects/recovers state and performs cache I/O. Serve its full selected asset map or the full embedded map, never a mixture. Confirm after successful startup and wire rollbackUnconfirmed to the application's startup watchdog. Keep the cache dedicated to one app/host owner, outside settings and user data. Node compatibility is not verified merely because the imports use node: names.

Capacitor callers must implement immutable builtin metadata and coldStart through WebUpdateInfo before opening application storage. Keep manual plugin configuration, blank cloud/stats URLs, native readiness timeout and retained failed bundles. This source transfer does not install a plugin, change a native manifest or establish device support. Rachana's native overlays remain the reference; no app/native imports are copied here.

Run bun test packages/web-updater/tests from the shared root when checks are authorized. The source tests cover release/runtime selection, save ordering, ZIP integrity and Bun staging/recovery with mocked HTTP and ignored fixtures. The package type check covers core/Bun/ZIP. Capacitor requires optional peers and separate native checks. Application IDs, release/build generation, scheduling, permissions, data compatibility and activation decisions stay with the consumer.
