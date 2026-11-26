<script lang="ts">
  import { releasePointerFocus } from "@karatala/dom-input";

  let { label, min = 0, max, value, valueText, resetValue, disabled = false, onchange }: {
    label: string;
    min?: number;
    max: number;
    value: number;
    valueText?: string;
    resetValue: number;
    disabled?: boolean;
    onchange: (value: number) => void;
  } = $props();
</script>

<input
  class="position-slider"
  type="range"
  {min}
  {max}
  {value}
  {disabled}
  step="1"
  aria-label={label}
  aria-valuetext={valueText}
  oninput={(event) => onchange(event.currentTarget.valueAsNumber)}
  onpointerup={releasePointerFocus}
  onpointercancel={releasePointerFocus}
  ondblclick={() => { if (!disabled) onchange(resetValue); }} />

<style>
  .position-slider { box-sizing: border-box; width: 100%; min-width: 0; height: 24px; margin: 0; padding: 0; border: none; appearance: none; background: transparent; cursor: pointer; touch-action: pan-y; direction: ltr; }
  .position-slider::-webkit-slider-runnable-track { height: 4px; border-radius: 2px; background: var(--ui-segment-surface); }
  .position-slider::-moz-range-track { height: 4px; border-radius: 2px; background: var(--ui-segment-surface); }
  .position-slider::-webkit-slider-thumb { width: 14px; height: 14px; margin-top: -5px; appearance: none; border: none; border-radius: 50%; background: var(--ui-accent-fill); box-shadow: 0 1px 4px rgb(0 0 0 / 25%); }
  .position-slider::-moz-range-thumb { width: 14px; height: 14px; border: none; border-radius: 50%; background: var(--ui-accent-fill); box-shadow: 0 1px 4px rgb(0 0 0 / 25%); }
  .position-slider:disabled { cursor: default; opacity: .5; }
</style>
