<script lang="ts">
  import ColorPickerCore from "@karatala/ui-komandir/color-picker-core.svelte";
  import UiButton from "./UiButton.svelte";
  import UiMiniPopup from "./UiMiniPopup.svelte";
  import { uiIcons } from "./icons";
  import { useLanguage } from "./host";
  let { value, label, class: className = "", onchange }: { value: string; label: string; class?: string; onchange(value: string): void } = $props();
  const language = useLanguage();
  let openingTrigger: HTMLElement | null = null;
  let keyboardOpened = $state(false);
  function open(event: MouseEvent, toggle: (event: MouseEvent) => void) { openingTrigger = event.currentTarget as HTMLElement; keyboardOpened = event.detail === 0; toggle(event); }
  function retainFocus(node: HTMLElement) {
    const origin = openingTrigger;
    const restore = keyboardOpened;
    return { destroy() { if (restore) requestAnimationFrame(() => { if (origin?.isConnected && node.ownerDocument.activeElement === node.ownerDocument.body) origin.focus({ preventScroll: true }); }); } };
  }
</script>

<ColorPickerCore {value} {label} onChange={onchange} translate={(text, values) => language.translate(text, values)}>
  {#snippet trigger(control)}
    <UiButton
      variant="icon"
      class={`ui-color-picker ${className}`}
      label={`${label}: ${value}`}
      title={`${label}: ${value}`}
      style={`--color-picker-value:${control.color}`}
      aria-haspopup="dialog"
      aria-expanded={control.open}
      onclick={event => open(event, control.toggle)}>
      <span class="color-picker-swatch" aria-hidden="true"></span>
    </UiButton>
  {/snippet}
  {#snippet popup(surface)}
    <UiMiniPopup
      open
      anchorElement={surface.trigger ?? undefined}
      label={surface.label}
      initialFocus={surface.initialFocus}
      restoreFocus={keyboardOpened}
      width={320}
      class="color-picker-popup rachana-color-picker"
      onopenchange={next => { if (!next) surface.close(); }}>
      <header class="picker-heading" use:retainFocus>
        <strong>{surface.label}</strong>
        <UiButton variant="icon" filled={false} label={language.translate("Close")} path={uiIcons.close} onclick={surface.close} />
      </header>
      {@render surface.content()}
    </UiMiniPopup>
  {/snippet}
</ColorPickerCore>

<style>
  .picker-heading { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .picker-heading strong { flex: 1; overflow-wrap: anywhere; }
  :global(.rachana-color-picker) {
    --theme-workbench-background: var(--ui-surface);
    --theme-workbench-surface: var(--ui-menu-surface);
    --theme-workbench-foreground: var(--ui-text);
    --theme-workbench-muted: var(--ui-text-muted);
    --theme-workbench-raised: var(--ui-segment-surface);
    --theme-workbench-hover: var(--ui-segment-hover);
    --theme-workbench-accent: var(--ui-accent-fill);
    --ui-font-normal: 12px;
    --ui-font-small: 11px;
  }
</style>
