<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import "./table-row.css";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    active?: boolean;
    selected?: boolean;
  }

  let { active = false, selected = false, children, class: className = "", role = "row", ...attributes }: Props = $props();
</script>

<div {...attributes} {role} class={["ui-table-row", className, { active, selected }]}>
  {@render children?.()}
</div>
