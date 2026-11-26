<script lang="ts">
  import { releasePointerFocus } from "@karatala/dom-input";

  let { label, min = 0, max, value, valueText, step = 1, resetValue, disabled = false, onchange, oncommit }: {
    label: string;
    min?: number;
    max: number;
    value: number;
    valueText?: string;
    step?: number;
    resetValue?: number;
    disabled?: boolean;
    onchange?: (value: number) => void;
    oncommit?: (value: number) => void;
  } = $props();
  let draft = $state<number | null>(null);
  $effect(() => { if (disabled) draft = null; });
  function cancel(event: Event & { currentTarget: HTMLInputElement }) {
    draft = null;
    event.currentTarget.value = String(value);
  }
</script>

<input
  class="position-slider"
  type="range"
  {min}
  {max}
  value={draft ?? value}
  {disabled}
  {step}
  aria-label={label}
  aria-valuetext={valueText}
  oninput={event => { const next = event.currentTarget.valueAsNumber; if (oncommit) draft = next; onchange?.(next); }}
  onchange={event => { const next = event.currentTarget.valueAsNumber; const pending = draft !== null; draft = null; if (pending && next !== value) oncommit?.(next); }}
  onkeydown={event => { if (event.key === "Escape" && draft !== null) { event.preventDefault(); event.stopPropagation(); cancel(event); } }}
  onpointerup={releasePointerFocus}
  onpointercancel={event => { cancel(event); releasePointerFocus(event); }}
  ondblclick={() => { if (!disabled && resetValue !== undefined) { if (oncommit) oncommit(resetValue); else onchange?.(resetValue); } }} />

<style>
  .position-slider { box-sizing: border-box; width: 100%; min-width: 0; height: 24px; margin: 0; padding: 0; border: none; appearance: none; background: transparent; cursor: pointer; touch-action: pan-y; direction: ltr; }
  .position-slider::-webkit-slider-runnable-track { height: 4px; border-radius: 2px; background: var(--ui-segment-surface); }
  .position-slider::-moz-range-track { height: 4px; border-radius: 2px; background: var(--ui-segment-surface); }
  .position-slider::-webkit-slider-thumb { width: 14px; height: 14px; margin-top: -5px; appearance: none; border: none; border-radius: 50%; background: var(--ui-accent-fill); box-shadow: 0 1px 4px rgb(0 0 0 / 25%); }
  .position-slider::-moz-range-thumb { width: 14px; height: 14px; border: none; border-radius: 50%; background: var(--ui-accent-fill); box-shadow: 0 1px 4px rgb(0 0 0 / 25%); }
  .position-slider:disabled { cursor: default; opacity: .5; }
</style>
