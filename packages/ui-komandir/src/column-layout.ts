/** Files can retain a resized name while keeping metadata at the right edge. */
export function columnLayout(widths: (number | null)[], minimums: number[], alignRight = false): string {
  if (alignRight) {
    const metadata = widths.slice(1);
    const tracks = metadata.map((width, idx) => width === null ? `fit-content(var(--table-column-${idx + 1}-max,2000px))` : `min(${width}px,var(--table-column-${idx + 1}-max,${width}px))`);
    const nameMinimum = `var(--table-name-minimum,${minimums[0]}px)`;
    const name = widths[0] === null ? `minmax(${nameMinimum},1fr) 0px` : `minmax(${nameMinimum},${widths[0]}px) minmax(0,1fr)`;
    const manualWidth = metadata.reduce<number>((sum, width) => sum + (width ?? 0), 0);
    return `--table-columns:${name} ${tracks.join(" ")};--table-min-width:${minimums[0]! + manualWidth}px`;
  }
  const tracks = widths.map((width, idx) => width === null ? `minmax(${minimums[idx]}px, 1fr)` : `${width}px`).join(" ");
  const minimum = widths.reduce<number>((total, width, idx) => total + (width ?? minimums[idx]!), 0);
  return `--table-columns:${tracks};--table-min-width:${minimum}px`;
}
