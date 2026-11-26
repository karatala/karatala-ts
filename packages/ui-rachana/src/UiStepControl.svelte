<script lang="ts">
  import UiButton from "./UiButton.svelte";
  import { uiIcons } from "./icons";
  let { label, caption, upLabel, downLabel, upShortcut, downShortcut, upShortcutId, downShortcutId, disabled = false, upDisabled = false, downDisabled = false, onup, ondown }: { label: string; caption: string; upLabel: string; downLabel: string; upShortcut?: string; downShortcut?: string; upShortcutId?: string; downShortcutId?: string; disabled?: boolean; upDisabled?: boolean; downDisabled?: boolean; onup: () => void; ondown: () => void } = $props();
  let wheelDistance = 0;
  function wheel(event: WheelEvent) {
    if (disabled || upDisabled && downDisabled) return;
    event.preventDefault();
    wheelDistance += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
    if (Math.abs(wheelDistance) < 40) return;
    if (wheelDistance < 0) { if (!upDisabled) onup(); } else if (!downDisabled) ondown();
    wheelDistance = 0;
  }
</script>

<div class="ui-compact-action-group is-vertical palette-step-control" role="group" aria-label={label} onwheel={wheel}>
  <UiButton toolbar variant="icon" label={upLabel} data-ui-shortcut={upShortcut || undefined} data-ui-shortcut-id={upShortcutId} path={uiIcons.arrowUp} disabled={disabled || upDisabled} onclick={onup} />
  <UiButton toolbar variant="icon" label={downLabel} data-ui-shortcut={downShortcut || undefined} data-ui-shortcut-id={downShortcutId} path={uiIcons.arrowDown} disabled={disabled || downDisabled} onclick={ondown} />
  <span aria-hidden="true">{caption}</span>
</div>

<style>
  .palette-step-control { position: relative; display: grid; grid-template-rows: 1fr 1fr; width: 32px; flex: none; align-items: stretch; }
  span { position: absolute; z-index: 1; top: 50%; left: 0; right: 0; transform: translateY(-50%); font-size: 9px; line-height: 12px; text-align: center; pointer-events: none; }
</style>
