<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import Button from "./Button.svelte";
  import { contextSubmenu, type ContextSubmenuHost } from "./context-submenu.ts";

  let { label, caption, children, disabled = false, command }: { label: string; caption?: Snippet; children: Snippet; disabled?: boolean; command?: string } = $props();
  const menu = getContext<ContextSubmenuHost>(contextSubmenu);
  let anchor = $state<HTMLButtonElement>();
  let expanded = $derived(Boolean(anchor && menu.active === anchor));

  function show(focus: boolean): void {
    if (anchor && !disabled) menu.show({ anchor, label, children }, focus);
  }
</script>

<Button class="ui-context-submenu-trigger" role="menuitem" aria-label={label} aria-haspopup="menu" aria-expanded={expanded} aria-controls={expanded ? menu.id : undefined}
  {disabled} data-context-command={command} data-tooltip={label} data-tooltip-when-clipped
  onpointerenter={event => { anchor = event.currentTarget; if (event.pointerType === "mouse") show(false); }}
  onpointerleave={event => { if (event.pointerType === "mouse") menu.leave(); }}
  onclick={event => { anchor = event.currentTarget; show(true); }}
  onkeydown={event => {
    if (event.key !== "ArrowRight") return;
    event.preventDefault();
    event.stopPropagation();
    anchor = event.currentTarget;
    show(true);
  }}>
  {#if caption}{@render caption()}{:else}<span class="ui-menu-caption" data-tooltip-text>{label}</span>{/if}
  <span class="ui-context-chevron" aria-hidden="true">›</span>
</Button>
