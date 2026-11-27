<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import UiButton from "./UiButton.svelte";
  import { hasEscapePriorityOwner } from "./menu-keyboard";
  import { controlNumber, stepDecimalPlaces } from "./control-number";
  import { useTranslation } from "./host";
  type Field = Pick<HTMLInputAttributes, "required" | "readonly" | "oninput" | "onchange"> & { "data-dialog-autofocus"?: boolean };
  let { value = $bindable(), min, max, label, step = 1, editable = true, allowFractionalInput = false, decimalPlaces, disabled = false, placeholder, suffix, normalize, onchange, field }: {
    value?: number; min?: number; max?: number; label: string; step?: number; editable?: boolean; allowFractionalInput?: boolean; decimalPlaces?: number; disabled?: boolean; placeholder?: string; suffix?: string | ((value: number) => string); normalize?: (value: number, previous: number) => number; onchange?: (value: number) => void; field?: Field;
  } = $props();
  const language = useTranslation();
  let mobile = $state(false);
  onMount(() => {
    const pointer = window.matchMedia("(pointer: coarse)");
    const update = () => { mobile = pointer.matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1; };
    update();
    pointer.addEventListener("change", update);
    return () => pointer.removeEventListener("change", update);
  });
  let control = $state<HTMLDivElement>();
  let input = $state<HTMLInputElement>();
  let draft = $state<number | null>(null);
  const displayed = $derived(draft ?? value ?? NaN);
  const precision = $derived(decimalPlaces ?? (allowFractionalInput ? 2 : stepDecimalPlaces(step)));
  const displayedText = $derived(field && decimalPlaces === undefined ? Number.isFinite(displayed) ? String(displayed) : "" : controlNumber(displayed, precision));
  const lower = $derived(min ?? -Infinity);
  const upper = $derived(max ?? Infinity);
  const locked = $derived(disabled || !!field?.readonly);
  const suffixText = $derived(typeof suffix === "function" ? draft !== null || placeholder === undefined ? suffix(displayed) : undefined : suffix);
  let pending: number | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  function cancel() {
    clearTimeout(timer); timer = undefined; pending = undefined; draft = null;
  }
  function publish() {
    clearTimeout(timer); timer = undefined;
    const next = pending;
    pending = undefined;
    if (next !== undefined && !locked && (next !== value || placeholder !== undefined)) {
      if (field && input) {
        input.value = String(next);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      } else onchange?.(next);
    }
    draft = null;
  }
  function propose(next: number, defer = true) {
    const normalized = normalize?.(next, drag?.value ?? displayed) ?? next;
    draft = normalized;
    pending = normalized;
    clearTimeout(timer);
    if (defer) timer = setTimeout(publish, 160);
  }
  function outside(event: PointerEvent) {
    if (pending !== undefined && event.target instanceof Node && !control?.contains(event.target)) publish();
  }
  function keyDown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    if (event.key === "Escape" && (drag || pending !== undefined)) {
      if (hasEscapePriorityOwner(control?.ownerDocument ?? document)) return;
      event.preventDefault(); cancelInteraction(); return;
    }
    if (!field && input && event.target === input && event.key === "Enter") commitInput(input);
    if (pending === undefined) return;
    if (!control?.contains(event.target as Node) || ["Enter", "Tab"].includes(event.key) || (event.ctrlKey || event.metaKey) && ["z", "y"].includes(event.key.toLowerCase())) publish();
  }
  onDestroy(cancelInteraction);
  $effect(() => { if (locked) cancelInteraction(); });
  function buttonValue(direction: number) {
    if (!Number.isFinite(displayed)) return Math.max(lower, Math.min(upper, 0));
    const next = displayed + direction * step;
    if (!allowFractionalInput) return Math.max(lower, Math.min(upper, Number(next.toFixed(6))));
    const snapped = Math.max(Math.ceil(lower / step), Math.min(Math.floor(upper / step), Math.round(next / step))) * step;
    return Number.isFinite(snapped) ? Number(snapped.toFixed(6)) : Math.max(lower, Math.min(upper, next));
  }
  function stepValue(direction: number) {
    propose(buttonValue(direction), !field);
    if (field) publish();
  }
  let drag: { pointerId: number; target: HTMLElement; startX: number; value: number; moved: boolean } | null = null;
  function dragStart(event: PointerEvent) {
    if (locked || event.button !== 0 || drag) return;
    clearTimeout(timer);
    const target = event.currentTarget as HTMLElement;
    drag = { pointerId: event.pointerId, target, startX: event.clientX, value: Number.isFinite(displayed) ? displayed : buttonValue(1), moved: false };
    target.setPointerCapture(event.pointerId);
  }
  function dragMove(event: PointerEvent) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const distance = (event.clientX - drag.startX) / (Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1);
    if (!drag.moved && Math.abs(distance) < 5) return;
    drag.moved = true;
    event.preventDefault();
    const next = Math.max(lower, Math.min(upper, Number((drag.value + Math.round(distance / 5) * step).toFixed(6))));
    if (next !== displayed) propose(next, false);
  }
  function dragEnd(event: PointerEvent) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const moved = drag.moved;
    drag = null;
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    if (moved) { publish(); target.blur(); }
    else if (pending !== undefined) timer = setTimeout(publish, 160);
  }
  function cancelDrag(event?: PointerEvent) {
    const gesture = drag;
    if (!gesture || event && gesture.pointerId !== event.pointerId) return;
    drag = null;
    cancel();
    if (gesture.target.hasPointerCapture(gesture.pointerId)) gesture.target.releasePointerCapture(gesture.pointerId);
  }
  function cancelInteraction() { cancelDrag(); cancel(); }
  function edit(event: Event & { currentTarget: HTMLInputElement }) {
    if (field?.oninput) field.oninput(event);
    else if (field && !field.onchange) {
      const number = event.currentTarget.valueAsNumber;
      value = Number.isNaN(number) ? undefined : number;
    }
  }
  function change(event: Event & { currentTarget: HTMLInputElement }) {
    if (field) { field.onchange?.(event); return; }
    commitInput(event.currentTarget);
  }
  function commitInput(target: HTMLInputElement) {
    const number = target.valueAsNumber;
    const next = Number.isFinite(number) ? Math.max(lower, Math.min(upper, Number((allowFractionalInput ? number : Math.round(number / step) * step).toFixed(6)))) : value ?? NaN;
    target.value = placeholder !== undefined && !Number.isFinite(number) ? "" : controlNumber(next, precision);
    if (Number.isFinite(number) && (next !== value || placeholder !== undefined)) propose(next);
  }
