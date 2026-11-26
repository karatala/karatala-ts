# KoMandir UI variants

## Purpose

- Own existing KoMandir controls and their local DOM helpers with current behavior and styles.

## Ownership

- package.json lists explicit component, CSS and helper exports. README.md records provenance and integration limits.

## Local Contracts

- Preserve public props and existing KoMandir theme roles. Keep these variants separate from Rachana controls until a common replacement is chosen.
- Do not import application source, filesystem policy, Settings or native services.
- Portal, Dialog, Popover and overlay-focus form one overlay cluster. Connect the cluster together so one document does not get two independent overlay stacks.
- controls.css retains existing global selectors. Consumers own theme roles and document styling; do not present it as an isolated theme reset.
- Copy the full local dependency closure. Only application-dependent code needs an adapter; extraction does not require a behavior redesign.

## Verification

- Distinguish source extraction, application connection and runtime checks. Run install/build/device checks only when requested.

## Child DOX Index

- No child scopes.
