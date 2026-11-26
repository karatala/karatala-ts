<script lang="ts">
  import { onDestroy } from "svelte";
  import { hasEscapePriorityOwner } from "./menu-keyboard";
  import { releasePointerFocus } from "@karatala/dom-input";

  let {
    label,
    value,
    minimum,
    maximum,
    increaseDirection = 1,
    orientation = "horizontal",
    shadow = false,
    fromParentEdge = false,
    unitsPerPixel = 1,
    keyboardStep = 8,
    cancelBehavior = "restore",
    class: className = "",
    onstart,
    onchange,
    oncommit,
    onreset,
  }: {
    label: string;
    value: number;
    minimum: number;
    maximum: number;
    increaseDirection?: 1 | -1;
    orientation?: "horizontal" | "vertical";
    shadow?: boolean;
    fromParentEdge?: boolean;
    unitsPerPixel?: number;
    keyboardStep?: number;
    cancelBehavior?: "restore" | "keep";
    class?: string;
    onstart?: () => void;
    onchange: (value: number) => void;
    oncommit?: (value: number) => void;
    onreset?: (event: MouseEvent) => void;
  } = $props();
  let drag = $state.raw<{ pointerId: number; target: HTMLElement; startPosition: number; startValue: number; value: number } | null>(null);
  onDestroy(clearGesture);

  function clearGesture() {
    const gesture = drag;
    drag = null;
    if (gesture?.target.hasPointerCapture(gesture.pointerId)) gesture.target.releasePointerCapture(gesture.pointerId);
    gesture?.target.blur();
  }
  function cancelInteraction() {
    const gesture = drag;
    clearGesture();
    if (gesture && cancelBehavior === "restore") onchange(gesture.startValue);
  }
  function cancelKey(event: KeyboardEvent) {
    if (!drag || event.key !== "Escape" || event.defaultPrevented || hasEscapePriorityOwner(drag.target.ownerDocument)) return;
    event.preventDefault(); cancelInteraction();
  }

  function clamp(nextValue: number) {
    return Math.max(minimum, Math.min(maximum, fromParentEdge ? nextValue : Math.round(nextValue)));
  }

  function pointerDown(event: PointerEvent) {
    if (event.button !== 0 || drag) return;
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    if (!fromParentEdge) target.focus();
    target.setPointerCapture(event.pointerId);
    drag = { pointerId: event.pointerId, target, startPosition: orientation === "vertical" ? event.clientY : event.clientX, startValue: value, value };
    onstart?.();
  }

  function pointerMove(event: PointerEvent) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const position = orientation === "vertical" ? event.clientY : event.clientX;
    if (fromParentEdge) {
      const bounds = (event.currentTarget as HTMLElement).parentElement!.getBoundingClientRect();
      const start = orientation === "vertical" ? bounds.top : bounds.left;
      const end = orientation === "vertical" ? bounds.bottom : bounds.right;
      drag.value = clamp((increaseDirection === 1 ? position - start : end - position) * unitsPerPixel);
    } else {
      drag.value = clamp(drag.startValue + (position - drag.startPosition) * increaseDirection * unitsPerPixel);
    }
    onchange(drag.value);
  }

  function pointerUp(event: PointerEvent) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const nextValue = drag.value;
    drag = null;
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    oncommit?.(nextValue);
    releasePointerFocus(event);
  }

  function pointerCancel(event: PointerEvent) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const startValue = drag.startValue;
    drag = null;
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    if (cancelBehavior === "restore") onchange(startValue);
    releasePointerFocus(event);
  }

  function pointerCaptureLost(event: PointerEvent) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const nextValue = drag.value;
    drag = null;
    oncommit?.(nextValue);
    releasePointerFocus(event);
  }

  function keyDown(event: KeyboardEvent) {
    const decreaseKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    const increaseKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
    if (![decreaseKey, increaseKey, "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    onstart?.();
    const direction = event.key === decreaseKey ? -1 : event.key === increaseKey ? 1 : 0;
    const nextValue = clamp(event.key === "Home" ? minimum : event.key === "End" ? maximum : value + direction * increaseDirection * keyboardStep);
    onchange(nextValue);
    oncommit?.(nextValue);
  }
</script>

<svelte:window onkeydowncapture={cancelKey} onblur={cancelInteraction} />

<div
  class={`ui-resize-handle ${className}`}
  class:is-resizing={drag !== null}
  class:is-vertical={orientation === "vertical"}
  class:has-shadow={shadow}
  role="slider"
  tabindex="0"
  aria-label={label}
  aria-orientation={orientation}
  aria-valuemin={minimum}
  aria-valuemax={maximum}
  aria-valuenow={value}
  onpointerdown={pointerDown}
  onpointermove={pointerMove}
  onpointerup={pointerUp}
  onpointercancel={pointerCancel}
  onlostpointercapture={pointerCaptureLost}
  onkeydown={keyDown}
  ondblclick={onreset}></div>
