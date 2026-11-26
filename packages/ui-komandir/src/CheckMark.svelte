<script lang="ts">
  import Icon from "./Icon.svelte";

  let { checked, size = 16 }: { checked: boolean; size?: 12 | 16 } = $props();
</script>

<span class="ui-check-mark" class:checked aria-hidden="true" style:--check-mark-size={`${size}px`}>
  {#if checked}
    <Icon name="sharedControls.check" {size} />
  {/if}
</span>

<style>
  .ui-check-mark {
    display: inline-grid;
    place-items: center;
    flex: none;
    box-sizing: border-box;
    width: var(--check-mark-size);
    min-width: var(--check-mark-size);
    max-width: var(--check-mark-size);
    height: var(--check-mark-size);
    min-height: var(--check-mark-size);
    max-height: var(--check-mark-size);
    aspect-ratio: 1;
    padding: 0;
    margin: 0;
    line-height: 0;
    border-radius: min(3px, var(--ui-corner-radius, 6px));
    color: var(--theme-workbench-background);
    background: color-mix(in srgb, var(--theme-workbench-foreground) 55%, var(--theme-workbench-input));
  }
  .ui-check-mark.checked { background: var(--theme-workbench-accent); }
</style>
