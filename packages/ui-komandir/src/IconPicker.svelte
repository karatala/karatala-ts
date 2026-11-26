<script lang="ts">
  import { type IconName, type CommandIconReference, useKomandirUiHost } from "./host";
  import { iconFileReference } from "./icon-references";
  import { iconFileValue, iconThemeValue, useIconPickerHost, type IconTheme, type CachedCommandIcons, type CommandIconCatalog } from "./icon-picker-host";
  import { filterIconAssetGroups, groupIconAssets, iconAssetGroupHint, iconCategoryLabel, iconSearchMatcher, type IconAssetGroup } from "./icon-theme-search";

  const { message } = useKomandirUiHost();
  const { choices: ICON_CHOICES, valueError: ICON_VALUE_ERROR, isConfiguredIcon, searchTranslation, loadCachedCommandIcons, loadCommandIconCatalog, loadIconTheme, loadIconThemes, activeIconThemeId, cachedIconTheme, rememberIconTheme } = useIconPickerHost();
  import Button from "./Button.svelte";
  import Dropdown from "./Dropdown.svelte";
  import IconButton from "./IconButton.svelte";
  import Icon from "./Icon.svelte";
  import HelpButton from "./HelpButton.svelte";
  import MessageBar from "./MessageBar.svelte";
  import MiniPopup from "./MiniPopup.svelte";

  let { value, fallback, fallbackName, fallbackReference, disabled = false, onChange }: {
    value?: string; fallback?: string; fallbackName?: IconName; fallbackReference?: CommandIconReference; disabled?: boolean; onChange(value?: string): void;
  } = $props();
  type Choice = { value: string; label: string; reference?: CommandIconReference; group?: IconAssetGroup; selected?: boolean };
  let anchor = $state<HTMLButtonElement | null>(null);
  let results = $state<HTMLDivElement>();
  let source = $state("");
  let query = $state("");
  let category = $state("");
  let error = $state("");
  let fileError = $state("");
  let cacheError = $state("");
  let themeError = $state("");
  let themes = $state.raw<IconTheme[]>([]);
  let library = $state.raw<CommandIconCatalog>();
  let cached = $state.raw<CachedCommandIcons>({ icons: [], total: 0 });
  let cacheLimit = $state(128);
  let shown = $state(160);
  let loading = $state(false);
  let loadingCache = $state(false);
  let loadingThemes = $state(false);
  let sourceFile = $derived(iconFileReference(source));
  let sourcePath = $derived(sourceFile?.path);
  let valid = $derived(!source.trim() || isConfiguredIcon(source.trim()));
  let themeLibraries = $derived(themes.map(theme => ({ theme, groups: groupIconAssets(theme.assets, asset => theme.bundled ? searchTranslation(asset.label) : asset.label) })));
  let categories = $derived([
    { value: "", label: message("All categories") },
    ...[...new Set(themeLibraries.flatMap(library => library.groups.flatMap(group => group.categories)))].sort().map(value => ({ value, label: iconCategoryLabel(value, message) })),
  ]);
  let choices = $derived.by(() => {
    const matches = iconSearchMatcher(query);
    const icons: Choice[] = [];
    const selectedPath = sourceFile?.path;
    if (!category && library && selectedPath) {
      for (const icon of library.icons) {
        const ref = { path: selectedPath, index: icon.index, version: library.version };
        if (matches(`${selectedPath} ${icon.index} ${icon.name}`)) icons.push({ value: iconFileValue(ref), label: `${icon.name} · ${icon.index}`, reference: ref });
      }
    }
    for (const { theme, groups } of themeLibraries) {
      for (const group of filterIconAssetGroups(groups, query, category, theme.name)) {
        const asset = group.asset;
        icons.push({ value: iconThemeValue(theme.id, asset.id), label: `${theme.bundled ? message(asset.label) : asset.label} · ${theme.name}`, group, selected: group.members.some(member => source.trim() === iconThemeValue(theme.id, member.id)) });
      }
    }
    if (!category) {
      for (const icon of ICON_CHOICES) {
        if (matches(`${icon.iconify} ${icon.name} ${icon.label} ${searchTranslation(icon.label)}`)) icons.push({ value: icon.iconify, label: message(icon.label) });
      }
      for (const icon of cached.icons) {
        if (matches(`${icon.path} ${icon.name} ${icon.index}`)) icons.push({ value: iconFileValue(icon), label: `${icon.name} · ${icon.path} · ${icon.index}`, reference: icon });
      }
    }
    return [...new Map(icons.map(icon => [icon.value, icon])).values()];
  });
  let moreAvailable = $derived(choices.length > shown || !category && cached.total > cached.icons.length && cacheLimit < 4096);

  $effect(() => {
    if (!anchor) return;
    const controller = new AbortController();
    loadingThemes = true;
    themeError = "";
    void (async () => {
      const available = await loadIconThemes(controller.signal);
      const activeId = activeIconThemeId();
      available.sort((left, right) => Number(right.id === activeId) - Number(left.id === activeId));
      const loaded: IconTheme[] = [];
      for (let offset = 0; offset < available.length; offset += 4) {
        const batch = available.slice(offset, offset + 4);
        const results = await Promise.allSettled(batch.map(theme => cachedIconTheme(theme.id, theme.revision) ?? loadIconTheme(theme.id, controller.signal)));
        if (controller.signal.aborted) return;
        for (const [idx, result] of results.entries()) {
          if (result.status === "fulfilled") { rememberIconTheme(result.value); loaded.push(result.value); }
          else themeError = message('Could not read icon theme "{name}". Check its files in Settings > Icon themes.', { name: batch[idx]!.name });
        }
        themes = [...loaded];
      }
    })().catch(() => {
      if (!controller.signal.aborted) themeError = message("Could not read icon themes. Reopen the icon picker to retry.");
    }).finally(() => { if (!controller.signal.aborted) loadingThemes = false; });
    return () => controller.abort();
  });

  $effect(() => {
    const path = anchor ? sourcePath : undefined;
    library = undefined;
    fileError = "";
    loading = Boolean(path);
    if (!path) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void loadCommandIconCatalog(path, controller.signal).then(value => {
        if (!controller.signal.aborted) library = value;
      }).catch(reason => {
        if (!controller.signal.aborted) fileError = reason instanceof Error ? reason.message : message("Could not read icons from this file.");
      }).finally(() => { if (!controller.signal.aborted) loading = false; });
    }, 180);
    return () => { clearTimeout(timer); controller.abort(); };
  });

  $effect(() => {
    if (!anchor) return;
    const filter = query.trim();
    const limit = cacheLimit;
    const controller = new AbortController();
    cacheError = "";
    loadingCache = true;
    const timer = setTimeout(() => {
      void loadCachedCommandIcons(filter, limit, controller.signal).then(value => {
        if (!controller.signal.aborted) cached = value;
      }).catch(() => {
        if (!controller.signal.aborted) cacheError = message("Could not read cached icons.");
      }).finally(() => { if (!controller.signal.aborted) loadingCache = false; });
    }, filter ? 150 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  });

  function choose(next?: string): void {
    const selected = next?.trim() || undefined;
    if (selected && !isConfiguredIcon(selected)) { error = message(ICON_VALUE_ERROR); return; }
    onChange(selected);
    anchor = null;
  }

  function navigate(event: KeyboardEvent): void {
    if (!results || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const buttons = [...results.querySelectorAll<HTMLButtonElement>("button")];
    const idx = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (idx < 0) return;
    const columns = Math.max(1, buttons.filter(button => button.offsetTop === buttons[0]!.offsetTop).length);
    const offset = event.key === "ArrowUp" ? -columns : event.key === "ArrowDown" ? columns : event.key === "ArrowLeft" ? -1 : 1;
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : Math.max(0, Math.min(buttons.length - 1, idx + offset));
    event.preventDefault();
    event.stopPropagation();
    buttons[next]?.focus();
  }
</script>

<div class="icon-picker">
  <span>{message("Icon")}</span>
  <IconButton class="icon-picker-trigger" label={message("Choose icon")} {disabled} aria-haspopup="dialog" aria-expanded={Boolean(anchor)}
    title={value || fallback || message("Inherit")}
    onclick={event => {
      if (anchor) { anchor = null; return; }
      source = value ?? (fallbackReference ? iconFileValue(fallbackReference) : fallback ?? "");
      query = "";
      category = "";
      error = "";
      cached = { icons: [], total: 0 };
      themes = [];
      cacheLimit = 128;
      shown = 160;
      anchor = event.currentTarget;
    }}>
    <Icon name={value ? undefined : fallbackName} value={value ?? fallback} reference={value ? undefined : fallbackReference} />
  </IconButton>
</div>

{#if anchor}
  {@const trigger = anchor}
  <MiniPopup title={message("Choose icon")} {trigger} onClose={() => anchor = null} onFocusReturn={() => trigger.focus({ preventScroll: true })}>
    <input type="search" value={query} aria-label={message("Search icons")} placeholder={message("Search themes, built-in and cached icons…")} spellcheck="false" maxlength="256"
      oninput={event => { query = event.currentTarget.value; cacheLimit = 128; shown = 160; }}
      onkeydown={event => {
        if (event.isComposing) return;
        if (event.key === "ArrowDown") { event.preventDefault(); event.stopPropagation(); results?.querySelector("button")?.focus(); }
        if (event.key === "Enter") { event.preventDefault(); event.stopPropagation(); if (choices[0]) choose(choices[0].value); }
      }} />
    <Dropdown label={message("Icon category")} value={category} options={categories} disabled={loadingThemes || categories.length <= 1} onChange={value => { category = value; shown = 160; }} />
    <div class="icon-picker-results" bind:this={results} role="group" aria-label={message("Available icons")} aria-busy={loading || loadingCache || loadingThemes}>
      {#each choices.slice(0, shown) as icon (icon.value)}
        <IconButton class="icon-picker-choice" label={icon.label} title={icon.group ? iconAssetGroupHint(icon.group, icon.label, message) : icon.value}
          aria-pressed={icon.selected || source.trim() === icon.value} onkeydown={navigate} onclick={() => choose(icon.value)}>
          <Icon value={icon.value} reference={icon.reference} lazy />
        </IconButton>
      {:else}
        <span class="icon-picker-empty" role="status">{message(loading || loadingCache || loadingThemes ? "Loading icons…" : "No matching icons.")}</span>
      {/each}
    </div>
    <Button disabled={!moreAvailable} aria-hidden={!moreAvailable} style={moreAvailable ? undefined : "visibility:hidden"} onclick={() => { shown += 160; if (shown > choices.length) cacheLimit = Math.min(4096, cacheLimit + 128); }}>{message("Show more")}</Button>
    <input class="icon-picker-source" aria-label={message("Icon name or path")} placeholder="theme:papirus/icons/16x16/places/folder-yellow.svg / lucide:folder" value={source} spellcheck="false" maxlength="32776"
      oninput={event => { source = event.currentTarget.value; error = ""; }}
      onkeydown={event => {
        if (event.key === "Enter" && !event.isComposing) { event.preventDefault(); event.stopPropagation(); choose(source); }
      }} />
    {#if fileError || cacheError || themeError || error}
      <MessageBar role="alert" message={error || fileError || cacheError || themeError} />
    {/if}
    <div class="icon-picker-actions">
      <HelpButton message={message("Use lucide:folder, theme:papirus/icons/16x16/places/folder-yellow.svg, a short symbol, or an icon file path. Add ,3 for a resource index. Relative paths and profile variables are supported. Enter or Apply assigns the value.")} />
      <Button onclick={() => choose()}>{message("Inherit")}</Button>
      <Button tone="primary" disabled={!valid} onclick={() => choose(source)}>{message("Apply")}</Button>
    </div>
  </MiniPopup>
{/if}

<style>
  .icon-picker { display: grid; gap: 5px; min-width: 0; align-content: start; color: var(--theme-workbench-muted); font-size: var(--ui-font-small); }
  .icon-picker :global(.icon-picker-trigger) { width: 28px; height: 28px; }
  .icon-picker-source { width: 100%; min-width: 0; }
  .icon-picker-results { display: grid; grid-template-columns: repeat(auto-fill, minmax(30px, 1fr)); grid-auto-rows: 30px; align-content: start; gap: 3px; min-width: 0; min-height: 0; height: min(280px, 40dvh); overflow: auto; scrollbar-gutter: stable; padding: 2px; }
  .icon-picker-results :global(.icon-picker-choice) { width: 100%; height: 30px; min-width: 0; padding: 0; background: transparent; }
  .icon-picker-empty { grid-column: 1 / -1; padding: 6px; color: var(--theme-workbench-muted); }
  .icon-picker-actions { display: flex; align-items: center; justify-content: end; gap: 5px; }
</style>
