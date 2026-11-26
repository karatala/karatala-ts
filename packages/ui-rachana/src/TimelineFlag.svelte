<script lang="ts">
  import UiButton from "./UiButton.svelte";
  import { getContrastTextColor } from "./color-contrast";

  let { label, text = label, color, title, data, onclick, ondblclick, oncontextmenu }: {
    label: string; text?: string; color: string; title?: string; data?: Record<`data-${string}`, string>;
    onclick?: (event: MouseEvent) => void; ondblclick?: (event: MouseEvent) => void; oncontextmenu?: (event: MouseEvent) => void;
  } = $props();
</script>

<span class="flag" style:--flag-color={color} style:--flag-text={getContrastTextColor(color)}>
  <UiButton {...data} {label} {text} {title} {onclick} {ondblclick} {oncontextmenu} class="flag-button" />
</span>

<style>
  .flag { display: block; flex: 0 0 auto; min-width: 0; max-width: 180px; pointer-events: auto; }
  .flag :global(.flag-button.ui-button), .flag :global(.flag-button.ui-button:hover:where([data-ui-hover="true"] *)), .flag :global(.flag-button.ui-button:active) { height: 20px; min-height: 20px; padding: 0 12px 0 5px; max-width: min(180px, 100%); overflow: hidden; background: var(--flag-color); color: var(--flag-text); border-radius: 0; clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 50%, calc(100% - 5px) 100%, 0 100%); font-size: 11px; white-space: nowrap; box-shadow: none; filter: none; }
  .flag :global(.flag-button span) { overflow: hidden; text-overflow: ellipsis; }
</style>
