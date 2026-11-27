# Common module transfer

Owner: karatala-ts owns source, public contracts, provenance and portable checks. Applications own connection, release assets, saved data, permissions and native acceptance. The existing KoMandir SHARED-REPOSITORY-REVIEW.md M02-M08 and Rachana SHARED_REPOSITORY_PLAN.md remain the source baseline; this file does not duplicate their application plans.

| Module | Found/matched | Extracted | Consumer connection | Verified |
| --- | --- | --- | --- | --- |
| M02 release discovery/orchestration | ✅ Rachana independent core | ✅ @karatala/web-updater root, byte-identical source | ✅ Rachana imports the public core; [ ] KoMandir and Shravanam | ✅ Release/runtime/save-order checks and Rachana consumer checks passed |
| M03 Bun/ZIP and optional Capacitor | ✅ Rachana independent host entries | ✅ Explicit /bun, /zip, /capacitor entries, byte-identical source | ✅ Rachana connects build metadata, host entries, readiness/watchdog and save/flush; [ ] other applications | ✅ Rachana package types and Bun/ZIP recovery checks passed; [ ] native/Capacitor lifecycle acceptance |
| M04 offline shell | ✅ Three existing policies retained | ✅ @karatala/offline-shell source generators | ✅ Shravanam listed shell; Rachana cached production and network-first development shells | ✅ Generated-script checks and isolated real-worker browser checks in both consumers; [ ] target-device acceptance |
| M07 browser picker/drop | ✅ Shravanam filter boundary identified | ✅ @karatala/browser-files with caller options | ✅ Shravanam media adapter retains its filters and caller types | ✅ Memory checks and consumer picker callback check passed; [ ] native picker/grants |

## Transfer boundaries

- Core import does not load Bun or Capacitor. Importing a package never starts a check, selects an update, registers a worker or opens a picker.
- Automatic update checking is not activation. Retain release URL, checksum, runtime, staging, failed-attempt and rollback checks. The original updater has no caller cancellation API and cannot enforce the application's optional save callback on its own.
- Offline production, development reload and native package deployment are different mechanisms. The extracted workers do not add LAN reload to production or put audio/projects into the shell cache.
- Browser handles, Android URI grants and host paths are distinct. M08 journaled profile writes, guarded executor, archives, privileged approvals and operation recovery stay with their application owners; no all-platform file service is introduced.
- [ ] M05 LAN dev/reload and M06 Android build/install helpers remain separate transfers. No app IDs, native overlays, device selection, signing or build/deploy entries are copied into these runtime packages.

## Delivery and acceptance

The initial module set was delivered in 7031990. Rachana connected updater/offline in f37a9993. Shravanam connected offline/browser-files and records its checks in FEATURE_PLAN.md. Existing preparation stashes are retained backups, not pending application connections. Each consumer records its current shared pin in Git; historical transfer commits below are not instructions to move a consumer backwards.

- ✅ Exact source revisions/hashes and adaptations are in module-provenance.json. Package licenses and owning AGENTS files are included.
- ✅ Authorized shared checks passed: 44 tests, 104 assertions; package type checks passed for browser-files, offline-shell and web-updater core/Bun/ZIP. Source updater files remain byte-identical. Rachana's full consumer type check also resolves its existing Capacitor peers. Native lifecycle acceptance remains separate.
- ✅ Consumer connection and browser checks are recorded by [Rachana](https://github.com/karatala/Komprohit/blob/dev/SHARED_REPOSITORY_PLAN.md) in sections 10-11 and by [Shravanam](https://github.com/karatala/shravanam/blob/dev/FEATURE_PLAN.md) in its shared-module section. Application owners maintain those records.
- [ ] Connect KoMandir and Shravanam updater hosts only after each application's build metadata, startup readiness, watchdog and final save/flush are concrete. An extracted library is not an activated application update feature.
- [ ] Native and target-device acceptance remains application-owned. The agent never pushes or runs a release workflow as part of a source transfer.
