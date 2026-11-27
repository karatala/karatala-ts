<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends HTMLButtonAttributes {
    plain?: boolean;
    tone?: "default" | "primary" | "danger";
  }
  let { type = "button", children, class: className = "", plain = false, tone = "default", ...attributes }: Props = $props();
</script>

<button {...attributes} {type} class={`${plain ? "" : "ui-button"} ${className}`} data-tone={tone === "default" ? undefined : tone}>
  {@render children?.()}
</button>
