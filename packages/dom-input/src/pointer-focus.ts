export function releasePointerFocus(event: PointerEvent) {
  const target = event.currentTarget;
  if (!(target instanceof HTMLElement)) return;
  target.ownerDocument.defaultView?.requestAnimationFrame(() => {
    if (target.ownerDocument.activeElement === target) target.blur();
  });
}
