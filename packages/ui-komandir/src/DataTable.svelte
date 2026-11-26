<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import "./data-table.css";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    element?: HTMLDivElement | null;
  }

  let { element = $bindable(null), children, class: className = "", role = "presentation", ...attributes }: Props = $props();
</script>

<div {...attributes} bind:this={element} {role} class={["ui-data-table", className]}>
  {@render children?.()}
</div>
