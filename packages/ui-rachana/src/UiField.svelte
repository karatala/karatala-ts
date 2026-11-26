<script lang="ts">
  import type { Snippet } from "svelte";

  let { label, stacked = false, children }: { label?: string; stacked?: boolean; children: Snippet } = $props();
</script>

{#if label !== undefined}
  <div class="ui-field" class:is-stacked={stacked}>
    <span class="ui-field-caption">{label}</span>
    {@render children()}
  </div>
{:else}
  {@render children()}
{/if}
