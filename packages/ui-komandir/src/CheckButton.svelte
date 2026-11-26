<script lang="ts">
  import Button from "./Button.svelte";
  import CheckMark from "./CheckMark.svelte";

  let { checked, label, title, disabled = false, onChange }: { checked: boolean; label: string; title?: string; disabled?: boolean; onChange(checked: boolean): void } = $props();
</script>

<Button class="ui-check-button" aria-pressed={checked} {title} {disabled} onclick={() => onChange(!checked)}>
  <CheckMark {checked} />
  {label}
</Button>

<style>
  :global(.ui-check-button) { display: inline-flex; align-items: center; }
</style>
