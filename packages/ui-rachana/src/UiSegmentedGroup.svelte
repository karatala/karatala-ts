<script lang="ts">
  import type { Snippet } from "svelte";
  let { label, children, class: className = "" }: { label: string; children: Snippet; class?: string } = $props();
</script>

<div class={`ui-segmented-control ui-segmented-group ${className}`} role="group" aria-label={label}>
  {@render children()}
</div>

<style>
  .ui-segmented-group { flex: 0 0 auto; align-items: center; }
  .ui-segmented-group > :global(*) { flex: 0 0 auto; }
  .ui-segmented-group > :global(.ui-button:not(.is-fill-width)) { flex: 0 0 auto !important; }
  .ui-segmented-group > :global(.ui-segmented-control) { flex: 1 1 auto; border-radius: 0; background: transparent; }
  .ui-segmented-group :global(.ui-button), .ui-segmented-group :global(.ui-text-input) { border-radius: 0 !important; }
  .ui-segmented-group :global(.ui-button.is-icon:not(.is-fill-width)) { box-sizing: border-box; flex: 0 0 auto !important; width: var(--ui-tab-button-height, 26px); min-width: var(--ui-tab-button-height, 26px); max-width: var(--ui-tab-button-height, 26px); padding: 3px; }
</style>
