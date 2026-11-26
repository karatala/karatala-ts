<script lang="ts">
  import type { ComponentProps } from "svelte";
  import UiButton from "./UiButton.svelte";
  import UiIcon from "./UiIcon.svelte";
  type Props = { checked: boolean; mixed?: boolean; compact?: boolean; onchange: (checked: boolean, event: MouseEvent) => void } & Omit<ComponentProps<typeof UiButton>, "active" | "children" | "onchange" | "onclick">;
  let { checked, mixed = false, label, text = label, title, path, compact = false, disabled = false, class: className = "", onchange, ...buttonProps }: Props = $props();
</script>

<UiButton
  {...buttonProps}
  class={`ui-checkbox-button ${compact ? "is-compact-checkbox" : ""} ${className}`}
  {label}
  {title}
  {disabled}
  {text}
  active={mixed ? "mixed" : checked}
  onclick={event => onchange(!checked, event)}>
  <span class="checkbox-mark" class:is-checked={checked || mixed} aria-hidden="true">
    <UiIcon path={mixed ? "M5 11H19V13H5Z" : "M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59Z"} size={14} />
  </span>
  {#if path}
    <span class="checkbox-icon" aria-hidden="true"><UiIcon {path} size={16} /></span>
  {/if}
</UiButton>

<style>
  :global([data-appearance] .ui-checkbox-button.ui-button.is-control) { display: grid; box-sizing: border-box; grid-template-columns: 18px minmax(0, 1fr) 18px; align-items: center; gap: 6px; width: 100%; min-height: 28px; height: auto; padding: 4px 6px; border-radius: 4px; color: var(--ui-text-muted); background: var(--ui-segment-surface); font-size: 12px; line-height: 1.35; white-space: normal; overflow-wrap: anywhere; font-weight: 400; text-shadow: none; }
  :global([data-appearance] .ui-checkbox-button.ui-button.is-control.is-compact-checkbox) { display: inline-flex; flex-direction: row-reverse; width: auto; max-width: 100%; min-height: var(--ui-tab-button-height, 26px); padding: 3px 6px; }
  :global([data-appearance] .is-compact-checkbox.ui-checkbox-button .checkbox-mark) { flex: 0 0 18px; }
  :global([data-appearance] .ui-checkbox-button.ui-button.is-control > span:first-child) { grid-column: 2; grid-row: 1; text-align: center; }
  :global([data-appearance] .ui-checkbox-button.ui-button.is-control[aria-pressed="true"]) { color: var(--ui-on-accent); background: var(--ui-segment-active); }
  .checkbox-mark { display: grid; grid-column: 1; grid-row: 1; width: 18px; height: 18px; place-items: center; border-radius: 4px; color: transparent; background: var(--ui-control-hover); }
  .checkbox-mark.is-checked { color: var(--ui-on-accent); background: transparent; }
  :global([data-ui-theme="light"] .ui-checkbox-button[aria-pressed="mixed"]) .checkbox-mark { color: var(--ui-text); background: var(--ui-control-hover); }
  .checkbox-icon { display: grid; grid-column: 3; grid-row: 1; place-items: center; }
  @media (hover: hover) and (pointer: fine) {
    :global([data-appearance] .ui-checkbox-button.ui-button.is-control:hover:where([data-ui-hover="true"] *):not(:disabled):not([aria-pressed="true"])) { color: var(--ui-text); background: var(--ui-segment-hover); }
    :global([data-appearance] .ui-checkbox-button.ui-button.is-control[aria-pressed="true"]:hover:where([data-ui-hover="true"] *):not(:disabled)) { color: var(--ui-on-accent); background: var(--ui-segment-active-hover); }
  }
</style>
