<script lang="ts">
  import UiButton from "./UiButton.svelte";
  let { label, sections }: { label: string; sections: { title: string; text: string }[] } = $props();
</script>

<UiButton class="settings-control" variant="icon" text="?" {label} data-ui-help={JSON.stringify(sections)} />
