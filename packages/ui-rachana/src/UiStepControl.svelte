<script lang="ts">
  import type { Snippet } from "svelte";
  import UiButton from "./UiButton.svelte";
  import { uiIcons } from "./icons";

  type ArrowPair = {
    upLabel: string;
    downLabel: string;
    upShortcut?: string;
    downShortcut?: string;
    upShortcutId?: string;
    downShortcutId?: string;
    disabled?: boolean;
    upDisabled?: boolean;
    downDisabled?: boolean;
    onup: () => void;
    ondown: () => void;
    children?: Snippet;
  };

  let { label, caption, orientation = "vertical", ...actions }: { label: string; caption?: string; orientation?: "vertical" | "horizontal" } & (ArrowPair | { children: Snippet }) = $props();
  const step = $derived("onup" in actions ? actions : undefined);
  let wheelDistance = 0;

  function wheel(event: WheelEvent) {
    if (!step || step.disabled || step.upDisabled && step.downDisabled) return;
    event.preventDefault();
    wheelDistance += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
    if (Math.abs(wheelDistance) < 40) return;
    if (wheelDistance < 0) { if (!step.upDisabled) step.onup(); } else if (!step.downDisabled) step.ondown();
    wheelDistance = 0;
  }
</script>

<div class="ui-compact-action-group palette-step-control" class:is-vertical={orientation === "vertical"} class:is-horizontal={orientation === "horizontal"} class:has-caption={!!caption} role="group" aria-label={label} onwheel={step ? wheel : undefined}>
  {#if step}
    <UiButton toolbar variant="icon" label={step.upLabel} data-ui-shortcut={step.upShortcut || undefined} data-ui-shortcut-id={step.upShortcutId} path={uiIcons.arrowUp} disabled={step.disabled || step.upDisabled} onclick={step.onup} />
    <UiButton toolbar variant="icon" label={step.downLabel} data-ui-shortcut={step.downShortcut || undefined} data-ui-shortcut-id={step.downShortcutId} path={uiIcons.arrowDown} disabled={step.disabled || step.downDisabled} onclick={step.ondown} />
  {/if}
  {@render actions.children?.()}
  {#if caption}
    <span aria-hidden="true">{caption}</span>
  {/if}
</div>

<style>
  .palette-step-control { position: relative; display: grid; flex: none; align-items: stretch; }
  .is-vertical { grid-template-rows: 1fr 1fr; width: 32px; }
  .is-horizontal { grid-auto-flow: column; }
  span { position: absolute; z-index: 1; inset-inline: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 9px; line-height: 12px; text-align: center; pointer-events: none; }
  .is-vertical > span { top: 50%; transform: translateY(-50%); }
  .is-horizontal > span { top: 0; }
  .is-horizontal.has-caption { padding-block-start: 12px; }
</style>
