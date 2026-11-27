# UI color roles

## Purpose

- Give shared presentation code semantic color names without changing existing component palettes.

## Ownership

- rachana.css and komandir.css expose opt-in aliases from application-owned tokens. README.md owns the mapping, root contract and limits.
- Applications own palettes, system-mode selection, persistence, contrast decisions and product-specific colors. Shravanam uses the Rachana adapter because its approved controls use those tokens.

## Local Contracts

- This package contains CSS only. Do not add a runtime, automatic theme selection, layout rules or default application colors.
- Keep mappings one-way from existing tokens to --karatala-color-*. Do not feed aliases back into their source tokens.
- Select one adapter on document.documentElement. Portals need the same document theme. Recompute aliases on the root where their source values change.
- Keep accent/focus and control/popup coupling explicit. Do not imply that one color value can independently style every legacy state.
- Color roles do not authorize changes to component dimensions, state, focus, selection meaning or application content colors.

## Verification

- The demo /themes page uses real controls in isolated documents. Check live source-token updates, preserved control state, root/portal inheritance and both palette modes. Type checks alone do not verify CSS resolution.

## Child DOX Index

- No child scopes.
