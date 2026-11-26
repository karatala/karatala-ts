import { popupContains } from "./portal.ts";

interface Overlay {
  root: HTMLElement;
  close(event: KeyboardEvent): boolean | void;
}

const overlays: Overlay[] = [];

function topOverlay(candidates: Overlay[], target: EventTarget | null): Overlay | undefined {
  const visible = candidates.filter(overlay => overlay.root.isConnected && !overlay.root.closest("[inert]"));
  const leaves = visible.filter(overlay => !visible.some(other => other !== overlay && popupContains(overlay.root, other.root)));
  return (target instanceof Node ? leaves.filter(overlay => popupContains(overlay.root, target)).at(-1) : undefined) ?? leaves.at(-1);
}

function escape(event: KeyboardEvent): void {
  if (event.key !== "Escape" || event.defaultPrevented || event.isComposing) return;
  const overlay = topOverlay(overlays, event.target);
  if (!overlay || overlay.close(event) === false) return;
  event.preventDefault();
  event.stopPropagation();
}

export function registerOverlay(root: HTMLElement, close: Overlay["close"]): () => void {
  const overlay = { root, close };
  if (overlays.length === 0) window.addEventListener("keydown", escape);
  overlays.push(overlay);
  root.addEventListener("keydown", escape);
  return () => {
    root.removeEventListener("keydown", escape);
    overlays.splice(overlays.indexOf(overlay), 1);
    if (overlays.length === 0) window.removeEventListener("keydown", escape);
  };
}

export function focusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('button, input, select, textarea, summary, a[href], [tabindex], [contenteditable="true"]')).filter(element => popupContains(root, element) && element.tabIndex >= 0 && !element.matches(":disabled") && !element.closest("[inert]") && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden").sort((first, second) => (first.tabIndex > 0 ? first.tabIndex : Infinity) - (second.tabIndex > 0 ? second.tabIndex : Infinity));
}

export function containModalTab(root: HTMLElement): () => void {
  const key = (event: KeyboardEvent) => {
    if (event.key !== "Tab" || event.defaultPrevented || topOverlay(overlays.filter(overlay => overlay.root.getAttribute("aria-modal") === "true"), event.target)?.root !== root) return;
    const controls = focusableElements(root);
    const active = document.activeElement;
    const first = controls[0];
    const last = controls.at(-1);
    if (!first || !popupContains(root, active ?? document.body) || event.shiftKey && (active === first || active === root) || !event.shiftKey && (active === last || active === root)) {
      event.preventDefault();
      (event.shiftKey ? last ?? root : first ?? root).focus({ preventScroll: true });
    }
  };
  window.addEventListener("keydown", key);
  return () => window.removeEventListener("keydown", key);
}

export function returnFocus(onFocusReturn: () => void): void {
  requestAnimationFrame(() => { if (document.activeElement === document.body) onFocusReturn(); });
}
