export const MAX_ICON_THEME_PATH_LENGTH = 2048;
export const MAX_ICON_THEME_PATH_DEPTH = 16;

export function isSafeIconThemePath(value: unknown): value is string {
  if (typeof value !== "string" || value.length > MAX_ICON_THEME_PATH_LENGTH) return false;
  const parts = value.split("/");
  return parts.length <= MAX_ICON_THEME_PATH_DEPTH && parts.every(part => Boolean(part) && part.length <= 150 && !/^[. ]|[. ]$|[<>:"\\|?*\x00-\x1f\x7f]/.test(part) && !/^(con|prn|aux|nul|com[0-9]|lpt[0-9])[ .]*(?:\.|$)/i.test(part));
}

export function isIconThemeAssetPath(value: unknown): value is string {
  return isSafeIconThemePath(value) && value.startsWith("icons/") && /\.(png|ico|svg)$/i.test(value);
}

export function iconThemeAssetCategory(path: string): string | undefined {
  const parts = path.split("/").slice(1, -1);
  if (/^\d+x\d+(?:@\d+)?$/.test(parts[0] ?? "")) parts.shift();
  return parts.length ? parts.join("/") : undefined;
}
