// Demo snapshots: Rachana application-theme.ts/interface-theme.css and Shravanam theme.css.
// Applications keep their palette functions, settings and system-mode ownership.
type RachanaPalette = { background: string; panels: string; text: string; accent: string };
function rachanaColors(colors: RachanaPalette, light: boolean): Record<string, string> {
  const mix = (base: string, other: string, percent: number) => `color-mix(in srgb, ${base}, ${other} ${percent}%)`;
  return {
    "--theme-background": colors.background, "--theme-panels": colors.panels, "--theme-text": colors.text, "--theme-accent": colors.accent,
    "--ui-surface": colors.background, "--ui-shell-surface": colors.panels,
    "--ui-text": colors.text, "--ui-text-bright": colors.text, "--ui-control-text": colors.text, "--ui-menu-text": colors.text,
    "--ui-text-muted": mix(colors.background, colors.text, 75),
    "--ui-control-surface": mix(colors.background, colors.text, light ? 9 : 7),
    "--ui-menu-surface": "var(--ui-control-surface)",
    "--ui-control-hover": mix(colors.background, colors.text, light ? 16 : 15),
    "--ui-field-surface": light ? mix(colors.background, colors.text, 12) : `color-mix(in srgb, ${colors.panels} 80%, black)`,
    "--ui-accent-fill": colors.accent, "--ui-on-accent": "#ffffff",
    "--ui-accent-fill-hover": mix(colors.accent, light ? colors.text : "white", light ? 12 : 16),
    "--ui-accent": mix(colors.accent, colors.text, 28),
    "--ui-segment-surface": mix(colors.background, colors.text, light ? 16 : 20),
    "--ui-segment-group-surface": mix(colors.panels, colors.text, light ? 19 : 27),
    "--ui-segment-hover": mix(colors.background, colors.text, light ? 22 : 28),
    "--ui-table-selected-surface": "var(--ui-accent-fill)", "--ui-table-selected-text": "var(--ui-on-accent)",
    ...(light ? { "--ui-hover-glow": "none", "--ui-active-glow": "none", "--ui-control-icon-glow": "none" } : {}),
  };
}
export const rachanaPalettes: Record<string, Record<string, string>> = {
  original: rachanaColors({ background: "#20222a", panels: "#171920", text: "#d8dbe3", accent: "#4e7aff" }, false),
  light: rachanaColors({ background: "#f2f3f7", panels: "#e3e6ee", text: "#242936", accent: "#3d65d9" }, true),
  shravanam: {
    "--ui-surface": "#000000", "--ui-shell-surface": "#000000", "--ui-subtle-surface": "#242321",
    "--ui-text": "#e6e1d8", "--ui-text-bright": "#fff6e6", "--ui-text-muted": "#aaa69d",
    "--ui-control-text": "var(--ui-text)", "--ui-menu-text": "var(--ui-text)",
    "--ui-control-surface": "#2b2926", "--ui-control-hover": "#393240", "--ui-field-surface": "var(--ui-control-surface)",
    "--ui-menu-surface": "var(--ui-subtle-surface)", "--ui-accent": "#c4abe8", "--ui-accent-fill": "#8461af", "--ui-on-accent": "#160f20",
    "--ui-accent-fill-hover": "color-mix(in srgb, var(--ui-accent-fill), var(--ui-text) 12%)",
    "--ui-segment-surface": "var(--ui-control-surface)", "--ui-segment-hover": "var(--ui-control-hover)",
    "--ui-segment-active-hover": "var(--ui-accent-fill-hover)", "--ui-glow-strength": "0",
  },
};

export function themePalette(node: HTMLElement, value: { variant: "rachana" | "komandir"; colors: Record<string, string>; mode: "dark" | "light" }) {
  const root = node.ownerDocument.documentElement;
  const previousTheme = root.getAttribute("data-karatala-theme");
  const previous = new Map<string, { value: string; priority: string }>();
  function remember(property: string) { if (!previous.has(property)) previous.set(property, { value: root.style.getPropertyValue(property), priority: root.style.getPropertyPriority(property) }); }
  function restore() { for (const [property, original] of previous) { if (original.value) root.style.setProperty(property, original.value, original.priority); else root.style.removeProperty(property); } }
  function update(next: typeof value) {
    restore();
    root.setAttribute("data-karatala-theme", next.variant);
    remember("color-scheme");
    root.style.setProperty("color-scheme", next.mode);
    for (const [property, color] of Object.entries(next.colors)) { remember(property); root.style.setProperty(property, color); }
  }
  update(value);
  return { update, destroy() { restore(); if (previousTheme === null) root.removeAttribute("data-karatala-theme"); else root.setAttribute("data-karatala-theme", previousTheme); } };
}
