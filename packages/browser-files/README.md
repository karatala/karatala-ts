# Browser file input

Read-only picker and drop capture extracted from Shravanam src/browser-files.ts. It has no Svelte, playback, Bun or native runtime dependency. GPL v3 and exact source provenance are retained.

```ts
import { pickBrowserFiles, droppedBrowserFiles } from "@karatala/browser-files";
// Call from a user gesture; the application owns these filters and the fallback UI.
const selected = await pickBrowserFiles({ multiple: true, types: [{ description: "Documents", accept: { "text/plain": [".txt"] } }] });
// Call during the original drop event, before its data store closes.
const dropped = await droppedBrowserFiles(event.dataTransfer);
```

Results contain { file, handle? }. null from the picker means unsupported; cancellation and getFile errors reject as before. Drop handle failures retain the captured File; directory handles are ignored, and legacy data.files is used when there are no file items. The mechanism does not request read/write grants, persist handles, validate media, open files in a player or turn browser filenames into host paths. There is no AbortSignal contract.

Shravanam keeps Audio / Video, its extension list and BrowserMediaFile alias in its thin application adapter. Other applications supply their own filters. Tests use memory File/handle records for options, unsupported/cancel/read failures and synchronous capture/fallback; real picker and grant acceptance remain with each consumer.
