<script lang="ts">
  import UiButton from "./UiButton.svelte";
  import UiSegmentedGroup from "./UiSegmentedGroup.svelte";
  import UiIcon from "./UiIcon.svelte";
  import UiMiniPopup from "./UiMiniPopup.svelte";
  import UiNumberStepper from "./UiNumberStepper.svelte";
  import { controlNumber } from "./control-number";
  let { label, value, path, values, decimalPlaces = 0, limittovalues = false, disabled = false, onchange }: { label: string; value: number; path?: string; values?: readonly number[]; decimalPlaces?: number; limittovalues?: boolean; disabled?: boolean; onchange: (value: number) => void } = $props();
  let open = $state(false);
  const presets = $derived(values ?? [25, 50, 75, 100, 150, 200, 300, 400]);
</script>

<div class="ui-zoom-select">
  <UiSegmentedGroup {label}>
    <UiMiniPopup bind:open width={210} align="end">
      {#snippet trigger(attributes)}
        <UiButton {...attributes} class="scale-trigger" {label} {disabled}>
          {#if path}<UiIcon {path} size={16} />{/if}
          <span>{controlNumber(value, decimalPlaces)}%</span>
        </UiButton>
      {/snippet}
      {#if !limittovalues}
        <UiNumberStepper {label} {value} {decimalPlaces} min={Math.min(...presets)} max={Math.max(...presets)} suffix="%" allowFractionalInput={decimalPlaces > 0} {onchange} />
      {/if}
      <div class="scale-presets">
        {#each presets as preset}
          <UiButton label={`${controlNumber(preset, decimalPlaces)}%`} text={`${controlNumber(preset, decimalPlaces)}%`} active={value === preset} onclick={() => { onchange(preset); open = false; }} />
        {/each}
      </div>
    </UiMiniPopup>
  </UiSegmentedGroup>
</div>

<style>
  .ui-zoom-select { display: inline-flex; min-width: 0; }
  .ui-zoom-select > :global(.ui-segmented-group) { flex: 1; min-width: 0; }
  .ui-zoom-select :global(.scale-trigger.ui-button) { width: 100%; min-width: 0; height: var(--ui-tab-button-height, 26px); min-height: var(--ui-tab-button-height, 26px); padding: 3px 6px; gap: 4px; font-variant-numeric: tabular-nums; }
  .scale-presets { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; }
</style>
