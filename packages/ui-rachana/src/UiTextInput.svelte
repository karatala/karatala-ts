<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  let { value = $bindable(""), input = $bindable(), type = "text", class: className = "", ...attributes }: Omit<HTMLInputAttributes, "value" | "class" | "type"> & { value?: string; input?: HTMLInputElement; type?: "text" | "search" | "email" | "password" | "url"; class?: string } = $props();
</script>

<input {...attributes} bind:this={input} bind:value {type} class={`ui-text-input ${className}`} />

<style>
  .ui-text-input { box-sizing: border-box; width: 100%; min-width: 0; height: var(--ui-tab-button-height, 26px); min-height: var(--ui-tab-button-height, 26px); padding: 3px 7px; border: none; border-radius: 4px; color: var(--ui-text); background: var(--ui-field-surface, var(--ui-control-surface)); font: inherit; }
  .ui-text-input:disabled { opacity: .42; }
  .ui-text-input:focus-visible { outline: 2px solid var(--ui-accent); outline-offset: 1px; }
</style>
