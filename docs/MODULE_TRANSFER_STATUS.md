# Common module transfer

Owner: karatala-ts owns source, public contracts, provenance and portable checks. Applications own connection, release assets, saved data, permissions and native acceptance. The existing KoMandir SHARED-REPOSITORY-REVIEW.md M02-M08 and Rachana SHARED_REPOSITORY_PLAN.md remain the source baseline; this file does not duplicate their application plans.

| Module | Found/matched | Extracted | Consumer connection | Verified |
| --- | --- | --- | --- | --- |
| M02 release discovery/orchestration | ✅ Rachana independent core | ✅ @karatala/web-updater root, byte-identical source | [ ] Applications retain their existing integration; Rachana remains on hold | ✅ Release/runtime/save-order checks passed |
| M03 Bun/ZIP and optional Capacitor | ✅ Rachana independent host entries | ✅ Explicit /bun, /zip, /capacitor entries, byte-identical source | [ ] Requires immutable build metadata, whole-map serving, readiness/watchdog, runtime/data compatibility and app save/flush | ✅ ZIP/Bun recovery checks passed; [ ] Capacitor/native checks separate |
| M04 offline shell | ✅ Three existing policies retained | ✅ @karatala/offline-shell source generators | [ ] Shravanam connection prepared; Rachana source unchanged | ✅ Generated-script memory checks passed; [ ] consumer/browser acceptance pending |
| M07 browser picker/drop | ✅ Shravanam filter boundary identified | ✅ @karatala/browser-files with caller options | [ ] Shravanam media adapter prepared | ✅ Memory capture/cancel/fallback checks passed; [ ] OS picker/grants separate |

## Transfer boundaries

- Core import does not load Bun or Capacitor. Importing a package never starts a check, selects an update, registers a worker or opens a picker.
- Automatic update checking is not activation. Retain release URL, checksum, runtime, staging, failed-attempt and rollback checks. The original updater has no caller cancellation API and cannot enforce the application's optional save callback on its own.
- Offline production, development reload and native package deployment are different mechanisms. The extracted workers do not add LAN reload to production or put audio/projects into the shell cache.
- Browser handles, Android URI grants and host paths are distinct. M08 journaled profile writes, guarded executor, archives, privileged approvals and operation recovery stay with their application owners; no all-platform file service is introduced.
- [ ] M05 LAN dev/reload and M06 Android build/install helpers remain separate transfers. No app IDs, native overlays, device selection, signing or build/deploy entries are copied into these runtime packages.

## Delivery and acceptance

Shravanam connection was saved in the named Git stash `prepared shared offline and browser files 20261126`. The user authorized dependencies/checks on continuation. Restore that source for local verification; consumer repositories pin only a shared commit delivered through upstream.

- ✅ Exact source revisions/hashes and adaptations are in module-provenance.json. Package licenses and owning AGENTS files are included.
- ✅ Authorized shared checks passed: 44 tests, 104 assertions; package type checks passed for browser-files, offline-shell and web-updater core/Bun/ZIP. Source updater files remain byte-identical. Optional Capacitor peers were not installed; its types/native lifecycle remain separate. No application release, package installation or deployment was executed by these tests.
- [ ] Deliver that commit through upstream before pinning consumer repositories. The agent never pushes.
- [ ] Record Shravanam source connection and consumer validation in its FEATURE_PLAN.md. Device/native results stay separate from source and memory tests.
- [ ] Connect updater hosts only after each application's build metadata, startup readiness, watchdog and final save/flush are concrete. An extracted library is not an activated application update feature.
