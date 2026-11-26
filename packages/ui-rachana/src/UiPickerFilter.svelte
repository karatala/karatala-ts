<script lang="ts">
  import UiTextInput from "./UiTextInput.svelte";
  import type { Snippet } from "svelte";
  import { useTranslation } from "./host";
  import UiSegmentedButton from "./UiSegmentedButton.svelte";
  import UiSegmentedGroup from "./UiSegmentedGroup.svelte";
  import { uiIcons } from "./icons";

  let { query = $bindable(""), favoritesOnly = $bindable(false), searchLabel, showSearch = true, searchInput = $bindable(), children, onchange }: {
    query?: string;
    favoritesOnly?: boolean;
    searchLabel: string;
    showSearch?: boolean;
    searchInput?: HTMLInputElement;
    children: Snippet;
    onchange?: () => void;
  } = $props();
  const language = useTranslation();
</script>

<div class="instrument-source-filter">
  <UiSegmentedGroup label={searchLabel}>
    {@render children()}
    <UiSegmentedButton class="instrument-favorites-filter" path={uiIcons.star} label={language.translate("Favorites only")} active={favoritesOnly} onclick={() => { favoritesOnly = !favoritesOnly; onchange?.(); }} />
  </UiSegmentedGroup>
</div>
{#if showSearch}
  <div class="instrument-search">
    <UiTextInput bind:input={searchInput} type="search" bind:value={query} placeholder={searchLabel} aria-label={searchLabel} oninput={() => onchange?.()} />
  </div>
{/if}
