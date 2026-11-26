import { createDragMomentum } from "./drag-momentum";

type Axis = { element: HTMLElement; start: number; scale: number };

export function installMiddlePan(ownerWindow: Window) {
  let drag: { pointerId: number; owner: HTMLElement; horizontal: Axis | null; vertical: Axis | null; clientX: number; clientY: number; cursor: string; cursorPriority: string } | null = null;
  let suppressAuxClick = false;
  let momentum: ReturnType<typeof createDragMomentum> | null = null;
  function finish() {
    const previous = drag;
    drag = null;
    if (!previous) return;
    delete previous.owner.dataset.middlePanning;
    previous.owner.style.setProperty("cursor", previous.cursor, previous.cursorPriority);
    if (previous.owner.hasPointerCapture(previous.pointerId)) previous.owner.releasePointerCapture(previous.pointerId);
  }
  function start(event: PointerEvent) {
    momentum?.stop();
    if (event.button !== 1 || drag || !(event.target instanceof Element)) return;
    suppressAuxClick = false;
    if (event.target.closest("[data-middle-pan-local]")) return;
    const redirect = event.target.closest<HTMLElement>("[data-pan-target]");
    const target = redirect?.closest("[data-pan-region]")?.querySelector<HTMLElement>(redirect.dataset.panTarget!) ?? event.target;
    let horizontal: Axis | null = null;
    let vertical: Axis | null = null;
    for (let element: Element | null = target; element; element = element.parentElement) {
      if (!(element instanceof HTMLElement)) continue;
      const style = ownerWindow.getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      if (!horizontal && /^(auto|scroll)$/.test(style.overflowX || style.overflow) && element.scrollWidth > element.clientWidth) horizontal = { element, start: element.scrollLeft, scale: bounds.width / element.offsetWidth || 1 };
      if (!vertical && /^(auto|scroll)$/.test(style.overflowY || style.overflow) && element.scrollHeight > element.clientHeight) vertical = { element, start: element.scrollTop, scale: bounds.height / element.offsetHeight || 1 };
    }
    const owner = horizontal?.element ?? vertical?.element;
    if (!owner) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressAuxClick = true;
    drag = { pointerId: event.pointerId, owner, horizontal, vertical, clientX: event.clientX, clientY: event.clientY, cursor: owner.style.getPropertyValue("cursor"), cursorPriority: owner.style.getPropertyPriority("cursor") };
    owner.dataset.middlePanning = "";
    owner.style.setProperty("cursor", "grabbing", "important");
    owner.setPointerCapture(event.pointerId);
    momentum = createDragMomentum(ownerWindow, (deltaX, deltaY) => {
      if (!owner.isConnected) return false;
      const left = horizontal?.element.scrollLeft ?? 0;
      const top = vertical?.element.scrollTop ?? 0;
      if (horizontal) horizontal.element.scrollLeft += deltaX;
      if (vertical) vertical.element.scrollTop += deltaY;
      return left !== (horizontal?.element.scrollLeft ?? 0) || top !== (vertical?.element.scrollTop ?? 0);
    });
    momentum.begin();
  }
  function move(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!(event.buttons & 4) || !drag.owner.isConnected) { finish(); return; }
    event.preventDefault();
    event.stopImmediatePropagation();
    const left = drag.horizontal?.element.scrollLeft ?? 0;
    const top = drag.vertical?.element.scrollTop ?? 0;
    if (drag.horizontal) drag.horizontal.element.scrollLeft = drag.horizontal.start - (event.clientX - drag.clientX) / drag.horizontal.scale;
    if (drag.vertical) drag.vertical.element.scrollTop = drag.vertical.start - (event.clientY - drag.clientY) / drag.vertical.scale;
    momentum?.sample((drag.horizontal?.element.scrollLeft ?? 0) - left, (drag.vertical?.element.scrollTop ?? 0) - top);
  }
  function end(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (event.type === "pointerup" && event.button !== 1 && event.buttons & 4) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    finish();
    if (event.type === "pointerup") momentum?.release();
    else momentum?.stop();
  }
  function auxiliary(event: MouseEvent) {
    if (event.button !== 1 || !suppressAuxClick) return;
    suppressAuxClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  function keyDown(event: KeyboardEvent) { if (event.key === "Escape") { if (drag) event.preventDefault(); finish(); momentum?.stop(); } }
  function stopMomentum() { momentum?.stop(); }
  ownerWindow.addEventListener("pointerdown", start, true);
  ownerWindow.addEventListener("pointermove", move, true);
  for (const type of ["pointerup", "pointercancel"] as const) ownerWindow.addEventListener(type, end, true);
  ownerWindow.addEventListener("auxclick", auxiliary, true);
  ownerWindow.addEventListener("blur", stopMomentum);
  ownerWindow.addEventListener("wheel", stopMomentum, true);
  ownerWindow.addEventListener("keydown", keyDown, true);
  return () => {
    finish();
    momentum?.stop();
    ownerWindow.removeEventListener("pointerdown", start, true);
    ownerWindow.removeEventListener("pointermove", move, true);
    for (const type of ["pointerup", "pointercancel"] as const) ownerWindow.removeEventListener(type, end, true);
    ownerWindow.removeEventListener("auxclick", auxiliary, true);
    ownerWindow.removeEventListener("blur", stopMomentum);
    ownerWindow.removeEventListener("wheel", stopMomentum, true);
    ownerWindow.removeEventListener("keydown", keyDown, true);
  };
}
