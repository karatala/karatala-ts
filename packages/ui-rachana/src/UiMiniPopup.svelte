<script lang="ts">
  import { tick, type Snippet } from "svelte";
  import { portal, popupContains } from "./portal";
  import { focusMenuItem, hasEscapePriorityOwner } from "./menu-keyboard";

  let { children, trigger, anchorElement, anchorPoint, label, initialFocus, restoreFocus = true, open = $bindable(false), onopenchange, class: className = "", width = 288, align = "end", side = "bottom", sideOffset = 6, viewportPadding = 12 }: {
    children: Snippet;
    trigger?: Snippet<[{ onclick: (event: MouseEvent) => void; "aria-haspopup": "dialog"; "aria-expanded": boolean; "aria-controls": string | undefined }]>;
    anchorElement?: HTMLElement;
    anchorPoint?: { x: number; y: number };
    label?: string;
    initialFocus?: string;
    restoreFocus?: boolean;
    open?: boolean;
    onopenchange?: (open: boolean, returnFocus?: boolean) => void;
    class?: string;
    width?: number;
    align?: "start" | "center" | "end";
    side?: "top" | "bottom" | "left" | "right";
    sideOffset?: number;
    viewportPadding?: number;
  } = $props();
  const componentId = $props.id();
  const popupId = `${componentId}-popup`;
  let triggerAnchor = $state<HTMLElement | null>(null);
  const anchor = $derived(anchorElement ?? triggerAnchor);
  let panel = $state<HTMLDivElement | null>(null);
  let left = $state(0);
  let top = $state(0);
  let openedWithPointer = false;
  let tooltipDetail = $state<string | undefined>();
  let shortcut = $state<string | undefined>();
  const actionSelector = 'button:not(:disabled, [tabindex="-1"], [role="slider"], [role="combobox"], [aria-haspopup="listbox"])';

  function close(restoreToAnchor = false) {
    if (!open) return;
    open = false;
    onopenchange?.(false, restoreToAnchor && restoreFocus && !openedWithPointer);
    if (restoreToAnchor && restoreFocus && !openedWithPointer) anchor?.focus({ preventScroll: true });
  }

  async function toggle(event: MouseEvent) {
    const clicked = event.currentTarget as HTMLElement;
    triggerAnchor = clicked;
    if (open) { close(); return; }
    openedWithPointer = event.detail > 0;
    tooltipDetail = clicked.closest<HTMLElement>("[data-ui-tooltip-detail]")?.dataset.uiTooltipDetail;
    shortcut = clicked.closest<HTMLElement>("[data-ui-shortcut]")?.dataset.uiShortcut;
    open = true;
    onopenchange?.(true);
    if (openedWithPointer) clicked.blur();
    await tick();
    if (open && !openedWithPointer) (panel?.querySelector<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]') ?? panel)?.focus({ preventScroll: true });
  }

  function place() {
    if (!anchor || !panel) return;
    if (!anchor.isConnected) { close(); return; }
    const viewport = window.visualViewport;
    const scale = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const leftEdge = (viewport?.offsetLeft ?? 0) + viewportPadding;
    const topEdge = (viewport?.offsetTop ?? 0) + viewportPadding;
    const rightEdge = leftEdge + (viewport?.width ?? window.innerWidth) - viewportPadding * 2;
    const bottomEdge = topEdge + (viewport?.height ?? window.innerHeight) - viewportPadding * 2;
    panel.style.setProperty("--mini-popup-max-width", `${Math.max(0, rightEdge - leftEdge) / scale}px`);
    panel.style.maxHeight = `${Math.max(0, bottomEdge - topEdge) / scale}px`;
    const bounds = anchorPoint ? { left: anchorPoint.x, right: anchorPoint.x, top: anchorPoint.y, bottom: anchorPoint.y } : anchor.getBoundingClientRect();
    const size = panel.getBoundingClientRect();
    const gap = sideOffset * scale;
    const vertical = side === "top" || side === "bottom";
    const preferredSpace = side === "top" ? bounds.top - topEdge : side === "bottom" ? bottomEdge - bounds.bottom : side === "left" ? bounds.left - leftEdge : rightEdge - bounds.right;
    const oppositeSpace = side === "top" ? bottomEdge - bounds.bottom : side === "bottom" ? bounds.top - topEdge : side === "left" ? rightEdge - bounds.right : bounds.left - leftEdge;
    const flip = preferredSpace < (vertical ? size.height : size.width) + gap && oppositeSpace > preferredSpace;
    const before = (side === "top" || side === "left") !== flip;
    const crossLeft = align === "start" ? bounds.left : align === "end" ? bounds.right - size.width : (bounds.left + bounds.right - size.width) / 2;
    const crossTop = align === "start" ? bounds.top : align === "end" ? bounds.bottom - size.height : (bounds.top + bounds.bottom - size.height) / 2;
    const desiredLeft = vertical ? crossLeft : before ? bounds.left - size.width - gap : bounds.right + gap;
    const desiredTop = vertical ? before ? bounds.top - size.height - gap : bounds.bottom + gap : crossTop;
    left = Math.max(leftEdge, Math.min(desiredLeft, rightEdge - size.width)) / scale;
    top = Math.max(topEdge, Math.min(desiredTop, bottomEdge - size.height)) / scale;
  }

  $effect(() => {
    if (!open || !panel || !anchor) return;
    place();
    const observer = new ResizeObserver(place);
    observer.observe(panel);
    observer.observe(anchor);
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", place);
    viewport?.addEventListener("scroll", place);
    return () => { observer.disconnect(); viewport?.removeEventListener("resize", place); viewport?.removeEventListener("scroll", place); };
  });

  $effect(() => {
    if (open && panel && initialFocus) {
      const field = panel.querySelector<HTMLElement>(initialFocus);
      field?.focus({ preventScroll: true });
      if (field instanceof HTMLInputElement) field.select();
    } else if (open && anchorElement && panel) {
      (panel.querySelector<HTMLInputElement>('input:not([readonly]):not(:disabled), textarea:not(:disabled)') ?? panel).focus({ preventScroll: true });
    }
  });

  function outside(event: PointerEvent) {
    if (open && event.target instanceof Node && !popupContains(panel, event.target) && (anchorPoint !== undefined || !anchor?.contains(event.target))) close();
  }

  function keyDown(event: KeyboardEvent) {
    if (!open || event.defaultPrevented) return;
    if (event.key === "Escape") {
      if (!panel || panel.closest("[inert]")) return;
      if (hasEscapePriorityOwner(panel.ownerDocument)) return;
      if (document.querySelector(`[data-ui-popup-owner="${popupId}"]`)) return;
      const target = event.target instanceof Element ? event.target : panel.ownerDocument.activeElement;
      if (target && !popupContains(panel, target) && !anchor?.contains(target)) {
        if (target.closest("[data-application-menu]")) return;
        const popups = [...panel.ownerDocument.querySelectorAll<HTMLElement>("[data-ui-popup]")].filter(candidate => !candidate.closest("[inert]") && candidate.getClientRects().length > 0);
        if (popups.at(-1) !== panel) return;
      }
      event.preventDefault();
      event.stopPropagation();
      close(true);
    } else if (panel && event.target instanceof HTMLElement && event.target.matches(actionSelector) && event.target.closest("[data-application-menu]") === panel) {
      focusMenuItem(event, panel, actionSelector);
    }
  }
