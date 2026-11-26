# Offline shell workers

Explicit classic worker source generation, extracted from Rachana and Shravanam. Importing this package and generating source perform no I/O, register no worker and request no activation. There are no Svelte, Bun or native runtime dependencies. GPL v3 and source hashes are retained in ../../docs/module-provenance.json.

| Generator | Source policy | Caller data |
| --- | --- | --- |
| listedShellWorkerSource | Shravanam cache-first for declared shell URLs only; other requests, including media, are untouched | namespace, revision, files |
| cachedShellWorkerSource | Rachana cache-first with explicit reload refresh and development-route exclusion | namespace, revision, files, activationMessage |
| developmentShellWorkerSource | Rachana network-first, cache fallback after failure, batches of eight manifest assets; reload does not fall back | namespace, revision, manifestPath, activationMessage |

```ts
import { listedShellWorkerSource } from "@karatala/offline-shell";
const script = listedShellWorkerSource({ namespace: "example-shell", revision: shellRevision, files: ["index.html", "main.js", "icon.png"] });
// The application's explicit build/serve step writes script as service-worker.js.
// The application owns registration and its safe update/activation boundary.
```

Preserve the chosen policy. The listed shell does not call skipWaiting; old clients close before a new version activates. The other two accept only the caller's explicit activation message. Production cleanup removes only older caches with the same application namespace and registration scope. Development cache lifetime is separate. Navigation and the development manifest resolve relative to the registration scope, including subpath hosting.

The application supplies its shell file list and hashes the generated worker policy plus current shell bytes for the revision. Never list user audio, projects or private content as shell assets. App-specific URLs, identifiers, production/dev selection, registration, save/flush and update UI stay outside the package. Shravanam's normal development still does not install a worker.

Each installer is self-contained so its function source can be serialized into a standalone script without an import request. Tests execute that actual generated script with memory caches/network/events. They cover listed-only interception, namespace/scope isolation, failed install, explicit activation/reload and development batches/fallback. Browser lifecycle, real storage quotas and native acceptance need consumer checks.
