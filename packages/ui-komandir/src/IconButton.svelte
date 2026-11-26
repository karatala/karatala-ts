<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import Button from "./Button.svelte";

  interface Props extends Omit<HTMLButtonAttributes, "aria-label"> {
    label: string;
    plain?: boolean;
    tone?: "default" | "primary" | "danger";
    ghost?: boolean;
  }

  let { label, children, ghost = false, class: className = "", ...attributes }: Props = $props();
</script>

<Button {...attributes} class={`ui-icon-button${ghost ? " ui-icon-button-ghost" : ""} ${className}`} aria-label={label}>
  {@render children?.()}
</Button>
