<script lang="ts">
  import UiTextInput from "./UiTextInput.svelte";
  import { useTranslation } from "./host";

  let { value = $bindable(), label = "Section", autofocus = false }: { value: string; label?: string; autofocus?: boolean } = $props();
  const language = useTranslation();
</script>

<label class="marker-name">
  {language.translate(label)}
  <UiTextInput type="text" bind:value data-dialog-autofocus={autofocus ? "" : undefined} />
</label>

<style>
  .marker-name { display: grid; gap: 6px; }
</style>
