<script lang="ts">
  import type { Snippet } from "svelte";

  let { label, children }: { label: string; children: Snippet } = $props();
</script>

<div class="floating-toolbar" role="toolbar" aria-label={label}>
  {@render children()}
</div>

<style>
  .floating-toolbar { position: absolute; z-index: 5; inset-inline-end: 14px; inset-block-start: 14px; display: flex; flex-direction: column; gap: 4px; padding: 4px; background: var(--ui-menu-surface); border-radius: 6px; box-shadow: 0 4px 16px #0005; }
  .floating-toolbar :global(.ui-button.is-icon) { box-sizing: border-box; width: var(--ui-tab-button-height, 26px); min-width: var(--ui-tab-button-height, 26px); height: var(--ui-tab-button-height, 26px); padding: 3px; background: transparent; }
  @media (max-width: 600px) {
    .floating-toolbar { position: relative; inset: auto; flex-direction: row; flex: 0 0 auto; align-self: flex-end; gap: 0; margin: 4px 6px; padding: 2px; }
  }
</style>
