<script lang="ts">
  import type { Snippet } from "svelte";
  import Button from "./Button.svelte";
  import Icon from "./Icon.svelte";

  interface Props {
    label: string;
    menuLabel: string;
    tooltip?: string;
    shortcutCommand?: string;
    children: Snippet;
    class?: string;
    pressed?: boolean;
    expanded: boolean;
    disabled?: boolean;
    menuDisabled?: boolean;
    onAction(trigger: HTMLButtonElement): void;
    onMenu(trigger: HTMLButtonElement): void;
  }
  let { label, menuLabel, tooltip, shortcutCommand, children, class: className = "", pressed, expanded, disabled = false, menuDisabled = false, onAction, onMenu }: Props = $props();
</script>

<div class={`ui-segmented ui-split-button ${className}`} role="group" aria-label={label}>
  <Button class="ui-split-action" aria-label={label} data-tooltip={tooltip ?? label} data-shortcut-command={shortcutCommand} aria-pressed={pressed} {disabled} onclick={event => onAction(event.currentTarget)}>
    {@render children()}
  </Button>
  <Button class="ui-split-menu" aria-label={menuLabel} data-tooltip={menuLabel} aria-expanded={expanded} aria-haspopup="menu" disabled={menuDisabled} onclick={event => onMenu(event.currentTarget)}>
    <Icon name="sharedControls.dropdown" size={12} />
  </Button>
</div>
