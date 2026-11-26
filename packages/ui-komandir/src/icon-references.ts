import type { IconFileReference, ThemeIconReference } from "./host";
import { isIconThemeAssetPath } from "./icon-theme-path";
export function iconThemeReference(value: string | undefined): ThemeIconReference | undefined {
  const match = /^theme:([a-z0-9][a-z0-9_-]{0,79})\/(.+)$/.exec(value ?? "");
  return match && isIconThemeAssetPath(match[2]) ? { themeId: match[1]!, assetId: match[2]! } : undefined;
}
export function iconFileReference(value: string | undefined): IconFileReference | undefined {
  if (!value || /^theme:/i.test(value) || value.length > 32776 || /[\x00-\x1f\x7f]/.test(value)) return;
  const match = /^(.*?)(?:,\s*(\d{1,5}))?$/.exec(value.trim());
  if (!match) return;
  const path = match[1]!.trim().replace(/^"([^"]*)"$/, "$1");
  const index = match[2] === undefined ? undefined : Number(match[2]);
  if (!path || path.length > 32768 || !/\.(?:png|svg|ico|exe|dll|icl|mun|cpl|ocx|mui)$/i.test(path) || index !== undefined && index > 65535) return;
  return { path, ...(index !== undefined ? { index } : {}) };
}
