function parseHexColor(color: string) {
  const normalized = color.trim();
  const shortMatch = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(normalized);
  if (shortMatch) return shortMatch.slice(1).map((component) => Number.parseInt(component + component, 16));
  const fullMatch = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(normalized);
  return fullMatch ? fullMatch.slice(1).map((component) => Number.parseInt(component, 16)) : null;
}

export function getContrastTextColor(background: string) {
  const components = parseHexColor(background);
  if (!components) return "#fff";
  const luminance = components.map((component) => {
    const normalized = component / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * luminance[0] + 0.7152 * luminance[1] + 0.0722 * luminance[2] > 0.38 ? "#171920" : "#fff";
}
