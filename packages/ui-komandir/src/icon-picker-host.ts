import { getContext, setContext } from "svelte";
import type { CommandIconReference, KomandirUiHost } from "./host";

export interface IconThemeSummary { id: string; name: string; revision: number; readonly: boolean; bundled?: boolean; assetCount: number; fallbackId?: string }
export interface IconThemeAsset { id: string; label: string; viewBox?: string; category?: string; duplicateOf?: string; sourcePath?: string; aliasTarget?: string; changes?: string[] }
export interface IconTheme extends IconThemeSummary { assets: IconThemeAsset[]; mappings: Record<string, string> }
export interface CachedCommandIcon { path: string; index: number; name: string; version: string }
export interface CachedCommandIcons { icons: CachedCommandIcon[]; total: number }
export interface CommandIconCatalog { version: string; icons: { index: number; name: string }[] }
export interface IconChoice { name: string; iconify: string; label: string }
export type MessageFormatter = KomandirUiHost["message"];

export interface IconPickerHost {
  choices: readonly IconChoice[];
  valueError: string;
  isConfiguredIcon(value: unknown): value is string;
  searchTranslation(text: string): string;
  activeIconThemeId(): string;
  cachedIconTheme(id: string, revision: number): IconTheme | undefined;
  rememberIconTheme(theme: IconTheme): void;
  loadIconThemes(signal: AbortSignal): Promise<IconThemeSummary[]>;
  loadIconTheme(id: string, signal: AbortSignal): Promise<IconTheme>;
  loadCommandIconCatalog(path: string, signal: AbortSignal): Promise<CommandIconCatalog>;
  loadCachedCommandIcons(filter: string, limit: number, signal: AbortSignal): Promise<CachedCommandIcons>;
}

const hostKey = Symbol("komandir-icon-picker-host");
export function provideIconPickerHost(host: IconPickerHost): void { setContext(hostKey, host); }
export function useIconPickerHost(): IconPickerHost {
  const host = getContext<IconPickerHost | undefined>(hostKey);
  if (!host) throw new Error("Icon picker loading is not configured. Provide an icon-picker host before rendering IconPicker.");
  return host;
}

export function iconFileValue(reference: CommandIconReference): string { return reference.path + (reference.index === undefined ? "" : `,${reference.index}`); }
export function iconThemeValue(themeId: string, assetId: string): string { return `theme:${themeId}/${assetId}`; }
