<script lang="ts">
  import { onMount, untrack, type Component } from "svelte";
  let { id }: { id: string } = $props();
  const [variant, name] = untrack(() => id.split("/"));
  let Example = $state<Component<{ name: string }> | undefined>();
  let failed = $state("");
  onMount(() => {
    const previousPreview = document.documentElement.getAttribute("data-ui-preview");
    document.documentElement.setAttribute("data-ui-preview", variant);
    let disposed = false;
    const load = variant === "rachana" ? import("./RachanaDemos.svelte") : import("./KomandirDemos.svelte");
    void load.then(module => { if (!disposed) Example = module.default; }).catch(error => { if (!disposed) failed = "Could not load this example. Reload the page."; console.error(error); });
    return () => { disposed = true; if (previousPreview === null) document.documentElement.removeAttribute("data-ui-preview"); else document.documentElement.setAttribute("data-ui-preview", previousPreview); };
  });
</script>

{#if Example}<Example {name} />{:else}<p class="preview-loading" role="status">{failed || "Loading example…"}</p>{/if}
