<script lang="ts">
  import { onMount, untrack, type Component } from "svelte";
  let { id }: { id: string } = $props();
  const [variant, name] = untrack(() => id.split("/"));
  let Example = $state<Component<{ name: string }> | undefined>();
  let failed = $state("");
  onMount(() => {
    let disposed = false;
    const load = variant === "rachana" ? import("./RachanaDemos.svelte") : import("./KomandirDemos.svelte");
    void load.then(module => { if (!disposed) Example = module.default; }).catch(error => { if (!disposed) failed = "Could not load this example. Reload the page."; console.error(error); });
    return () => { disposed = true; };
  });
</script>

{#if Example}<Example {name} />{:else}<p class="preview-loading" role="status">{failed || "Loading example…"}</p>{/if}
