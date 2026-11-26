<script lang="ts">
  import UiButton from "./UiButton.svelte";

  let { checked, label, text = label, title, disabled = false, onchange }: { checked: boolean; label: string; text?: string; title?: string; disabled?: boolean; onchange: (checked: boolean) => void } = $props();
</script>

<UiButton class="ui-switch" filled={false} role="switch" aria-checked={checked} {label} {text} {title} {disabled} onclick={() => onchange(!checked)}>
  <span class="switch-track" class:is-checked={checked} aria-hidden="true">
    <span class="switch-thumb"></span>
  </span>
</UiButton>

<style>
  :global([data-appearance] .ui-switch.ui-button) { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; height: auto; min-height: 32px; padding: 2px 0; border: none; border-radius: 0; color: var(--ui-text); background: transparent; text-align: start; text-shadow: none; }
  :global([data-appearance] .ui-switch.ui-button > span:not(.switch-track)) { flex: 1; min-width: 0; white-space: normal; overflow-wrap: anywhere; }
  .switch-track { display: block; position: relative; flex: 0 0 44px; width: 44px; height: 26px; border-radius: 13px; background: color-mix(in srgb, var(--ui-segment-surface), var(--ui-text) 42%); transition: background-color 150ms ease; }
  .switch-thumb { display: block; position: absolute; top: 2px; left: 2px; width: 22px; height: 22px; border-radius: 50%; background: var(--ui-on-accent); box-shadow: 0 1px 3px rgb(0 0 0 / 20%); transition: transform 150ms ease; }
  .switch-track.is-checked { background: var(--ui-accent-fill); }
  .is-checked .switch-thumb { transform: translateX(18px); }
  :global([data-appearance] .ui-switch.ui-button:focus-visible) .switch-track { box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-accent-fill) 30%, transparent); }
  :global([data-appearance] .ui-switch.ui-button:hover:where([data-ui-hover="true"] *):not(:disabled)) .switch-track:not(.is-checked) { background: color-mix(in srgb, var(--ui-segment-hover), var(--ui-text) 42%); }
  :global([data-appearance] .ui-switch.ui-button:hover:where([data-ui-hover="true"] *):not(:disabled)) .switch-track.is-checked { background: var(--ui-accent-fill-hover); }
  @media (prefers-reduced-motion: reduce) { .switch-track, .switch-thumb { transition: none; } }
</style>
