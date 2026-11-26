import { hasEscapePriorityOwner } from "./menu-keyboard";

export const tabSwipeThreshold = 36;

type SwipeTabsOptions = {
  values: readonly string[];
  value: string | null;
  onchange: (value: string) => void;
  onstart?: () => void;
  onpreview?: (delta: number | null) => void;
  exclude?: string;
};

export function swipeTabs(node: HTMLElement, options: SwipeTabsOptions | undefined) {
  let start: { pointerId: number; clientX: number; clientY: number; horizontal: boolean; direction: number; peakDistance: number; originX: number; neutral: boolean; delta: number } | null = null;
  let suppressSwipeClick = false;
  const preview = (delta: number | null) => options?.onpreview?.(delta);
  const down = (event: PointerEvent) => {
    if (!options) { clearCanceledClick(); return; }
    if (start || event.button !== 0 || !event.isPrimary || !(event.target instanceof Element)) return;
    suppressSwipeClick = false;
    preview(null);
    if (event.target.closest('input, textarea, select, [contenteditable], [role="slider"], .ui-combo-button, .ui-wheel-button, [data-application-menu]') || options.exclude && event.target.closest(options.exclude)) return;
    start = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, horizontal: false, direction: 1, peakDistance: 0, originX: event.clientX, neutral: false, delta: 0 };
  };
  const updateSwipe = (clientX: number) => {
    if (!start) return;
    if (start.neutral) {
      const neutralDistance = clientX - start.originX;
      if (Math.abs(neutralDistance) <= 24) return;
      start.direction = neutralDistance < 0 ? -1 : 1;
      start.originX += start.direction * 24;
      start.neutral = false;
    }
    const deltaX = clientX - start.originX;
    const distance = deltaX * start.direction;
    start.peakDistance = Math.max(start.peakDistance, distance);
    const cancelDistance = Math.max(24, start.peakDistance * 0.35);
    if (distance <= 0 || start.peakDistance >= tabSwipeThreshold && distance <= cancelDistance) {
      start.neutral = true;
      start.originX = clientX;
      start.peakDistance = 0;
      start.delta = 0;
      preview(null);
      return;
    }
    start.delta = deltaX;
    preview(deltaX);
  };
  const move = (event: PointerEvent) => {
    if (!start || start.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - start.clientX;
    const deltaY = event.clientY - start.clientY;
    if (!start.horizontal) {
      if (Math.abs(deltaY) > 12 && Math.abs(deltaY) >= Math.abs(deltaX)) { start = null; return; }
      if (Math.abs(deltaX) < 12 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;
      start.horizontal = true;
      start.direction = deltaX < 0 ? -1 : 1;
      options?.onstart?.();
      node.setPointerCapture(event.pointerId);
    }
    updateSwipe(event.clientX);
    event.preventDefault();
  };
  const finish = (event: PointerEvent) => {
    if (!start || start.pointerId !== event.pointerId) return;
    if (start.horizontal) updateSwipe(event.clientX);
    const gesture = start;
    start = null;
    preview(null);
    if (gesture.horizontal) {
      suppressSwipeClick = true;
      event.preventDefault();
      if (options && !gesture.neutral && Math.abs(gesture.delta) >= tabSwipeThreshold) {
        const idx = options.values.indexOf(options.value ?? "");
        const next = Math.max(0, Math.min(options.values.length - 1, idx + (gesture.delta < 0 ? 1 : -1)));
        if (idx >= 0 && next !== idx) options.onchange(options.values[next]);
      }
      if (document.activeElement instanceof HTMLElement && node.contains(document.activeElement)) document.activeElement.blur();
    }
    if (node.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId);
  };
  const cancel = () => {
    const gesture = start;
    start = null;
    preview(null);
    if (gesture) suppressSwipeClick = true;
    if (gesture && node.hasPointerCapture(gesture.pointerId)) node.releasePointerCapture(gesture.pointerId);
  };
  const pointerCancel = (event: PointerEvent) => { if (start?.pointerId === event.pointerId) cancel(); };
  const keyDown = (event: KeyboardEvent) => {
    if (!start || event.key !== "Escape" || event.defaultPrevented || hasEscapePriorityOwner(node.ownerDocument)) return;
    event.preventDefault(); event.stopPropagation(); cancel();
  };
  const click = (event: MouseEvent) => { if (!suppressSwipeClick) return; clearCanceledClick(); if (event.detail === 0) return; event.preventDefault(); event.stopImmediatePropagation(); };
  let listening = false;
  function clearCanceledClick() {
    suppressSwipeClick = false;
    if (!listening) { node.removeEventListener("pointerdown", down); node.removeEventListener("click", click, true); }
  }
  function listen(enabled: boolean) {
    if (enabled === listening) return;
    listening = enabled;
    if (enabled) {
      node.addEventListener("pointerdown", down);
      node.addEventListener("click", click, true);
      node.addEventListener("lostpointercapture", pointerCancel);
      window.addEventListener("pointermove", move, { capture: true, passive: false });
      window.addEventListener("pointerup", finish, true);
      window.addEventListener("pointercancel", pointerCancel, true);
      window.addEventListener("keydown", keyDown, true);
      window.addEventListener("blur", cancel);
    } else {
      if (!suppressSwipeClick) { node.removeEventListener("pointerdown", down); node.removeEventListener("click", click, true); }
      node.removeEventListener("lostpointercapture", pointerCancel);
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", finish, true);
      window.removeEventListener("pointercancel", pointerCancel, true);
      window.removeEventListener("keydown", keyDown, true);
      window.removeEventListener("blur", cancel);
    }
  }
  listen(!!options);
  return {
    update(nextOptions: SwipeTabsOptions | undefined) { if (!nextOptions) cancel(); options = nextOptions; listen(!!options); },
    destroy() { cancel(); listen(false); clearCanceledClick(); },
  };
}