</script>

<svelte:window onpointerdowncapture={outside} onkeydowncapture={keyDown} onblur={cancelInteraction} />

{#snippet unit()}
  {#if suffixText}
    <span class="stepper-suffix" aria-hidden="true">{suffixText}</span>
  {/if}
{/snippet}

<div bind:this={control} class="ui-number-stepper" class:is-form-field={!!field} role="group" aria-label={label}>
  <UiButton variant="text" filled={false} text="−" label={language.translate("Decrease {value1}", { value1: label })} disabled={locked || displayed <= lower} onclick={() => stepValue(-1)} />
  {#if field || editable && !mobile}
    <div class="stepper-center">
      <input bind:this={input} {...field} data-hold-action type="number" value={draft !== null || placeholder === undefined ? displayedText : ""} {placeholder} {disabled} {min} {max} step={allowFractionalInput ? "any" : step} aria-label={label} onpointerdown={dragStart} onpointermove={dragMove} onpointerup={dragEnd} onpointercancel={cancelDrag} onlostpointercapture={cancelDrag} oninput={edit} onchange={change} />
    </div>
    {@render unit()}
  {:else}
    <output data-hold-action class="stepper-value" aria-label={label} onpointerdown={dragStart} onpointermove={dragMove} onpointerup={dragEnd} onpointercancel={cancelDrag} onlostpointercapture={cancelDrag}>
      <span class="stepper-value-text">{draft !== null || placeholder === undefined ? displayedText : placeholder}</span>
      {@render unit()}
    </output>
  {/if}
  <UiButton variant="text" filled={false} text="+" label={language.translate("Increase {value1}", { value1: label })} disabled={locked || displayed >= upper} onclick={() => stepValue(1)} />
</div>

<style>
  .ui-number-stepper { display: inline-flex; align-items: center; min-width: 108px; max-width: 100%; height: 26px; background: var(--ui-segment-surface); border-radius: 4px; overflow: hidden; }
  .ui-number-stepper.is-form-field { min-width: min(100%, 84px); }
  .ui-number-stepper input { box-sizing: border-box; border: 0; border-bottom: 2px solid transparent; outline: none; }
  .ui-number-stepper input:focus-visible { outline: none; border-bottom-color: var(--ui-accent); }
  :global([data-appearance] .ui-number-stepper .ui-button.is-text) { flex: 0 0 26px; width: 26px; min-width: 26px; height: 26px; min-height: 26px; padding: 2px; border-radius: 0; }
  :global(:root[data-ui-theme] .ui-number-stepper input) { box-sizing: border-box; flex: 1 1 36px; width: 36px; min-width: 0; height: 26px; min-height: 0; margin: 0; padding: 2px; text-align: center; font-variant-numeric: tabular-nums; color: var(--ui-text); appearance: textfield; background: transparent; border: 0; border-bottom: 2px solid transparent; border-radius: 0; }
  :global(:root[data-ui-theme] .ui-number-stepper input:focus-visible) { outline: none; border-bottom-color: var(--ui-accent); }
  .stepper-center { position: relative; display: flex; flex: 1 1 56px; min-width: 0; height: 26px; }
  .stepper-arrow { position: absolute; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--ui-text-muted); font-size: 8px; line-height: 1; }
  .is-left { left: 3px; }
  .is-right { right: 3px; }
  input, .stepper-value { touch-action: none; cursor: ew-resize; user-select: none; }
  .stepper-value { display: flex; box-sizing: border-box; align-items: center; flex: 1 1 56px; min-width: 0; height: 26px; padding: 0 0 0 2px; color: var(--ui-text); font-variant-numeric: tabular-nums; }
  .stepper-value-text { flex: 1; min-width: 0; text-align: center; }
  .stepper-suffix { display: flex; flex: 0 0 auto; align-items: center; padding-right: 5px; }
  input::-webkit-inner-spin-button, input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
</style>
