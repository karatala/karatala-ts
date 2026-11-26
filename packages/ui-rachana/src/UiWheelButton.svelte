<script lang="ts">
  import { flushSync, onDestroy, onMount } from "svelte";
  import UiButton from "./UiButton.svelte";
  import { portal as mountPortal } from "./portal";
  import UiIcon from "./UiIcon.svelte";
  import { chooseComboMenuLayout, measureComboMenuItems } from "./combo-menu-layout";
  import { hasEscapePriorityOwner, isMenuArrowKey, menuNavigationIndex } from "./menu-keyboard";
  import { uiIcons } from "./icons";
  import type { WheelCommandActions } from "./wheel-command-actions";

  type ComboButtonOption = { label: string; path?: string; iconUrl?: string; value: string };
  let {
    label,
    value,
    options,
    direction = "vertical",
    wheel = false,
    centerText,
    caption,
    loop = false,
    stepMultiplier = 1,
    dragMultiplier = 1,
    toolbar = false,
    disabled = false,
    actions,
    class: className = "",
    onchange,
  }: {
    label: string;
    value: string;
    options: readonly ComboButtonOption[];
    direction?: "horizontal" | "vertical";
    wheel?: boolean;
    centerText?: string;
    caption?: string;
    loop?: boolean;
    stepMultiplier?: number;
    dragMultiplier?: number;
    toolbar?: boolean;
    disabled?: boolean;
    actions?: WheelCommandActions;
    class?: string;
    onchange: (value: string) => void;
  } = $props();
  let container = $state<HTMLDivElement>()!;
  let panel = $state<HTMLDivElement>()!;
  let menu = $state<HTMLDivElement>()!;
  let rail = $state<HTMLDivElement>();
  type RailAction = "close" | "favorite" | "help";
  let activeAction = $state<RailAction | null>(null);
  let open = $state(false);
  let gridMenu = $state(false);
  let menuColumns = 1;
  let selected = $state<string | null>(null);
  let session: { pointerId: number; target: HTMLElement; startX: number; startY: number; moved: boolean; threshold: number; wasOpen: boolean; fromMenu: boolean; fromAction: boolean; paused: boolean; startIndex: number } | null = null;
  let menuLeft = $state(0);
  let menuTop = $state(0);
  let tooltipDetail = $state<string | undefined>();
  let shortcut = $state<string | undefined>();
  let rowHeight = 36;
  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  let keyboardOpen = false;
  const currentIndex = $derived(options.findIndex((option) => option.value === value));
  const currentOption = $derived(options.find((option) => option.value === value));
  const previousOption = $derived(neighbor(-1));
  const nextOption = $derived(neighbor(1));

  function neighbor(offset: number) {
    if (currentIndex < 0 || !options.length) return undefined;
    const idx = currentIndex + offset * stepMultiplier;
    if (!loop && stepMultiplier === 1 && (idx < 0 || idx >= options.length)) return undefined;
    return options[loop ? ((idx % options.length) + options.length) % options.length : Math.max(0, Math.min(options.length - 1, idx))];
  }

  function portal(node: HTMLDivElement) {
    return mountPortal(node, container);
  }

  function showMenu(grid = false) {
    clearTimeout(holdTimer);
    if (disabled && !actions || open && gridMenu === grid) return;
    actions?.closeHelp();
    tooltipDetail = container.closest("[data-ui-tooltip-detail]")?.getAttribute("data-ui-tooltip-detail") ?? undefined;
    shortcut = container.closest("[data-ui-shortcut]")?.getAttribute("data-ui-shortcut") ?? undefined;
    flushSync(() => { gridMenu = grid; open = true; selected = value; });
    const viewport = window.visualViewport;
    const scale = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const leftEdge = (viewport?.offsetLeft ?? 0) + 8;
    const topEdge = (viewport?.offsetTop ?? 0) + 8;
    const viewportWidth = viewport?.width ?? window.innerWidth;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const triggerBounds = container.getBoundingClientRect();
    const availableWidth = Math.max(0, viewportWidth - 16) / scale;
    const availableHeight = Math.max(0, viewportHeight - 16) / scale;
    rowHeight = Math.min(Number.parseFloat(getComputedStyle(menu).getPropertyValue("--combo-item-size")) || 36, availableHeight);
    const actionSize = Math.max(1, Math.min(rowHeight, (availableHeight - 8) / 3));
    panel.style.setProperty("--wheel-action-size", `${actionSize}px`);
    panel.style.maxHeight = `${availableHeight}px`;
    const railWidth = actions ? actionSize + 4 : 0;
    const valueWidth = Math.max(1, availableWidth - railWidth);
    if (gridMenu) {
      const rightEdge = leftEdge + viewportWidth - 16;
      const bottomEdge = topEdge + viewportHeight - 16;
      const itemSize = rowHeight;
      const cell = measureComboMenuItems(menu, itemSize, valueWidth);
      const layout = chooseComboMenuLayout(triggerBounds, { left: leftEdge, top: topEdge, right: rightEdge, bottom: bottomEdge }, options.length, cell.width * scale, 4 * scale, 6 * scale, cell.height * scale);
      menuColumns = layout.columns;
      menu.style.setProperty("--combo-item-size", `${itemSize}px`);
      menu.style.setProperty("--combo-columns", String(menuColumns));
      menu.style.width = `${Math.min(valueWidth, menuColumns * cell.width + (menuColumns - 1) * 4 + 12)}px`;
      menu.style.maxWidth = `${valueWidth}px`;
      menu.style.height = "auto";
      menu.style.maxHeight = `${layout.maxHeight / scale}px`;
      menu.scrollLeft = 0;
      const bounds = panel.getBoundingClientRect();
      const desiredLeft = layout.side === "right" ? triggerBounds.right + 4 * scale : layout.side === "left" ? triggerBounds.left - 4 * scale - bounds.width : (triggerBounds.left + triggerBounds.right - bounds.width) / 2;
      const desiredTop = layout.side === "bottom" ? triggerBounds.bottom + 4 * scale : layout.side === "top" ? triggerBounds.top - 4 * scale - bounds.height : (triggerBounds.top + triggerBounds.bottom - bounds.height) / 2;
      menuLeft = Math.max(leftEdge, Math.min(desiredLeft, rightEdge - bounds.width)) / scale;
      menuTop = Math.max(topEdge, Math.min(desiredTop, bottomEdge - bounds.height)) / scale;
      centerSelection(Math.max(0, currentIndex));
      flushSync();
      return;
    }
    const menuHeight = Math.min(Math.min(options.length, 5) * rowHeight, availableHeight);
    menu.style.setProperty("--wheel-row-height", `${rowHeight}px`);
    menu.style.setProperty("--wheel-edge-space", `${Math.max(0, (menuHeight - rowHeight) / 2)}px`);
    menu.style.maxWidth = `${valueWidth}px`;
    menu.style.height = `${menuHeight}px`;
    menu.style.maxHeight = `${availableHeight}px`;
    menu.style.width = "max-content";
    const buttons = [...menu.querySelectorAll<HTMLButtonElement>("[data-combo-value]")];
    const itemWidth = Math.max(rowHeight, ...buttons.map(button => button.scrollWidth));
    menu.style.width = `${Math.min(valueWidth, itemWidth)}px`;
    menu.scrollLeft = 0;
    centerSelection(Math.max(0, currentIndex));
    const bounds = panel.getBoundingClientRect();
    const rightEdge = leftEdge + viewportWidth - 16;
    const preferredLeft = triggerBounds.right + 6 + bounds.width <= rightEdge ? triggerBounds.right + 6 : triggerBounds.left - 6 - bounds.width;
    menuLeft = Math.max(leftEdge, Math.min(preferredLeft, rightEdge - bounds.width)) / scale;
    menuTop = Math.max(topEdge, Math.min(triggerBounds.top + triggerBounds.height / 2 - bounds.height / 2, topEdge + viewportHeight - 16 - bounds.height)) / scale;
    flushSync();
  }

  function openFromTrigger(keyboard = false) {
    keyboardOpen = keyboard;
    const bounds = container.getBoundingClientRect();
    menuLeft = bounds.left + bounds.width / 2;
    menuTop = bounds.top + bounds.height / 2;
    showMenu(true);
  }

  onDestroy(close);
  onMount(() => {
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", close);
    viewport?.addEventListener("scroll", close);
    return () => {
      viewport?.removeEventListener("resize", close);
      viewport?.removeEventListener("scroll", close);
    };
  });

  $effect(() => { if (disabled) close(); });

  function centerSelection(idx: number) {
    selected = options[idx]?.value ?? null;
    if (gridMenu) {
      const button = menu.querySelectorAll<HTMLButtonElement>("[data-combo-value]")[idx];
      if (button) menu.scrollTop = Math.max(0, button.offsetTop - menu.clientHeight / 2 + button.offsetHeight / 2);
    } else menu.scrollTop = idx * rowHeight;
  }

  function updateSelection(clientY: number) {
    if (!session) return;
    const scale = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const offset = (session.startY - clientY) * stepMultiplier * dragMultiplier / (rowHeight * scale);
    const position = Math.max(0, Math.min(options.length - 1, session.startIndex + offset));
    selected = options[Math.round(position)]?.value ?? null;
    menu.scrollTop = position * rowHeight;
  }

  function close() {
    clearTimeout(holdTimer);
    const gesture = session;
    session = null;
    open = false;
    selected = null;
    activeAction = null;
    if (gesture?.target.hasPointerCapture(gesture.pointerId)) gesture.target.releasePointerCapture(gesture.pointerId);
  }

  function containsPoint(element: HTMLElement, event: PointerEvent) {
    const bounds = element.getBoundingClientRect();
    return event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
  }

  function actionAt(event: PointerEvent): RailAction | null {
    const button = [...rail?.querySelectorAll<HTMLElement>("[data-wheel-action]") ?? []].find(button => containsPoint(button, event));
    return button?.dataset.wheelAction as RailAction ?? null;
  }

  function insideInteraction(event: PointerEvent) {
    const triggerBounds = container.getBoundingClientRect();
    const panelBounds = panel.getBoundingClientRect();
    return event.clientX >= Math.min(triggerBounds.left, panelBounds.left) && event.clientX <= Math.max(triggerBounds.right, panelBounds.right) && event.clientY >= Math.min(triggerBounds.top, panelBounds.top) && event.clientY <= Math.max(triggerBounds.bottom, panelBounds.bottom);
  }

  function updateGesture(event: PointerEvent) {
    if (!session) return;
    activeAction = actionAt(event);
    if (rail && containsPoint(rail, event) || !insideInteraction(event) || session.fromAction || disabled) { session.paused = true; return; }
    if (session.paused) {
      session.startY = event.clientY;
      session.startIndex = menu.scrollTop / rowHeight;
      session.paused = false;
    }
    updateSelection(event.clientY);
  }

  function runAction(action: RailAction, keyboard = false) {
    if (action === "favorite") actions?.toggleFavorite();
    else {
      close();
      if (action === "help") container.querySelector("button")?.dispatchEvent(new Event("ui-help-request", { bubbles: true }));
      else if (keyboard) container.querySelector<HTMLButtonElement>("button")?.focus();
    }
  }

  function pointerDown(event: PointerEvent) {
    if (disabled && !actions || event.button !== 0 || session) return;
    const target = event.currentTarget as HTMLElement;
    keyboardOpen = false;
    const fromAction = event.target instanceof Element && !!event.target.closest("[data-wheel-action]");
    if (gridMenu && target === panel && !fromAction) return;
    event.preventDefault();
    const bounds = target.getBoundingClientRect();
    if (!open) {
      menuLeft = bounds.left + bounds.width / 2;
      menuTop = bounds.top + bounds.height / 2;
    }
    session = { pointerId: event.pointerId, target, startX: event.clientX, startY: event.clientY, moved: false, threshold: event.pointerType === "touch" ? 10 : 4, wasOpen: open, fromMenu: target === panel, fromAction, paused: fromAction, startIndex: Math.max(0, options.findIndex(option => option.value === (selected ?? value))) };
    activeAction = actionAt(event);
    if (!open) {
      holdTimer = setTimeout(() => showMenu(), 250);
    }
    if (target !== panel || fromAction) target.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: PointerEvent) {
    if (!session || session.pointerId !== event.pointerId) return;
    if (!session.moved && Math.hypot(event.clientX - session.startX, event.clientY - session.startY) <= session.threshold) return;
    session.moved = true;
    if (!session.target.hasPointerCapture(event.pointerId)) session.target.setPointerCapture(event.pointerId);
    if (!open || gridMenu && !session.fromAction) showMenu();
    updateGesture(event);
  }

  function pointerUp(event: PointerEvent) {
    if (!session || session.pointerId !== event.pointerId) return;
    const gesture = session;
    const target = gesture.target;
    const action = actionAt(event);
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && (container.contains(focused) || panel?.contains(focused))) focused.blur();
    if (open && !action && !insideInteraction(event)) { event.preventDefault(); close(); return; }
    let nextValue: string | null = null;
    if (!action && !gesture.fromAction && !disabled && open && session.moved && insideInteraction(event)) {
      updateGesture(event);
      nextValue = selected;
    } else if (!disabled && wheel && !open) {
      const bounds = target.getBoundingClientRect();
      const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      const position = direction === "vertical" ? (event.clientY - bounds.top) / bounds.height : (event.clientX - bounds.left) / bounds.width;
      if (inside) nextValue = (position < 0.3 ? previousOption : position > 0.7 ? nextOption : undefined)?.value ?? null;
    }
    const wasOpen = session.wasOpen;
    const moved = session.moved;
    const fromMenu = session.fromMenu;
    clearTimeout(holdTimer);
    session = null;
    activeAction = null;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    if (action) { event.preventDefault(); runAction(action); return; }
    if (gesture.fromAction || rail && containsPoint(rail, event)) return;
    if (fromMenu && !moved) return;
    if (nextValue !== null || moved || wasOpen) close();
    else if (!open) openFromTrigger();
    if (nextValue !== null) onchange(nextValue);
  }

  function pointerCancel(event: PointerEvent) {
    if (!session || session.pointerId !== event.pointerId) return;
    const target = event.currentTarget as HTMLElement;
    close();
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
  }

  function outsidePointerDown(event: PointerEvent) {
    if (!(event.target instanceof Node)) return;
    if (!container.contains(event.target) && !panel?.contains(event.target)) close();
  }

  function outsideScroll(event: Event) {
    if (open && event.target instanceof Node && !panel.contains(event.target)) close();
  }

  function contextMenu(event: MouseEvent) {
    if (event.target instanceof Node && (container.contains(event.target) || panel?.contains(event.target))) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    close();
  }

  function keyDown(event: KeyboardEvent) {
    if ((event.key === "ContextMenu" || event.shiftKey && event.key === "F10") && event.target instanceof Node && (container.contains(event.target) || panel?.contains(event.target))) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.key === "Escape" && session && !open && !event.defaultPrevented) {
      if (hasEscapePriorityOwner(container.ownerDocument)) return;
      event.preventDefault(); event.stopPropagation(); close(); return;
    }
    if (!open || event.defaultPrevented) return;
    if (event.key === "Escape") {
      if (hasEscapePriorityOwner(container.ownerDocument)) return;
      event.preventDefault();
      event.stopPropagation();
      close();
      if (keyboardOpen) container.querySelector<HTMLButtonElement>("button")?.focus();
    } else if (event.target instanceof Node && menu.contains(event.target)) {
      const buttons = [...menu.querySelectorAll<HTMLButtonElement>("[data-combo-value]:not(:disabled)")];
      const current = buttons.findIndex(button => button === document.activeElement);
      const idx = menuNavigationIndex(event, buttons.length, current, gridMenu ? menuColumns : 1, gridMenu ? 1 : stepMultiplier);
      if (idx === undefined) return;
      event.preventDefault();
      event.stopPropagation();
      centerSelection(idx);
      buttons[idx]?.focus({ preventScroll: true });
    }
  }
