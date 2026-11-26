export function isMenuArrowKey(event: KeyboardEvent) {
  return !event.defaultPrevented && !event.altKey && !event.ctrlKey && !event.metaKey && (event.key === "ArrowDown" || event.key === "ArrowUp");
}

export function hasEscapePriorityOwner(ownerDocument: Document) {
  return [...ownerDocument.querySelectorAll<HTMLElement>("[data-shortcut-recording], [data-ui-tooltip-pinned]")].some(owner => !owner.closest("[inert]") && owner.getClientRects().length > 0);
}

export function menuNavigationIndex(event: KeyboardEvent, length: number, current: number, columns = 1, step = 1, wrap = false) {
  if (!length || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === "Home") return 0;
  if (event.key === "End") return length - 1;
  const offset = event.key === "ArrowDown" ? columns : event.key === "ArrowUp" ? -columns : event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
  if (!offset) return;
  if (current < 0) return offset > 0 ? 0 : length - 1;
  const next = current + offset * step;
  return wrap ? (next % length + length) % length : Math.max(0, Math.min(length - 1, next));
}

export function focusMenuItem(event: KeyboardEvent, menu: HTMLElement, selector: string, columns = 1, wrap = false) {
  const buttons = [...menu.querySelectorAll<HTMLElement>(selector)].filter(button => button.getClientRects().length > 0 && !button.closest("[inert], [hidden]"));
  const current = buttons.findIndex(button => button === menu.ownerDocument.activeElement);
  const idx = menuNavigationIndex(event, buttons.length, current, columns, 1, wrap);
  if (idx === undefined) return;
  event.preventDefault();
  event.stopPropagation();
  buttons[idx].focus();
}
