# M01 consumer connection

Owner: karatala-ts. Source plans: Rachana `SHARED_REPOSITORY_PLAN.md` §7 and `UI_COMPONENT_LIBRARY_PLAN.md` §7.77 at `b3fb6ee66a8869366ddf96205ff9fc6bfb39ccc5`; KoMandir `SHARED-REPOSITORY-REVIEW.md` M01.

## Delivery boundary

- ✅ Prepare the shared package and local commit first.
- [ ] Deliver that commit to `karatala/karatala-ts` upstream. Push requires a separate user instruction. Until then, keep consumer Git pins on available upstream commits and their current local implementations working.
- [ ] Add `vendor/shared` to Rachana and Shravanam using `https://github.com/karatala/karatala-ts.git`, then pin the delivered commit. Do not record a machine-local clone URL in .gitmodules.

## Dependency and imports

Each consumer adds this dependency to its own package.json, then updates its lockfile and installed resolution in an authorized dependency-install step:

```json
"@karatala/dom-input": "file:vendor/shared/packages/dom-input"
```

Use `import { releasePointerFocus } from "@karatala/dom-input"` or `import { installHoverInput } from "@karatala/dom-input"`. Preserve all call sites, callback order, mounting and disposal. No aliases or application-to-application imports are needed.

| Consumer | Imports to replace |
| --- | --- |
| Rachana pointer focus | `src/frontend/ui/{UiButton,UiPositionSlider,UiResizeHandle,UiValueControl}.svelte` |
| Rachana hover | `src/frontend/App.svelte`, `src/frontend/editor/detached-panel-window.ts`, `src/app/metronome-window.ts`, `src/frontend/files/FileUiPlayground.svelte` |
| Shravanam pointer focus | `src/{AndroidDownloads,App,LibraryPanel,LibrarySchedule,LibraryTools,NativeLibraryTools,PlaybackTimeline,Player,SegmentedControl,SegmentedFilter,SleepPanel,SourceTools,SourcesPanel}.svelte` |
| Shravanam hover | `src/main.ts` |

- [ ] Archive the superseded Rachana pointer-focus/hover-input files and Shravanam pointer-input under each project's `.deleted/` after import replacement. Do not retain a second active implementation or delete uncommitted work.
- [ ] Change the Rachana hover-test import to the package so it remains a consumer-resolution check. Keep `switch-interaction.test.ts` and hover-style checks. Shared tests own the portable helper behavior.
- [ ] Update Rachana playground source references and nearest AGENTS contracts. Update Shravanam's application-base/shared-input ownership. Preserve all other catalog IDs and UI policies.
- [ ] Verify package resolution in both consumers with their existing tools when authorized. Check that no second Svelte runtime or native dependency is introduced.
- [ ] Run mouse/keyboard focus and hover cleanup checks; record real touch/pen, WebView and multi-document results separately.

KoMandir does not import this package for M01: its file-navigation focus policy remains unchanged. Its submodule can advance to the delivered shared commit independently of runtime adoption.
