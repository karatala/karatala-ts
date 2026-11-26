type Bounds = { left: number; top: number; right: number; bottom: number };

export function chooseComboMenuLayout(trigger: Bounds, viewport: Bounds, count: number, cellSize: number, gap: number, padding: number, cellHeight = cellSize) {
  const spaces = [
    { side: "right", width: viewport.right - trigger.right - gap, height: viewport.bottom - viewport.top },
    { side: "left", width: trigger.left - viewport.left - gap, height: viewport.bottom - viewport.top },
    { side: "bottom", width: viewport.right - viewport.left, height: viewport.bottom - trigger.bottom - gap },
    { side: "top", width: viewport.right - viewport.left, height: trigger.top - viewport.top - gap },
  ] as const;
  const preferredColumns = Math.max(1, Math.min(4, Math.ceil(Math.sqrt(count))));
  let best = { side: "right" as string, columns: 1, maxHeight: viewport.bottom - viewport.top, visible: -1 };
  for (const space of spaces) {
    if (space.width < cellSize + padding * 2 || space.height < cellHeight + padding * 2) continue;
    const columns = Math.min(preferredColumns, Math.floor((space.width - padding * 2 + gap) / (cellSize + gap)));
    const rows = Math.max(1, Math.floor((space.height - padding * 2 + gap) / (cellHeight + gap)));
    const visible = Math.min(count, columns * rows);
    if (visible > best.visible) best = { side: space.side, columns, maxHeight: space.height, visible };
  }
  return best;
}

export function measureComboMenuItems(menu: HTMLElement, cellSize: number, availableWidth: number) {
  menu.style.setProperty("--combo-columns", "1");
  menu.style.width = "max-content";
  const buttons = [...menu.querySelectorAll<HTMLButtonElement>("[data-combo-value]")];
  const width = Math.min(Math.max(1, availableWidth - 12), Math.max(cellSize, Math.min(160, Math.max(0, ...buttons.map(button => button.scrollWidth)))));
  menu.style.width = `${width + 12}px`;
  const height = Math.max(cellSize, ...buttons.map(button => button.scrollHeight));
  return { width, height };
}
