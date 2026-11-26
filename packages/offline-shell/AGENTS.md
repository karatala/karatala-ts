# Offline shell workers

## Purpose

- Own explicit standalone worker generation while preserving existing production and development policies.

## Ownership

- index.ts returns classic worker source without registering a worker. Each installer is self-contained because its function source is serialized. scope.ts describes only the standard worker APIs used by these functions.
- listed-shell derives from Shravanam: intercept only listed shell assets; audio and other requests remain outside the cache. cached-shell derives from Rachana: reload requests can refresh cached files, source/dependency routes are excluded. development-shell derives from Rachana's network-first development cache and bounded manifest batches.

## Local Contracts

- Applications supply namespace, revision, file list and explicit activation message or development manifest path. Include generated worker logic and current shell bytes in the application cache revision. Keep app IDs, build workflow and update/save policy outside this package.
- No I/O or worker registration on import/source generation. A generated worker installs listeners only when the application explicitly serves/registers it. Never add automatic skipWaiting or page reload to the listed shell.
- Delete only older production caches of the same namespace and registration scope. Keep the development cache separate. Do not silently replace one policy with another or cache user media/projects.
- Any installer helper must remain inside its serialized function. A generated-source execution check must catch accidental closure or module dependencies.

## Verification

- tests runs generated scripts with in-memory cache/network/events: scope isolation, listed-only interception, activation timing, install failure, explicit reload and development fallback/batches. Application and browser worker acceptance remain separate.

## Child DOX Index

- No child scopes.
