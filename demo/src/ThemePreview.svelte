<script lang="ts">
  import { onMount, type Component } from "svelte";
  let { variant }: { variant: string } = $props();
  let Example = $state<Component>();
  let failed = $state(false);
  onMount(() => {
    let disposed = false;
    const load = variant === "rachana" ? import("./RachanaTheme.svelte") : import("./KomandirTheme.svelte");
    void load.then(module => { if (!disposed) Example = module.default; }).catch(error => { if (!disposed) failed = true; console.error(error); });
    return () => { disposed = true; };
  });
</script>

{#if Example}<Example />{:else}<p class="preview-loading" role="status">{failed ? "Could not load the theme example. Reload the page." : "Loading theme example…"}</p>{/if}

<style>
  :global(.theme-case) { padding: 18px; font: 12px Tahoma, "Segoe UI", sans-serif; color: var(--karatala-color-text); background: var(--karatala-color-background); min-height: 100vh; }
  :global(.theme-row) { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-block: 12px; }
  :global(.theme-row .ui-text-input) { max-width: 150px; }
  :global(.theme-row .ui-select), :global(.theme-row .ui-dropdown) { max-width: 260px; }
  :global(.theme-status) { display: block; block-size: 4em; overflow: auto; margin-top: 16px; color: var(--karatala-color-muted); }
</style>
