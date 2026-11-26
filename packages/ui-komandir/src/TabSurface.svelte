<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import "./tab-surface.css";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    selected: boolean;
    accented?: boolean;
  }

  let { selected, accented = true, children, class: className = "", role = "presentation", ...attributes }: Props = $props();
</script>

<div {...attributes} {role} class={`ui-tab ${className}`} class:active={selected} class:accented={selected && accented}>
  {@render children?.()}
</div>
