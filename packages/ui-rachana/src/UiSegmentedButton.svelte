<script lang="ts">
  import type { ComponentProps } from "svelte";
  import UiButton from "./UiButton.svelte";

  let { label, text, path, iconUrl, active, current, labelMode = "all", fillWidth = false, class: className = "", ...buttonProps }: Omit<ComponentProps<typeof UiButton>, "variant"> & { current?: "page"; labelMode?: "all" | "icons" | "active"; fillWidth?: boolean } = $props();
  const hasIcon = $derived(!!(iconUrl || path));
  const visibleText = $derived(hasIcon && (labelMode === "icons" || labelMode === "active" && !active) ? undefined : text);
  const iconOnly = $derived(hasIcon && !visibleText);
</script>

<UiButton
  {...buttonProps}
  {label}
  {path}
  {iconUrl}
  text={visibleText}
  active={current ? undefined : active}
  aria-current={current && active ? current : undefined}
  variant={iconOnly ? "icon" : "text"}
  class={`ui-segmented-button ${iconOnly && !fillWidth ? "is-square" : ""} ${fillWidth ? "is-fill-width" : ""} ${className}`} />

<style>
  :global(.ui-segmented-control .ui-button.ui-segmented-button) { box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; height: var(--ui-tab-button-height, 26px); min-height: var(--ui-tab-button-height, 26px); gap: 4px; }
  :global(.ui-segmented-control .ui-button.ui-segmented-button.is-square) { flex: 0 0 auto; align-self: center; justify-self: center; width: auto; min-width: 0; max-width: none; aspect-ratio: 1; padding: 3px; gap: 0; }
  :global(.ui-segmented-control .ui-button.ui-segmented-button.is-fill-width) { flex: 1 1 0; align-self: stretch; width: 0; min-width: 0; max-width: none; }
  :global(.ui-segmented-control .ui-button.ui-segmented-button svg), :global(.ui-segmented-control .ui-button.ui-segmented-button .ui-raster-icon) { flex: none; width: 16px; height: 16px; }
</style>
