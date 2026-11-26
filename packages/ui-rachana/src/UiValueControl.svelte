<script lang="ts">
  import { onDestroy } from "svelte";
  import type { ControlColorSection } from "./control-types";
  import { hasEscapePriorityOwner } from "./menu-keyboard";
  import { releasePointerFocus } from "@karatala/dom-input";
  const volumeSections: ControlColorSection[] = [
    { color: "#36c978", from: 0 },
    { color: "#ffd34e", from: 50 },
    { color: "#ff5b57", from: 100.000001 },
  ];
  const panSections: ControlColorSection[] = [
    { color: "#4070ff", from: 0 },
    { color: "#ffff1e", from: 8 },
    { color: "#ff5b57", from: 9 },
  ];
  let {
    label,
    title = label,
    min = 0,
    max,
    value,
    resetValue,
    disabled = false,
    dial = false,
    center,
    class: className = "",
    sections,
    onchange,
    oninteraction,
  }: {
    label: string;
    title?: string;
    min?: number;
    max: number;
    value: number;
    resetValue: number;
    disabled?: boolean;
    dial?: boolean;
    center?: number;
    class?: string;
    sections?: readonly ControlColorSection[];
    onchange: (value: number) => void;
    oninteraction?: () => void;
  } = $props();
  let dragging = $state(false);
  let session: { pointerId: number; target: HTMLElement; startX: number; startY: number; startValue: number; moved: boolean; threshold: number } | null = null;
  let lastTap = 0;
  onDestroy(cancelInteraction);
  $effect(() => { if (disabled) cancelInteraction(); });
  const activeSections = $derived(sections ?? (dial ? panSections : volumeSections));
  const ratio = $derived(max === min ? 0 : (value - min) / (max - min));
  const centerRatio = $derived(center === undefined || max === min ? 0 : clamp((center - min) / (max - min), 0, 1));
  const centered = $derived(center !== undefined && value === center);
  const color = $derived(centered ? "#ffff1e" : colorAt(value, activeSections));
  const valueAngle = $derived(ratio * 270);
  const centerAngle = $derived(centerRatio * 270);
  const fillStartAngle = $derived(centered ? centerAngle : center === undefined ? 0 : Math.min(valueAngle, centerAngle));
  const fillEndAngle = $derived(centered ? centerAngle : center === undefined ? valueAngle : Math.max(valueAngle, centerAngle));
  const controlStyle = $derived(
    `--control-center:${centerRatio * 100}%;--control-color:${color};--control-ratio:${ratio * 100}%;--control-sections:${sectionGradient(activeSections, min, max)};--control-fill-start:${fillStartAngle}deg;--control-fill-end:${fillEndAngle}deg`,
  );
  function clamp(nextValue: number, minimum: number, maximum: number) {
    return Math.max(minimum, Math.min(maximum, nextValue));
  }
  function colorAt(nextValue: number, colorSections: readonly ControlColorSection[]) {
    return [...colorSections].reverse().find((section) => nextValue >= section.from)?.color ?? colorSections[0]?.color ?? "#ffffff";
  }
  function sectionGradient(colorSections: readonly ControlColorSection[], minimum: number, maximum: number) {
    const span = maximum - minimum || 1;
    const ordered = [...colorSections].sort((first, second) => first.from - second.from);
    const stops = ordered.flatMap((section, idx) => {
      const start = clamp(((section.from - minimum) / span) * 100, 0, 100);
      const end = idx + 1 < ordered.length ? clamp(((ordered[idx + 1].from - minimum) / span) * 100, 0, 100) : 100;
      return [`${section.color} ${start}%`, `${section.color} ${end}%`];
    });
    return `linear-gradient(to right, ${stops.join(", ")})`;
  }
  function change(nextValue: number) {
    if (!disabled) onchange(clamp(Math.round(nextValue), min, max));
  }
  function pointerDown(event: PointerEvent) {
    if (disabled || event.button !== 0 || session) return;
    event.preventDefault();
    oninteraction?.();
    const target = event.currentTarget as HTMLElement;
    target.focus();
    target.setPointerCapture(event.pointerId);
    session = { pointerId: event.pointerId, target, startX: event.clientX, startY: event.clientY, startValue: value, moved: false, threshold: event.pointerType === "touch" ? 10 : 4 };
    dragging = true;
  }
  function pointerMove(event: PointerEvent) {
    if (!session || session.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - session.startX;
    const deltaY = event.clientY - session.startY;
    if (!session.moved && Math.hypot(deltaX, deltaY) <= session.threshold) return;
    session.moved = true;
    const pixels = Math.abs(deltaX) >= Math.abs(deltaY) ? deltaX : -deltaY;
    change(session.startValue + (pixels / 116) * (max - min));
  }
  function release(event: PointerEvent) {
    if (!session || session.pointerId !== event.pointerId) return;
    session = null;
    dragging = false;
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
  }
  function cancelInteraction() {
    const gesture = session;
    session = null;
    dragging = false;
    lastTap = 0;
    if (gesture?.target.hasPointerCapture(gesture.pointerId)) gesture.target.releasePointerCapture(gesture.pointerId);
    gesture?.target.blur();
  }
  function pointerCancel(event: PointerEvent) { if (session?.pointerId === event.pointerId) cancelInteraction(); }
  function cancelKey(event: KeyboardEvent) {
    if (!session || event.key !== "Escape" || event.defaultPrevented || hasEscapePriorityOwner(session.target.ownerDocument)) return;
    event.preventDefault(); cancelInteraction();
  }
  function pointerUp(event: PointerEvent) {
    if (!session || session.pointerId !== event.pointerId) return;
    if (!session.moved && event.pointerType !== "mouse") {
      const now = Date.now();
      if (now - lastTap < 350) {
        change(resetValue);
        lastTap = 0;
      } else lastTap = now;
    } else lastTap = 0;
    release(event);
    releasePointerFocus(event);
  }
  function keyDown(event: KeyboardEvent) {
    const direction = event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : 0;
    if (!direction && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    event.stopPropagation();
    oninteraction?.();
    change(event.key === "Home" ? min : event.key === "End" ? max : value + direction);
  }
</script>

<svelte:window onkeydowncapture={cancelKey} onblur={cancelInteraction} />

{#if dial}
  <div class={`ui-dial track-dial ${className}`} class:is-disabled={disabled} class:is-dragging={dragging}>
    <button
      type="button"
      role="slider"
      class="ui-dial-button track-dial-button"
      class:is-centered={centered}
      {disabled}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      {title}
      style={controlStyle}
      onpointerdown={pointerDown}
      onpointermove={pointerMove}
      onpointerup={pointerUp}
      onpointercancel={pointerCancel}
      onlostpointercapture={pointerCancel}
      onkeydown={keyDown}
      ondblclick={() => change(resetValue)}
      oncontextmenu={(event) => event.preventDefault()}>
      <span class="ui-dial-ring track-dial-ring" aria-hidden="true"></span>
    </button>
    {#if dragging}
      <div class="ui-dial-editor track-dial-editor" aria-hidden="true">
        <div class="ui-slider mixer-slider track-dial-slider" class:is-bipolar={center !== undefined} class:is-centered={centered} style={controlStyle}>
          <span class="ui-slider-track mixer-slider-track"><span class="ui-slider-fill mixer-slider-fill"></span></span>
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div
    role="slider"
    tabindex={disabled ? -1 : 0}
    class={`ui-slider mixer-slider ${className}`}
    class:is-disabled={disabled}
    aria-label={label}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
    {title}
    style={controlStyle}
    onpointerdown={pointerDown}
    onpointermove={pointerMove}
    onpointerup={pointerUp}
    onpointercancel={pointerCancel}
    onlostpointercapture={pointerCancel}
    onkeydown={keyDown}
    ondblclick={() => change(resetValue)}
    oncontextmenu={(event) => event.preventDefault()}
  >
    <span class="ui-slider-track mixer-slider-track"><span class="ui-slider-fill mixer-slider-fill"></span></span>
  </div>
{/if}
