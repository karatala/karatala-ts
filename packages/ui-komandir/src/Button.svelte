<script lang="ts">
  import "./controls.css";
  import ButtonBody from "./internal/Button.svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends HTMLButtonAttributes {
    plain?: boolean;
    tone?: "default" | "primary" | "danger";
  }
  let { type = "button", children, class: className = "", plain = false, tone = "default", ...attributes }: Props = $props();
</script>

<ButtonBody {...attributes} {type} {plain} {tone} class={className}>
  {@render children?.()}
</ButtonBody>
