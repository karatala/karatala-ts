<script module lang="ts">
  export type ContextMenuAction = { label: string; path?: string; disabled?: boolean; run: () => void };
</script>

<script lang="ts">
  import { onDestroy, tick, type Snippet } from "svelte";
  import UiButton from "./UiButton.svelte";
  import { portal } from "./portal";
  import { focusMenuItem, hasEscapePriorityOwner } from "./menu-keyboard";

  let { children, label, onopen, onselect, actionsFor, holdOnMouse = false, class: className = "shell-menu" }: { children: Snippet; label: string; holdOnMouse?: boolean; onopen?: () => void; onselect?: () => void; actionsFor?: (target: Element, clientX?: number) => ContextMenuAction[]; class?: string } = $props();
  let actions = $state.raw<ContextMenuAction[]>([]);
  let menu = $state<HTMLDivElement | null>(null);
  let open = $state(false);
  let left = $state(0);
  let top = $state(0);
  let maxWidth = $state(1);
  let origin: HTMLElement | null = null;
  let keyboardOpened = false;
  let hold: { pointerId: number; startX: number; startY: number; timer: ReturnType<typeof setTimeout> } | null = null;
  let suppressRelease = false;

  function clearHold() { if (hold) clearTimeout(hold.timer); hold = null; }
  function close(restoreFocus = false) { clearHold(); open = false; if (restoreFocus && keyboardOpened) origin?.focus({ preventScroll: true }); }
  function viewportBounds() {
    const viewport = window.visualViewport;
    const root = document.documentElement.getBoundingClientRect();
    const viewportLeft = viewport?.offsetLeft ?? 0;
    const viewportTop = viewport?.offsetTop ?? 0;
    return { left: Math.max(viewportLeft, root.left) + 8, right: Math.min(viewportLeft + (viewport?.width ?? window.innerWidth), root.right) - 8, top: viewportTop + 8, bottom: viewportTop + (viewport?.height ?? window.innerHeight) - 8 };
  }
  function show(target: Element, clientX: number, clientY: number, keyboard = false) {
    const next = actionsFor?.(target, keyboard ? undefined : clientX) ?? (onselect ? [{ label, run: onselect }] : []);
    if (!next.length) return false;
    clearHold();
    origin = target.closest("button") ?? target.querySelector("button") ?? (target instanceof HTMLElement ? target : null);
    keyboardOpened = keyboard;
    onopen?.();
    actions = next;
    const scale = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const viewport = viewportBounds();
    maxWidth = Math.max(1, (viewport.right - viewport.left) / scale);
    left = clientX / scale;
    top = clientY / scale;
    open = true;
    void tick().then(() => place(clientX, clientY, scale));
    return true;
  }

  export function openFromTrigger(trigger: HTMLElement, keyboard: boolean) {
    const bounds = trigger.getBoundingClientRect();
    return show(trigger, bounds.left, bounds.bottom, keyboard);
  }

  function place(clientX: number, clientY: number, scale: number) {
    if (!menu || !open) return;
    const viewport = viewportBounds();
    const bounds = menu.getBoundingClientRect();
    const originLeft = bounds.left - left * scale;
    const originTop = bounds.top - top * scale;
    left = (Math.max(viewport.left, Math.min(clientX, viewport.right - bounds.width)) - originLeft) / scale;
    top = (Math.max(viewport.top, Math.min(clientY, viewport.bottom - bounds.height)) - originTop) / scale;
    menu.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({ preventScroll: true });
  }
  function context(event: MouseEvent) {
    if (event.target instanceof Element && show(event.target, event.clientX, event.clientY)) {
      event.preventDefault(); event.stopPropagation();
    }
  }
  function down(event: PointerEvent) {
    clearHold(); suppressRelease = false;
    if (event.button !== 0 || event.pointerType === "mouse" && !holdOnMouse || !(event.target instanceof Element) || holdOnMouse && event.target.closest("input, select, textarea, [role=slider], [data-hold-action]")) return;
    const target = event.target;
    hold = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, timer: setTimeout(() => {
      suppressRelease = show(target, event.clientX, event.clientY);
    }, 550) };
  }
  function move(event: PointerEvent) { if (hold?.pointerId === event.pointerId && Math.hypot(event.clientX - hold.startX, event.clientY - hold.startY) >= (event.pointerType === "mouse" ? 4 : 10)) clearHold(); }
  function release(event: PointerEvent) { clearHold(); if (suppressRelease) { event.preventDefault(); event.stopPropagation(); } }
  function click(event: MouseEvent) { if (suppressRelease) { event.preventDefault(); event.stopPropagation(); suppressRelease = false; } }
  function triggerKey(event: KeyboardEvent) {
    if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10") || !(event.target instanceof HTMLElement)) return;
    if (openFromTrigger(event.target, true)) { event.preventDefault(); event.stopPropagation(); }
  }
  function keyDown(event: KeyboardEvent) {
    if (!open || event.defaultPrevented) return;
    if (event.key === "Escape" && hasEscapePriorityOwner(menu?.ownerDocument ?? document)) return;
    if (event.key === "Escape" || event.key === "Tab") {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); }
      close(true);
    } else if (event.target instanceof Node && menu?.contains(event.target)) focusMenuItem(event, menu, "button:not(:disabled)", 1, true);
  }
  onDestroy(clearHold);
</script>

<svelte:window onpointerdowncapture={event => { if (open && event.target instanceof Node && !menu?.contains(event.target)) close(); }} onpointermovecapture={move} onpointerupcapture={clearHold} onpointercancelcapture={clearHold} onkeydowncapture={keyDown} onresize={() => close()}
  onscrollcapture={event => { if (open && event.target !== menu) close(); }} onblur={() => close()} />
<div style="display:contents" role="presentation" data-hold-context={actionsFor && !holdOnMouse ? undefined : ""} oncontextmenu={context} onpointerdowncapture={down} onpointerupcapture={release} onpointercancelcapture={release} onclickcapture={click} onkeydown={triggerKey}>
  {@render children()}
</div>
{#if open}
  <div use:portal bind:this={menu} role="menu" aria-label={label} data-application-menu class={`ui-action-menu ${className}`} style:position="fixed" style:box-sizing="border-box" style:width="max-content" style:max-width={`${maxWidth}px`} style:left={`${left}px`} style:top={`${top}px`}>
    {#each actions as action (action.label)}
      <UiButton role="menuitem" label={action.label} text={action.label} path={action.path} disabled={action.disabled} onclick={() => { close(true); action.run(); }} />
    {/each}
  </div>
{/if}