</script>

<svelte:window onpointerdowncapture={outside} onkeydowncapture={keyDown} onresize={place} onscrollcapture={place} onblur={() => close()} />
{@render trigger?.({ onclick: toggle, "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": open ? popupId : undefined })}
{#if open}
  <div
    use:portal
    bind:this={panel}
    id={popupId}
    role="dialog"
    aria-label={label ?? anchor?.getAttribute("aria-label") ?? undefined}
    tabindex="-1"
    data-application-menu
    data-ui-popup
    data-ui-tooltip-detail={tooltipDetail}
    data-ui-shortcut={shortcut}
    class={`ui-mini-popup shell-menu ${className}`}
    style:position="fixed"
    style:width={`${width}px`}
    style:left={`${left}px`}
    style:top={`${top}px`}>
    {@render children()}
  </div>
{/if}

<style>
  :global(.ui-mini-popup.shell-menu), :global([data-appearance] .ui-mini-popup.shell-menu) { z-index: 120; display: grid; box-sizing: border-box; max-width: var(--mini-popup-max-width, calc(100vw - 24px)); max-height: calc(100dvh - 24px); gap: var(--popup-gap, 6px); padding: var(--popup-inset, 8px); overflow: auto; --ui-field-surface: var(--karatala-color-popup-field, color-mix(in srgb, var(--ui-menu-surface), var(--ui-menu-text) 24%)); --karatala-color-field: var(--ui-field-surface); color: var(--ui-menu-text); background: var(--ui-menu-surface); border: none; border-radius: 6px; box-shadow: 0 8px 28px rgb(0 0 0 / 45%); font: 12px/1.45 Tahoma, "Segoe UI", sans-serif; }
  :global(.ui-mini-popup.shell-menu > :is(h2, h3)) { margin: 0; font-size: 12px; font-weight: 600; line-height: 16px; }
  :global(.ui-mini-popup.shell-menu .ui-field-row) { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, auto); align-items: center; gap: 6px 12px; min-width: 0; }
  :global(.ui-mini-popup.shell-menu .ui-field-row > span) { min-width: 0; white-space: normal; }
  :global(.ui-mini-popup.shell-menu .ui-control-row) { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; min-width: 0; }
  :global(.ui-mini-popup.shell-menu .ui-control-row > .ui-zoom-select) { flex: 1 1 68px; }
  :global(.ui-mini-popup.shell-menu .ui-control-grid) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: center; gap: 6px; min-width: 0; }
  :global(.ui-mini-popup.shell-menu .ui-control-grid > *) { min-width: 0; width: 100%; }
  :global(.ui-mini-popup.shell-menu .ui-field) { display: grid; align-items: center; gap: 6px; min-width: 0; }
  :global(.ui-mini-popup.shell-menu .ui-field-caption) { font-size: inherit; line-height: inherit; }
  :global(.ui-mini-popup.shell-menu .ui-segmented-control) { min-width: 0; max-width: 100%; }
  :global(.ui-mini-popup.shell-menu > .ui-segmented-control), :global(.ui-mini-popup.shell-menu .ui-field > .ui-segmented-control) { display: flex; width: 100%; }
  :global(.ui-mini-popup.shell-menu :is(.ui-field-row, .ui-field:not(.is-stacked)) .ui-segmented-control) { flex-wrap: wrap; justify-content: flex-end; }
  :global(.ui-mini-popup.shell-menu .ui-segmented-control .ui-button.is-text) { min-width: 0; min-height: var(--ui-tab-button-height, 26px); height: auto; padding: 2px 6px; white-space: normal; overflow-wrap: anywhere; line-height: 1.25; }
  :global(.ui-mini-popup.shell-menu .ui-wide-segments .ui-segmented-control .ui-button.is-text) { min-width: var(--ui-tab-button-height, 26px); white-space: nowrap; }
  :global(.ui-mini-popup.shell-menu :is(.ui-field-row, .ui-field:not(.is-stacked)) .ui-segmented-control.is-compact .ui-button) { min-width: 24px; min-height: 24px; height: auto; padding: 2px 5px; font-size: 11px; }
  :global(.ui-mini-popup.shell-menu .ui-control-row .ui-segmented-control .ui-button.is-icon) { box-sizing: border-box; flex: 0 0 var(--ui-tab-button-height, 26px); width: var(--ui-tab-button-height, 26px); min-width: var(--ui-tab-button-height, 26px); height: var(--ui-tab-button-height, 26px); padding: 3px; }
  :global(.ui-mini-popup.shell-menu .ui-control-row .ui-segmented-control .ui-button.is-icon svg), :global(.ui-mini-popup.shell-menu .ui-control-row .ui-segmented-control .ui-button.is-icon .ui-raster-icon) { max-width: 16px; max-height: 16px; }
</style>
