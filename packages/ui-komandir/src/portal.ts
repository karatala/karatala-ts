const portalOwners = new WeakMap<HTMLElement, HTMLElement | null>();

export function portal(node: HTMLElement, target: string): { destroy(): void } {
  portalOwners.set(node, node.parentElement);
  (document.querySelector(target) ?? document.body).appendChild(node);
  return { destroy: () => { portalOwners.delete(node); node.remove(); } };
}

export function popupContains(root: HTMLElement | null, target: Node): boolean {
  if (!root) return false;
  if (root.contains(target)) return true;
  let current = target instanceof Element ? target : target.parentElement;
  while (current) {
    const host = current.closest<HTMLElement>("[data-ui-portal]");
    const owner = host ? portalOwners.get(host) : null;
    if (!owner) return false;
    if (root.contains(owner)) return true;
    current = owner;
  }
  return false;
}
