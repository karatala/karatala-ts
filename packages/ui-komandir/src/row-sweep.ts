import type { Action } from "svelte/action";

export interface RowSweepChange {
  ids: readonly string[];
  selected: boolean;
}

interface RowSweepOptions {
  order(): readonly string[];
  selection(): ReadonlySet<string>;
  change(selection: Set<string>, change: RowSweepChange): void;
}

export function rowSweepScrollStep(top: number, bounds: { top: number; bottom: number }): number {
  const edge = Math.min(24, (bounds.bottom - bounds.top) / 4);
  return top > bounds.bottom - edge ? 10 : top < bounds.top + edge ? -10 : 0;
}

export const rowSweep: Action<HTMLElement, RowSweepOptions> = (viewport, options) => {
  let gesture: { pointer: number; anchor: string; end: string; order: readonly string[]; baseline: Set<string>; adding: boolean; left: number; top: number; active: boolean } | undefined;
  let frame = 0;
  let suppressClickUntil = 0;

  function start(event: PointerEvent): void {
    if (gesture) return;
    suppressClickUntil = 0;
    if (event.button !== 0 || !event.isPrimary || !(event.target instanceof Element) || !event.target.closest("[data-sweep-handle]")) return;
    const anchor = event.target.closest<HTMLElement>("[data-sweep-row]")?.dataset.sweepRow;
    const order = options.order();
    if (anchor === undefined || !order.includes(anchor)) return;
    const baseline = new Set(options.selection());
    gesture = { pointer: event.pointerId, anchor, end: anchor, order, baseline, adding: !baseline.has(anchor), left: event.clientX, top: event.clientY, active: false };
  }

  function update(): void {
    if (!gesture?.active) return;
    const bounds = viewport.getBoundingClientRect();
    const left = Math.max(bounds.left + 1, Math.min(gesture.left, bounds.right - 1));
    const top = Math.max(bounds.top + 1, Math.min(gesture.top, bounds.bottom - 1));
    const headerBottom = viewport.querySelector("[data-sweep-header]")?.getBoundingClientRect().bottom ?? bounds.top;
    const row = document.elementFromPoint(left, Math.min(bounds.bottom - 1, Math.max(top, headerBottom + 1)))?.closest<HTMLElement>("[data-sweep-row]");
    const end = row?.dataset.sweepRow;
    if (row && end !== undefined && viewport.contains(row) && end !== gesture.end) {
      const last = gesture.order.indexOf(end);
      if (last >= 0) {
        const first = gesture.order.indexOf(gesture.anchor);
        const next = new Set(gesture.baseline);
        const ids = gesture.order.slice(Math.min(first, last), Math.max(first, last) + 1);
        for (const id of ids) {
          if (gesture.adding) next.add(id);
          else next.delete(id);
        }
        gesture.end = end;
        options.change(next, { ids, selected: gesture.adding });
      }
    }
    const step = rowSweepScrollStep(top, bounds);
    if (step) {
      const previous = viewport.scrollTop;
      viewport.scrollTop += step;
      if (viewport.scrollTop !== previous) frame = requestAnimationFrame(update);
    }
  }

  function move(event: PointerEvent): void {
    if (gesture?.pointer !== event.pointerId) return;
    if (event.pointerType === "mouse" && !(event.buttons & 1)) { finish(true); return; }
    if (!gesture.active) {
      if (Math.hypot(event.clientX - gesture.left, event.clientY - gesture.top) < 5) return;
      viewport.setPointerCapture(event.pointerId);
      gesture.active = true;
      // Include the anchor even when the drag begins within the same row.
      const next = new Set(gesture.baseline);
      if (gesture.adding) next.add(gesture.anchor);
      else next.delete(gesture.anchor);
      options.change(next, { ids: [gesture.anchor], selected: gesture.adding });
    }
    gesture.left = event.clientX;
    gesture.top = event.clientY;
    event.preventDefault();
    cancelAnimationFrame(frame);
    update();
  }

  function finish(cancelled: boolean): void {
    const completed = gesture;
    if (!completed) return;
    if (completed.active || cancelled) suppressClickUntil = Date.now() + 1000;
    gesture = undefined;
    cancelAnimationFrame(frame);
    frame = 0;
    if (viewport.hasPointerCapture(completed.pointer)) viewport.releasePointerCapture(completed.pointer);
  }

  function end(event: PointerEvent): void {
    if (gesture?.pointer !== event.pointerId || event.type === "lostpointercapture" && event.target !== viewport) return;
    finish(event.type !== "pointerup");
  }

  function click(event: MouseEvent): void {
    if (Date.now() >= suppressClickUntil || !event.detail) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  function blur(): void { finish(true); }
  function scroll(): void { if (gesture && !gesture.active) finish(true); }

  viewport.addEventListener("pointerdown", start);
  viewport.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("blur", blur);
  viewport.addEventListener("pointercancel", end);
  viewport.addEventListener("lostpointercapture", end);
  viewport.addEventListener("scroll", scroll);
  viewport.addEventListener("click", click, true);
  return {
    update(next) { options = next; },
    destroy() {
      finish(true);
      viewport.removeEventListener("pointerdown", start);
      viewport.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("blur", blur);
      viewport.removeEventListener("pointercancel", end);
      viewport.removeEventListener("lostpointercapture", end);
      viewport.removeEventListener("scroll", scroll);
      viewport.removeEventListener("click", click, true);
    },
  };
};

export function toggleSweepRow(selected: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