</script>

{#snippet wheelEntry(option: ComboButtonOption | undefined, text?: string)}
  <span class="ui-wheel-entry">
    {#if text !== undefined}
      <span>{text}</span>
    {:else if option?.iconUrl || option?.path}
      <UiIcon path={option.path} src={option.iconUrl} size={option.iconUrl ? 26 : 18}></UiIcon>
    {:else}
      <span>{option?.label ?? ""}</span>
    {/if}
  </span>
{/snippet}

<svelte:window onpointerdowncapture={outsidePointerDown} oncontextmenucapture={contextMenu} onkeydowncapture={keyDown} onresize={close} onblur={close} onscrollcapture={outsideScroll} />

<div bind:this={container} data-hold-action class={`ui-combo-button ui-wheel-button is-${direction} ${className}`} class:is-open={open} class:is-wheel={wheel} class:has-caption={caption !== undefined} class:has-actions={!!actions}
  role="group" aria-label={label}
  onpointerdown={pointerDown} onpointermove={pointerMove} onpointerup={pointerUp} onpointercancel={pointerCancel} onlostpointercapture={pointerCancel}>
  {#if open}
    <div
      bind:this={panel}
      use:portal
      class="ui-wheel-popup"
      style:left={`${menuLeft}px`}
      style:top={`${menuTop}px`}
      onpointerdown={pointerDown}
      onpointermove={pointerMove}
      onpointerup={pointerUp}
      onpointercancel={pointerCancel}
      onlostpointercapture={pointerCancel}
      data-hold-action
      data-application-menu
      role="group"
      aria-label={label}>
      <div
        bind:this={menu}
        class={`ui-combo-options ${gridMenu ? "ui-wheel-grid" : `ui-wheel-options is-${direction}`}`}
        data-ui-tooltip-detail={tooltipDetail}
        data-ui-shortcut={shortcut}
        role="listbox"
        tabindex="-1"
        aria-orientation={direction}
        aria-label={label}>
        <div class={`ui-combo-items is-${direction}`}>
          {#each options as option (option.value)}
            <button
              type="button"
              class="ui-combo-option"
              class:is-selected={selected === option.value}
              class:is-current={value === option.value}
              data-combo-value={option.value}
              data-ui-tooltip={option.label}
              {disabled}
              role="option"
              aria-selected={value === option.value}
              tabindex={value === option.value || (currentIndex < 0 && option === options[0]) ? 0 : -1}
              onclick={(event) => { if (disabled) return; close(); onchange(option.value); if (event.detail > 0) (event.currentTarget as HTMLButtonElement).blur(); else container.querySelector<HTMLButtonElement>("button")?.focus(); }}>
              <span class="ui-combo-option-content">
                {#if option.iconUrl || option.path}
                  <span class="ui-combo-option-icon" aria-hidden="true">
                    <UiIcon path={option.path} src={option.iconUrl} size={option.iconUrl ? 26 : 18}></UiIcon>
                  </span>
                {/if}
                <span>{option.label}</span>
              </span>
            </button>
          {/each}
        </div>
      </div>
      {#if actions}
        <div bind:this={rail} class="ui-wheel-actions" role="toolbar" aria-label={label}>
          <UiButton data-wheel-action="close" variant="icon" path={uiIcons.close} label={actions.closeLabel} class={activeAction === "close" ? "is-armed" : ""} onclick={event => { if (event.detail === 0) runAction("close", true); }} />
          <UiButton data-wheel-action="favorite" variant="icon" path={uiIcons.star} label={actions.favoriteLabel} active={actions.favorite} class={activeAction === "favorite" ? "is-armed" : ""} onclick={event => { if (event.detail === 0) runAction("favorite", true); }} />
          <UiButton data-wheel-action="help" variant="icon" text="?" label={actions.helpLabel} class={activeAction === "help" ? "is-armed" : ""} onclick={event => { if (event.detail === 0) runAction("help", true); }} />
        </div>
      {/if}
    </div>
  {/if}
  <UiButton
    class="ui-combo-trigger"
    {toolbar}
    variant={!wheel && !caption && (currentOption?.iconUrl || currentOption?.path) ? "icon" : "text"}
    {label}
    path={wheel || caption ? undefined : currentOption?.path}
    iconUrl={wheel || caption ? undefined : currentOption?.iconUrl}
    text={wheel || caption || currentOption?.iconUrl || currentOption?.path ? undefined : centerText ?? currentOption?.label ?? value}
    {disabled}
    aria-haspopup="listbox"
    aria-expanded={open}
    onkeydown={event => {
      if (!isMenuArrowKey(event)) return;
      event.preventDefault();
      openFromTrigger(true);
      menu.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus({ preventScroll: true });
    }}
    onclick={(event) => {
      if (event.detail !== 0) return;
      if (open) close();
      else {
        openFromTrigger(true);
        menu.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus();
      }
    }}
    oncontextmenu={(event) => event.preventDefault()}>
    {#if caption !== undefined}
      <span class="ui-combo-caption">{caption}</span>
      <span class="ui-combo-value">{currentOption?.label ?? centerText ?? value}</span>
      <span aria-hidden="true">▾</span>
    {:else if wheel}
      <span class="ui-wheel-strip" aria-hidden="true">
        {@render wheelEntry(previousOption)}
        {@render wheelEntry(currentOption, centerText)}
        {@render wheelEntry(nextOption)}
      </span>
    {/if}
  </UiButton>
</div>

<style>
  .ui-wheel-popup { position: fixed; z-index: 150; display: flex; gap: 4px; max-width: calc(100vw - 16px); color: var(--ui-text); background: var(--ui-menu-surface); border-radius: 5px; box-shadow: 0 6px 20px rgb(0 0 0 / 45%); touch-action: none; }
  :global([data-appearance]) .ui-wheel-popup .ui-combo-options { position: static; flex: 0 1 auto; min-width: 0; box-shadow: none; }
  .ui-wheel-actions { display: flex; flex: 0 0 auto; flex-direction: column; align-self: flex-start; gap: 4px; }
  .ui-wheel-actions :global(button.ui-button) { width: var(--wheel-action-size); min-width: var(--wheel-action-size); height: var(--wheel-action-size); min-height: var(--wheel-action-size); }
  .ui-wheel-actions :global(button.ui-button.is-armed) { color: var(--ui-accent); background: var(--ui-segment-hover); }
  .ui-wheel-button.has-actions :global(button:disabled) { pointer-events: none; }
  .ui-wheel-button.is-wheel.is-vertical :global(.ui-combo-trigger:not(:disabled)) { cursor: ns-resize; }
  :global([data-appearance]) .ui-wheel-button.is-inline :global(.ui-combo-trigger.ui-button) { width: auto; min-width: 0; height: var(--ui-tab-button-height, 26px); min-height: var(--ui-tab-button-height, 26px); padding: 3px 6px; background: transparent; border-radius: 0; }
  :global([data-appearance]) .ui-wheel-button.is-inline :global(.ui-wheel-strip) { position: static; width: auto; height: 20px; transform: none; mask-image: none; }
  .ui-wheel-button.is-inline :global(.ui-wheel-entry:first-child), .ui-wheel-button.is-inline :global(.ui-wheel-entry:last-child) { display: none; }
  .ui-wheel-button.is-inline :global(.ui-wheel-entry) { font-size: 12px; font-weight: 400; }
  :global([data-appearance]) .ui-wheel-button.is-inline.is-square :global(.ui-combo-trigger.ui-button) { box-sizing: border-box; width: var(--ui-tab-button-height, 26px); min-width: var(--ui-tab-button-height, 26px); padding: 3px; }
  .ui-wheel-button.is-inline :global(.ui-combo-trigger svg), .ui-wheel-button.is-inline :global(.ui-combo-trigger .ui-raster-icon) { width: 16px; height: 16px; }
</style>
