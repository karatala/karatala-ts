import type { Action } from "svelte/action";

export const holdContextMenu: Action<HTMLElement, string> = (viewport, selector) => {
  let pending: { id: number; origin: HTMLElement; left: number; top: number } | undefined;
  let held: { id: number; released: boolean; until: number } | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let dispatching = false;

  function cancel(): void {
    clearTimeout(timer);
    timer = undefined;
    pending = undefined;
  }
  function clear(): void { cancel(); held = undefined; }
  function complete(): void {
    if (pending) held = { id: pending.id, released: false, until: 0 };
    cancel();
  }
  function blocked(): boolean { return Boolean(held && (!held.released || Date.now() < held.until)); }

  function pointer(event: PointerEvent): void {
    held = undefined;
    if (!event.isPrimary || pending && pending.id !== event.pointerId) cancel();
  }
  function start(event: PointerEvent): void {
    if (!selector || pending || !event.isPrimary || event.button !== 0 || event.pointerType === "mouse" || !(event.target instanceof Element)) return;
    const origin = event.target.closest<HTMLElement>("[data-hold-context]");
    if (!origin?.matches(selector) || !viewport.contains(origin)) return;
    pending = { id: event.pointerId, origin, left: event.clientX, top: event.clientY };
    timer = setTimeout(() => {
      const press = pending;
      if (!press?.origin.isConnected) { cancel(); return; }
      complete();
      dispatching = true;
      try { press.origin.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: 2, clientX: press.left, clientY: press.top })); }
      finally { dispatching = false; }
    }, 500);
  }
  function move(event: PointerEvent): void {
    if (pending?.id === event.pointerId && Math.hypot(event.clientX - pending.left, event.clientY - pending.top) > 10) cancel();
  }
  function release(event: PointerEvent): void {
    if (held?.id === event.pointerId) {
      held.released = true;
      held.until = Date.now() + 1000;
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    if (pending?.id === event.pointerId) cancel();
  }
  function cancelled(event: PointerEvent): void {
    if (held?.id === event.pointerId) {
      held.released = true;
      held.until = Date.now() + 1000;
    }
    cancel();
  }
  function context(event: MouseEvent): void {
    if (dispatching) return;
    if (blocked()) { event.preventDefault(); event.stopImmediatePropagation(); }
    else if (pending?.origin.contains(event.target as Node)) complete();
  }
  function click(event: MouseEvent): void {
    if (!blocked() || !event.detail) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  window.addEventListener("pointerdown", pointer, true);
  viewport.addEventListener("pointerdown", start);
  window.addEventListener("pointermove", move, true);
  window.addEventListener("pointerup", release, true);
  window.addEventListener("pointercancel", cancelled, true);
  window.addEventListener("scroll", cancel, true);
  window.addEventListener("blur", clear);
  window.addEventListener("contextmenu", context, true);
  window.addEventListener("click", click, true);
  window.addEventListener("dblclick", click, true);
  return {
    update(next) { selector = next; cancel(); },
    destroy() {
      clear();
      window.removeEventListener("pointerdown", pointer, true);
      viewport.removeEventListener("pointerdown", start);
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", release, true);
      window.removeEventListener("pointercancel", cancelled, true);
      window.removeEventListener("scroll", cancel, true);
      window.removeEventListener("blur", clear);
      window.removeEventListener("contextmenu", context, true);
      window.removeEventListener("click", click, true);
      window.removeEventListener("dblclick", click, true);
    },
  };
};
