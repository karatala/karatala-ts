<script lang="ts">
  import UiSegmentedButton from "./UiSegmentedButton.svelte";
  import { swipeTabs } from "./swipe-tabs";

  let { label, options, value, clearValue, disabled = false, toolbar = false, compact = false, vertical = false, columns, fillWidth = false, showLabels = false, labelMode, current, swipe = false, returnOnReselect = false, icons = {}, iconUrls = {}, texts = {}, onchange }: {
    label: string;
    options: readonly { label: string; value: string }[];
    value: string | null;
    clearValue?: string;
    disabled?: boolean;
    toolbar?: boolean;
    compact?: boolean;
    vertical?: boolean;
    columns?: number;
    fillWidth?: boolean;
    showLabels?: boolean;
    labelMode?: "all" | "icons" | "active";
    current?: "page";
    swipe?: boolean;
    returnOnReselect?: boolean;
    icons?: Readonly<Record<string, string>>;
    iconUrls?: Readonly<Record<string, string>>;
    texts?: Readonly<Record<string, string>>;
    onchange: (value: string) => void;
  } = $props();
  let previousValue: string | null = null;
  let lastValue: string | null = null;
  const visibleOptions = $derived(options.filter(option => option.value !== clearValue));
  const swipeOptions = $derived(swipe && !disabled ? { values: visibleOptions.map(option => option.value), value, onchange } : undefined);
  $effect(() => {
    if (returnOnReselect && value !== null && value !== lastValue) {
      previousValue = lastValue;
      lastValue = value;
    }
  });
  function selectOption(nextValue: string) {
    if (clearValue !== undefined && nextValue === value) {
      onchange(clearValue);
      return;
    }
    if (returnOnReselect && nextValue === value) {
      if (previousValue === null || !options.some(option => option.value === previousValue)) return;
      nextValue = previousValue;
    }
    onchange(nextValue);
  }
</script>

{#snippet buttons()}
  {#each visibleOptions as option (option.value)}
    <UiSegmentedButton
      {toolbar}
      labelMode={labelMode ?? (showLabels ? "all" : "icons")}
      {current}
      {fillWidth}
      data-ui-value={option.value}
      {disabled}
      label={compact ? `${label}: ${option.label}` : option.label}
      title={option.label}
      path={icons[option.value]}
      iconUrl={iconUrls[option.value]}
      text={texts[option.value] ?? option.label}
      active={value === option.value}
      onclick={() => selectOption(option.value)} />
  {/each}
{/snippet}

<div
  use:swipeTabs={swipeOptions}
  class="ui-segmented-control"
  class:has-swipe={!!swipeOptions}
  class:is-compact={compact}
  class:is-vertical={vertical}
  class:is-grid={columns !== undefined}
  class:is-fill-width={fillWidth}
  style:--segment-columns={columns}
  class:has-many-options={compact && visibleOptions.length > 5}
  role="group"
  aria-label={label}>
  {@render buttons()}
</div>

<style>
  .has-swipe { touch-action: pan-y; user-select: none; }
  .ui-segmented-control.is-fill-width { width: 100%; }
  .ui-segmented-control.is-grid { display: grid !important; grid-template-columns: repeat(var(--segment-columns), minmax(0, 1fr)); grid-auto-rows: 1fr; width: 100%; }
  .is-grid :global(.ui-button.ui-segmented-button:not(.is-square)) { width: 100%; min-width: 0; max-width: 100%; height: auto; min-height: var(--ui-tab-button-height, 26px); white-space: normal; }
</style>
