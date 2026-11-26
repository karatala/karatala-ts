import type { IconTheme, IconThemeAsset, MessageFormatter } from "./icon-picker-host";
import { iconThemeValue } from "./icon-picker-host";
import synonyms from "./icon-search-synonyms.json";

export interface IconAssetGroup { asset: IconThemeAsset; members: IconThemeAsset[]; categories: string[]; searchText: string }

export function iconThemeGalleryAssets(theme: IconTheme, sources: readonly IconTheme[]): IconThemeAsset[] {
  if (theme.readonly) return theme.assets;
  return [theme, ...sources.filter(source => source.id !== theme.id)].flatMap(source => source.assets.map(asset => source.id === theme.id ? asset : {
    ...asset,
    id: iconThemeValue(source.id, asset.id),
    ...(asset.duplicateOf ? { duplicateOf: iconThemeValue(source.id, asset.duplicateOf) } : {}),
  }));
}

export function normalizeIconSearch(value: string): string {
  return value.normalize("NFKC").replace(/([a-z])([A-Z])/g, "$1 $2").toLocaleLowerCase().replaceAll("ё", "е").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

const searchSynonyms = new Map(synonyms.flatMap(group => {
  const words = [...new Set(group.map(normalizeIconSearch))];
  return words.map(word => [word, words] as const);
}));

function iconSearchTerms(query: string): string[][] {
  return normalizeIconSearch(query).split(" ").filter(Boolean).map(term => searchSynonyms.get(term) ?? [term]);
}

function matchesIconSearch(text: string, terms: string[][]): boolean {
  return terms.every(alternatives => alternatives.some(term => text.includes(term)));
}

export function iconSearchMatcher(query: string): (value: string) => boolean {
  const terms = iconSearchTerms(query);
  return value => matchesIconSearch(normalizeIconSearch(value), terms);
}

export function groupIconAssets(assets: readonly IconThemeAsset[], label: (asset: IconThemeAsset) => string = asset => asset.label): IconAssetGroup[] {
  const byId = new Map(assets.map(asset => [asset.id, asset]));
  const groups = new Map<string, IconAssetGroup>();
  for (const asset of assets) {
    const canonical = byId.get(asset.duplicateOf ?? asset.id) ?? asset;
    let group = groups.get(canonical.id);
    if (!group) { group = { asset: canonical, members: [], categories: [], searchText: "" }; groups.set(canonical.id, group); }
    group.members.push(asset);
  }
  for (const group of groups.values()) {
    group.categories = [...new Set(group.members.flatMap(asset => asset.category ? [asset.category] : []))].sort();
    group.searchText = normalizeIconSearch(group.members.map(asset => [asset.id, asset.label, label(asset), asset.sourcePath, asset.aliasTarget, asset.category].filter(Boolean).join(" ")).join(" "));
  }
  return [...groups.values()];
}

export function filterIconAssetGroups(groups: readonly IconAssetGroup[], query: string, category = "", extra = ""): IconAssetGroup[] {
  const terms = iconSearchTerms(query);
  const prefix = normalizeIconSearch(extra);
  return groups.filter(group => (!category || group.categories.includes(category)) && matchesIconSearch(`${prefix} ${group.searchText}`, terms));
}

export function iconCategoryLabel(category: string, message: MessageFormatter): string {
  const labels: Record<string, string> = {
    actions: "Actions", apps: "Applications", categories: "Categories", devices: "Devices", emblems: "Emblems",
    emotes: "Emotes", mimetypes: "File types", places: "Places", status: "Status", symbolic: "Symbolic", panel: "Panel icons", "up-to-32": "Up to 32 px",
  };
  return category.split("/").map(part => message(labels[part] ?? part)).join(" / ");
}

export function iconAssetGroupHint(group: IconAssetGroup, label: string, message: MessageFormatter): string {
  const asset = group.asset;
  const lines = [label, message("Source path: {path}", { path: asset.sourcePath ?? asset.id })];
  if (asset.aliasTarget) lines.push(message("Alias of: {path}", { path: asset.aliasTarget }));
  const aliases = group.members.filter(member => member.id !== asset.id);
  if (aliases.length) {
    const names = aliases.slice(0, 6).map(member => member.id.split("/").at(-1)!).join(", ");
    lines.push(message("Aliases: {names}", { names }));
    if (aliases.length > 6) lines.push(message("{count} more aliases", { count: aliases.length - 6 }));
  }
  const changes = new Set(group.members.flatMap(member => member.changes ?? []));
  if (changes.size) {
    const labels: Record<string, string> = { "text-inherit": "Text inherits the current color", "gradient-currentColor": "Gradient uses the current color", "fill-currentColor": "Fill uses the current color" };
    lines.push(...[...changes].map(change => message(labels[change] ?? "Adapted to the current color")));
  }
  return lines.join("\n");
}
