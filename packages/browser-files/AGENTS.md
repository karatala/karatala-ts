# Browser file input

## Purpose

- Own browser file selection and synchronous drop capture without product filters or native host paths.

## Ownership

- src/index.ts derives from Shravanam browser-files.ts. Applications supply picker types and multiplicity and own media validation, permissions, persistence, commands and fallback UI.

## Local Contracts

- Importing performs no I/O. pickBrowserFiles is called only from a user gesture; null means unsupported, while native cancellation/getFile failures reject. Never request write permission or convert a browser filename into a server path.
- Capture data.items, getAsFile and handle promises during the drop event. Ignore directory handles, retain file fallback after handle failure, and use data.files when there are no file items. No AbortSignal API is claimed.

## Verification

- tests checks caller options/receiver, unsupported/cancel/read failures and drop lifetime/fallback using memory File/handle records. This does not verify an OS picker or persisted grants.

## Child DOX Index

- No child scopes.
