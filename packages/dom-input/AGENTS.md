# DOM input

## Purpose

- Own the unchanged M01 helpers extracted from Rachana and Shravanam.

## Ownership

- `src/pointer-focus.ts` releases pointer focus on the target window's next frame.
- `src/hover-input.ts` owns document hover listeners and returns their disposer.
- `tests/hover-input.test.ts` preserves the existing Rachana DOM checks. `README.md` records provenance and limitations.

## Local Contracts

- Preserve event timing, the ambient HTMLElement check and the previous hover attribute on disposal.
- Use one hover owner per document. The caller installs and disposes it; importing the package does nothing.
- Do not add app shortcut rules, UI styles or unconditional KoMandir focus release.
- Runtime code has no dependencies. Bun and happy-dom are test tools only.

## Verification

- When authorized, run `bun test ./tests` from this package after its test dependencies are available. The lockfile retains the source consumer's exact dependency resolutions.
- Package tests do not prove native touch/pen, WebView, iframe focus or consumer integration.

## Child DOX Index

- No child scopes.
