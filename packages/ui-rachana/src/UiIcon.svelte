<script lang="ts">
  import { useRachanaUiHost } from "./host";
  const host = useRachanaUiHost();
  let { path, src, size = 20, label, class: className = "" }: { path?: string; src?: string; size?: number; label?: string; class?: string } = $props();
  const options = $derived(path ? host.iconPathOptions?.(path) : undefined);
</script>

{#if src}
  <span class={`ui-raster-icon ${className}`} style:width={`${size}px`} style:height={`${size}px`} style:--icon-url={`url("${src}")`} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : "true"}></span>
{:else}
  <svg class={className} width={size} height={size} viewBox={options?.viewBox ?? "0 0 24 24"} fill="currentColor" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : "true"} focusable="false">
    <path d={path ?? ""} fill-rule={options?.fillRule}></path>
  </svg>
{/if}

<style>
  .ui-raster-icon {
    display: inline-block;
    flex: 0 0 auto;
    background: currentColor;
    -webkit-mask: var(--icon-url) center / contain no-repeat;
    mask: var(--icon-url) center / contain no-repeat;
    pointer-events: none;
  }
</style>
