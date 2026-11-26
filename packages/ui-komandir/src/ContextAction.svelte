<script lang="ts">
  import type { Snippet } from "svelte";
  import Button from "./Button.svelte";

  let { label, caption = label, disabled = false, tone, children, onclick }: {
    label: string; caption?: string; disabled?: boolean; tone?: "danger"; children: Snippet; onclick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void;
  } = $props();
</script>

<Button class="ui-context-action" role="menuitem" aria-label={label} title={label} {disabled} {tone} {onclick}>
  {@render children()}
  <span class="ui-context-action-label">{caption}</span>
</Button>
