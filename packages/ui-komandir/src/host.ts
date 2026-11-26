import { getContext, setContext } from "svelte";
import builtin from "./builtin-icons.json";
import { iconFileReference, iconThemeReference } from "./icon-references";

export type IconName = string;
export interface CommandIconReference { path: string; index?: number; program?: boolean; version?: string }
export interface IconFileReference { path: string; index?: number }
export interface ThemeIconReference { themeId: string; assetId: string }
type Asset = { url: string; viewBox?: string };
export type ToolGeometry = { left: number; top: number; width: number; height: number; maximized: boolean };
type WindowState = { toolWindows?: Record<string, ToolGeometry> };
export interface KomandirUiHost {
  message(text: string, values?: Record<string, string | number>): string;
  iconImage(name?: IconName, value?: string): string | undefined;
  iconFallback(name?: IconName, value?: string): string;
  iconFileReference(value?: string): IconFileReference | undefined;
  iconThemeReference(value?: string): ThemeIconReference | undefined;
  ensureReferencedTheme(themeId: string): void;
  referencedIcon(reference: ThemeIconReference): Asset | undefined;
  themedIcon(name?: IconName, value?: string, key?: string): Asset | undefined;
  commandIconUrl(reference: CommandIconReference, size?: 16 | 32): string;
  loadInterfaceState(signal: AbortSignal): Promise<WindowState>;
  saveInterfaceState(state: WindowState): Promise<unknown>;
}
export const ICON_THEME_ENABLED = Symbol("icon-theme-enabled");
const hostKey = Symbol("komandir-ui-host");
const icons: Record<string, { svg?: string; fallback: string }> = builtin;
const defaults: KomandirUiHost = {
  message: (text, values) => text.replace(/\{([^}]+)\}/g, (match, key: string) => String(values?.[key] ?? match)),
  iconImage: (name, value) => { const icon = icons[value ?? name ?? ""]?.svg; return icon ? `url("data:image/svg+xml,${encodeURIComponent(icon)}")` : undefined; },
  iconFallback: (name, value) => value ?? icons[name ?? ""]?.fallback ?? "",
  iconFileReference,
  iconThemeReference,
  ensureReferencedTheme: () => { throw new Error("Icon theme loading is not configured. Provide an icon-theme host before using a theme reference."); },
  referencedIcon: () => undefined,
  themedIcon: () => undefined,
  commandIconUrl: () => { throw new Error("Command icon access is not configured. Provide a command-icon host before using a file reference."); },
  loadInterfaceState: async () => { throw new Error("Window storage is not configured. Omit stateKey or provide a window-storage host."); },
  saveInterfaceState: async () => { throw new Error("Window storage is not configured. Omit stateKey or provide a window-storage host."); },
};
export function provideKomandirUiHost(host: Partial<KomandirUiHost>): void { setContext(hostKey, { ...defaults, ...host }); }
export function useKomandirUiHost(): KomandirUiHost { return getContext<KomandirUiHost | undefined>(hostKey) ?? defaults; }
