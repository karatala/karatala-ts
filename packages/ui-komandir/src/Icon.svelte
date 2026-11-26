<script lang="ts">
  import { getContext } from "svelte";
  import SvgIcon from "./SvgIcon.svelte";

  import { useKomandirUiHost, ICON_THEME_ENABLED, type IconName, type CommandIconReference } from "./host";
  const { iconImage, iconFallback, ensureReferencedTheme, referencedIcon, themedIcon, commandIconUrl, iconFileReference, iconThemeReference } = useKomandirUiHost();
  const themeEnabled = getContext<boolean>(ICON_THEME_ENABLED) ?? true;
  let { name, value, themeKey, reference, applicationUrl, size, lazy = false, centerArtwork = false, themed = themeEnabled, class: className = "" }: { name?: IconName; value?: string; themeKey?: string; reference?: CommandIconReference; applicationUrl?: string; size?: number; lazy?: boolean; centerArtwork?: boolean; themed?: boolean; class?: string } = $props();
  let failedUrl = $state<string>();
  let failedCustomUrl = $state<string>();
  let failedApplicationUrl = $state<string>();
  let loadedApplicationUrl = $state<string>();
  let themeReference = $derived(iconThemeReference(value));
  let fileReference = $derived(reference ?? iconFileReference(value));
  let customUrl = $derived(fileReference && commandIconUrl(fileReference, size && size > 16 ? 32 : 16));
  let custom2x = $derived(fileReference && (!size || size <= 16) ? commandIconUrl(fileReference, 32) : undefined);
  let commandImage = $derived(customUrl && customUrl !== failedCustomUrl ? customUrl : undefined);
  let extensionImage = $derived(themed && applicationUrl && themeKey ? themedIcon(undefined, value, themeKey)?.url : undefined);
  let nativeImage = $derived(!commandImage && (!extensionImage || extensionImage === failedUrl) && applicationUrl !== failedApplicationUrl ? applicationUrl : undefined);
  let asset = $derived(themeReference ? referencedIcon(themeReference) : themed ? themedIcon(name, value, themeKey) : undefined);
  let url = $derived(commandImage ?? asset?.url);
  let vector = $derived(!commandImage && asset?.viewBox && url !== failedUrl ? asset : undefined);
  let themeImage = $derived(!vector && url && url !== failedUrl ? url : undefined);
  let image = $derived(vector || themeImage ? undefined : iconImage(name ?? (fileReference || themeReference ? "fileEntries.file" : undefined), fileReference || themeReference ? undefined : value));
  $effect(() => { if (themeReference) ensureReferencedTheme(themeReference.themeId); });
</script>

{#snippet baseIcon(extraClass: string)}
<span class={`app-icon ${extraClass}`} class:svg-icon={Boolean(image)} class:theme-icon={Boolean(themeImage || vector)} aria-hidden="true" style:--app-icon-size={size ? `${size}px` : undefined} style:--app-icon-image={image}>
  {#if vector?.viewBox}
    {@const vectorUrl = vector.url}
    {#key vectorUrl}
      <SvgIcon url={vectorUrl} viewBox={vector.viewBox} {lazy} {centerArtwork} onError={() => failedUrl = vectorUrl} />
    {/key}
  {:else if themeImage}
    {#key themeImage}
      <img src={themeImage} srcset={themeImage === customUrl && custom2x ? `${custom2x} 2x` : undefined} alt="" draggable={false} decoding="async" loading={lazy ? "lazy" : undefined} onerror={event => {
        const failed = event.currentTarget.getAttribute("src") ?? undefined;
        if (failed === customUrl) failedCustomUrl = failed;
        else failedUrl = failed;
      }} />
    {/key}
  {:else if !image}
    {iconFallback(name, fileReference ? undefined : value)}
  {/if}
</span>
{/snippet}

{#if nativeImage}
  {@const nativeSource = nativeImage}
  <span class={`app-icon application-icon ${className}`} class:loaded={loadedApplicationUrl === nativeSource} style:--app-icon-size={size ? `${size}px` : undefined} aria-hidden="true">
    {@render baseIcon("application-placeholder")}
    {#key nativeSource}
      <img src={nativeSource} alt="" draggable={false} decoding="async" loading={lazy ? "lazy" : undefined}
        onload={() => loadedApplicationUrl = nativeSource} onerror={() => { failedApplicationUrl = nativeSource; loadedApplicationUrl = undefined; }} />
    {/key}
  </span>
{:else}
  {@render baseIcon(className)}
{/if}

<style>
  .app-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: var(--app-icon-size, 16px);
    height: var(--app-icon-size, 16px);
    color: inherit;
    line-height: 1;
    vertical-align: middle;
    pointer-events: none;
  }
  .app-icon:not(.svg-icon):not(.theme-icon) {
    width: auto;
    min-width: var(--app-icon-size, 16px);
  }
  .theme-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .application-icon { position: relative; }
  .application-icon > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; opacity: 0; }
  .application-icon.loaded > img { opacity: 1; }
  .application-icon.loaded > :global(.application-placeholder) { visibility: hidden; }
  .svg-icon {
    background-color: currentColor;
    -webkit-mask: var(--app-icon-image) center / contain no-repeat;
    mask: var(--app-icon-image) center / contain no-repeat;
  }
</style>
