export function portal(node: HTMLElement, anchor: HTMLElement | null = node.parentElement) {
  const document = node.ownerDocument;
  const localAnchor = anchor?.ownerDocument === document ? anchor : null;
  const owner = localAnchor?.closest<HTMLElement>("[data-ui-popup]");
  if (owner?.id) node.dataset.uiPopupOwner = owner.id;
  (localAnchor?.closest(".app-shell") ?? document.querySelector(".app-shell") ?? document.body).appendChild(node);
  return { destroy: () => node.remove() };
}

export function popupContains(panel: HTMLElement | null, target: Node): boolean {
  if (!panel) return false;
  if (panel.contains(target)) return true;
  let current = target instanceof Element ? target.closest<HTMLElement>("[data-ui-popup-owner]") : null;
  while (current?.dataset.uiPopupOwner) {
    const owner = current.ownerDocument.getElementById(current.dataset.uiPopupOwner);
    if (owner === panel) return true;
    current = owner?.closest<HTMLElement>("[data-ui-popup-owner]") ?? null;
  }
  return false;
}
