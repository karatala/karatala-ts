<script lang="ts">
  import { useKomandirUiHost } from "./host";
  import Button from "./Button.svelte";
  import MiniPopup from "./MiniPopup.svelte";
  import ColorPickerCore from "./internal/ColorPickerCore.svelte";
  const { message } = useKomandirUiHost();
  let { value, label, class: className = "", onChange }: { value: string; label: string; class?: string; onChange(value: string): void } = $props();
</script>

<ColorPickerCore {value} {label} {onChange} translate={message}>
  {#snippet trigger(control)}
    <Button class={`ui-color-picker ${className}`} style={`--color-picker-value:${control.color}`} aria-label={`${label}: ${value}`} title={`${label}: ${value}`} aria-haspopup="dialog" aria-expanded={control.open} onclick={control.toggle}><span class="color-picker-swatch" aria-hidden="true"></span></Button>
  {/snippet}
  {#snippet popup(surface)}
    <MiniPopup title={surface.label} trigger={surface.trigger} initialFocus={surface.initialFocus} class="color-picker-popup" onClose={surface.close} onFocusReturn={surface.returnFocus}>
      {@render surface.content()}
    </MiniPopup>
  {/snippet}
</ColorPickerCore>
