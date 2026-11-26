<script lang="ts">
  import type { HTMLTextareaAttributes } from "svelte/elements";
  let { value = $bindable(""), input = $bindable(), rows = 4, class: className = "", ...attributes }: Omit<HTMLTextareaAttributes, "value" | "class" | "children"> & { value?: string; input?: HTMLTextAreaElement; class?: string } = $props();
</script>

<textarea {...attributes} bind:this={input} bind:value {rows} class={`ui-text-area ${className}`}></textarea>

<style>
  .ui-text-area { box-sizing: border-box; width: 100%; min-width: 0; padding: 8px; border: none; border-radius: 4px; color: var(--ui-text); background: var(--ui-field-surface, var(--ui-control-surface)); font: inherit; line-height: 1.5; resize: vertical; }
  .ui-text-area:disabled { opacity: .42; }
  .ui-text-area:focus-visible { outline: 2px solid var(--ui-accent); outline-offset: 1px; }
</style>
