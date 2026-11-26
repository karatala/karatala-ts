<script module lang="ts">
  let measurementContext: CanvasRenderingContext2D | null = null;
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { shortenPath } from "./path-label.ts";
  let { value, children }: { value: string; children?: Snippet<[string]> } = $props();
  let root = $state<HTMLSpanElement>();
  let probe = $state<HTMLSpanElement>();
  let text = $state("");
  $effect(() => {
    const full = value;
    if (!root || !probe) return;
    const node = root;
    const context = measurementContext ??= document.createElement("canvas").getContext("2d")!;
    const update = () => {
      const style = getComputedStyle(node);
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      text = shortenPath(full, node.clientWidth + 1, candidate => context.measureText(candidate).width);
    };
    let frame = 0;
    const observer = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); });
    observer.observe(node);
    observer.observe(probe);
    update();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  });
</script>

<span class="path-label" data-tooltip-text aria-label={value} bind:this={root}>
  <span class="path-label-text">
    {#if children}
      {@render children(text || value)}
    {:else}
      {text || value}
    {/if}
  </span>
  <span class="path-label-probe" bind:this={probe} aria-hidden="true">{value}</span>
</span>

<style>
  .path-label { display: grid; grid-template-columns: minmax(0, 1fr); min-width: 0; width: 100%; overflow-x: clip; white-space: nowrap; }
  .path-label-text, .path-label-probe { grid-area: 1 / 1; }
  .path-label-probe { width: max-content; visibility: hidden; pointer-events: none; }
</style>
