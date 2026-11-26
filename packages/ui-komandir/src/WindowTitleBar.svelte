<script lang="ts">
  import type { Snippet } from "svelte";
  let { heading, center, actions, trailingDrag, children }: { heading: Snippet; center?: Snippet; actions?: Snippet; trailingDrag?: Snippet; children: Snippet } = $props();
</script>

<header class="window-heading" class:has-center={Boolean(center)}>
  {@render heading()}
  {#if center}
    <div class="window-heading-center">{@render center()}</div>
    <div class="window-heading-controls">
      {#if trailingDrag}<div class="window-heading-trailing-drag">{@render trailingDrag()}</div>{/if}
      {#if actions}
        <div class="window-heading-actions">
          {@render actions()}
        </div>
      {/if}
      <div class="window-heading-buttons">{@render children()}</div>
    </div>
  {:else}
    {#if actions}
      <div class="window-heading-actions">
        {@render actions()}
      </div>
    {/if}
    {@render children()}
  {/if}
</header>

<style>
  .window-heading { display: flex; flex: 0 0 34px; align-items: center; gap: 3px; padding: 3px 5px; background: var(--theme-workbench-background); }
  .window-heading.has-center { display: grid; grid-template-columns: minmax(84px, 1fr) min(360px, 45%) minmax(84px, 1fr); column-gap: 0; }
  .window-heading-center { min-width: 0; }
  .window-heading-actions { flex: 0 1 auto; min-width: 0; max-width: min(75%, calc(100% - 180px)); overflow: auto hidden; scrollbar-width: none; }
  .window-heading-controls { display: flex; align-items: center; align-self: stretch; justify-content: flex-end; }
  .window-heading-buttons { display: flex; gap: 3px; }
  .window-heading-trailing-drag { display: flex; flex: 1; min-width: 0; align-self: stretch; }
</style>
