import type { KomandirUiHost } from "@karatala/ui-komandir/host.ts";
import { iconFileReference, iconThemeReference } from "@karatala/ui-komandir/icon-references.ts";
import type { CachedCommandIcon, IconPickerHost, IconTheme } from "@karatala/ui-komandir/icon-picker-host.ts";
import { iconSearchMatcher } from "@karatala/ui-komandir/icon-theme-search.ts";

export function createMemoryIconPickerHost(): { picker: IconPickerHost; icons: Partial<KomandirUiHost> } {
  const theme: IconTheme = {
    id: "memory", name: "Memory theme", revision: 1, readonly: true, bundled: true, assetCount: 3, mappings: {},
    assets: [
      { id: "icons/folder.svg", label: "Folder", category: "places", viewBox: "0 0 24 24", sourcePath: "places/folder.svg" },
      { id: "icons/folder-alias.svg", label: "Directory", category: "places", duplicateOf: "icons/folder.svg", sourcePath: "places/directory.svg" },
      { id: "icons/file.svg", label: "File", category: "mimetypes", viewBox: "0 0 24 24", sourcePath: "mimetypes/file.svg" },
    ],
  };
  const cached: CachedCommandIcon[] = [0, 1].map(idx => ({ path: "/memory/icons/sample.dll", index: idx, name: `Memory resource ${idx}`, version: "memory-1" }));
  const choices = [
    { name: "sharedControls.check", iconify: "sharedControls.check", label: "Check" },
    { name: "sharedControls.remove", iconify: "sharedControls.remove", label: "Close" },
    { name: "sharedControls.dropdown", iconify: "sharedControls.dropdown", label: "Down" },
  ];
  let remembered: IconTheme | undefined;
  return {
    picker: {
      choices,
      valueError: "Use sharedControls.check, theme:memory/icons/folder.svg, a short symbol, or /memory/icons/sample.dll,0.",
      isConfiguredIcon: (value): value is string => typeof value === "string" && Boolean(value.trim()) && !/[\x00-\x1f\x7f]/.test(value) && (/^theme:/i.test(value) ? Boolean(iconThemeReference(value)) : Boolean(iconFileReference(value)) || [...value].length <= 8 || choices.some(choice => choice.name === value)),
      searchTranslation: text => ({ Folder: "Папка", Directory: "Каталог", File: "Файл" })[text as "Folder" | "Directory" | "File"] ?? text,
      activeIconThemeId: () => theme.id,
      cachedIconTheme: (id, revision) => remembered?.id === id && remembered.revision === revision ? remembered : undefined,
      rememberIconTheme: value => { remembered = value; },
      loadIconThemes: async signal => { signal.throwIfAborted(); return [structuredClone(theme)]; },
      loadIconTheme: async (id, signal) => {
        signal.throwIfAborted();
        if (id !== theme.id) throw new Error(`Could not load theme "${id}". Use the Memory theme in this example.`);
        return structuredClone(theme);
      },
      loadCommandIconCatalog: async (path, signal) => {
        signal.throwIfAborted();
        if (path !== cached[0]!.path) throw new Error(`Could not read icons from "${path}". Use /memory/icons/sample.dll in this example.`);
        return { version: "memory-1", icons: cached.map(icon => ({ index: icon.index, name: icon.name })) };
      },
      loadCachedCommandIcons: async (filter, limit, signal) => {
        signal.throwIfAborted();
        const matches = iconSearchMatcher(filter);
        const icons = cached.filter(icon => matches(`${icon.path} ${icon.name} ${icon.index}`));
        return { icons: icons.slice(0, limit), total: icons.length };
      },
    },
    icons: {
      commandIconUrl: reference => reference.index === 1 ? "/memory-file.svg" : "/memory-folder.svg",
      ensureReferencedTheme: () => {},
      referencedIcon: reference => reference.themeId === theme.id && theme.assets.some(asset => asset.id === reference.assetId) ? { url: reference.assetId === "icons/file.svg" ? "/memory-file.svg" : "/memory-folder.svg", viewBox: "0 0 24 24" } : undefined,
    },
  };
}
