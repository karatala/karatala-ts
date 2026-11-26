export class TooltipTitles {
  private readonly sources = new Map<"pointer" | "focus", Element>();
  private readonly retained = new Map<Element, string>();

  setSource(kind: "pointer" | "focus", source: Element | null): void {
    if (source && !source.closest("iframe, object, embed")) this.sources.set(kind, source);
    else this.sources.delete(kind);
    this.refresh();
  }

  title(element: Element): string | null { return this.retained.get(element) ?? element.getAttribute("title"); }

  refresh(): void {
    const active = new Set<Element>();
    for (const [kind, source] of this.sources) {
      if (!source.isConnected) { this.sources.delete(kind); continue; }
      for (let element: Element | null = source; element; element = element.parentElement) {
        if (element.tagName !== "TITLE") active.add(element);
      }
    }
    for (const element of this.retained.keys()) if (!active.has(element)) this.restore(element);
    for (const element of active) {
      const title = element.getAttribute("title");
      if (title === null) { this.retained.delete(element); continue; }
      if (title === "") continue;
      this.retained.set(element, title);
      element.setAttribute("title", "");
    }
  }

  clear(): void {
    this.sources.clear();
    for (const element of this.retained.keys()) this.restore(element);
  }

  private restore(element: Element): void {
    const title = this.retained.get(element);
    if (title !== undefined && element.getAttribute("title") === "") element.setAttribute("title", title);
    this.retained.delete(element);
  }
}
