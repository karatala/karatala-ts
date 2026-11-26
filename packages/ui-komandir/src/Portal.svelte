<script lang="ts">
  import type { Snippet } from "svelte";
  import { portal } from "./portal.ts";

  let { children, to = "body" }: { children: Snippet; to?: string } = $props();
</script>

<div use:portal={to} data-ui-portal style="display:contents">
  {@render children()}
</div>
