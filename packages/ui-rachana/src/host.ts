import { getContext, setContext } from "svelte";

export type WindowGeometry = { x: number; y: number; width: number; height: number };
export interface RachanaUiHost {
  translate(text: string, values?: Record<string, string | number>): string;
  iconPathOptions?(path: string): { viewBox: string; fillRule: "evenodd" | "nonzero" } | undefined;
  windowLayouts?: { read(key: string): WindowGeometry | undefined; save(key: string, geometry: WindowGeometry): void };
}
const hostKey = Symbol("rachana-ui-host");
const defaults: RachanaUiHost = { translate: (text, values) => text.replace(/\{([^}]+)\}/g, (match, key: string) => String(values?.[key] ?? match)) };
export function provideRachanaUiHost(host: RachanaUiHost): void { setContext(hostKey, host); }
export function useRachanaUiHost(): RachanaUiHost { return getContext<RachanaUiHost | undefined>(hostKey) ?? defaults; }
export function useTranslation(): RachanaUiHost { return useRachanaUiHost(); }
export function useLanguage(): RachanaUiHost { return useRachanaUiHost(); }
export function useWindowLayouts() { return useRachanaUiHost().windowLayouts; }
