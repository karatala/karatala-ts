<script lang="ts">
  import { flushSync, onDestroy, onMount } from "svelte";
  import UiButton from "./UiButton.svelte";
  import { portal as mountPortal } from "./portal";
  import UiIcon from "./UiIcon.svelte";
  import { chooseComboMenuLayout, measureComboMenuItems } from "./combo-menu-layout";
  import { focusMenuItem, hasEscapePriorityOwner, isMenuArrowKey } from "./menu-keyboard";

  type ComboButtonOption = { label: string; path?: string; iconUrl?: string; value: string; disabled?: boolean };
  let {
    label,
    value,
    options,
    direction = "vertical",
    wheel = false,
    centerText,
    caption,
    compactCaption = false,
    menuStyle = "grid",
    iconUrl,
    path,
    loop = false,
    toolbar = false,
    triggerRole,
    disabled = false,
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
    compactCaption?: boolean;
    menuStyle?: "grid" | "list";
    iconUrl?: string;
    path?: string;
    loop?: boolean;
    toolbar?: boolean;
    triggerRole?: "combobox";
    disabled?: boolean;
    class?: string;
    onchange: (value: string) => void;
  } = $props();
  const componentId = $props.id();
  const menuId = `${componentId}-options`;
  let container: HTMLDivElement;
  let menu = $state<HTMLDivElement>()!;
  let open = $state(false);
  let selected = $state<string | null>(null);
  let session: { pointerId: number; target: HTMLElement; startX: number; startY: number; moved: boolean; threshold: number; wasOpen: boolean } | null = null;
  let menuLeft = $state(0);
  let menuTop = $state(0);
  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  const currentOption = $derived(options.find((option) => option.value === value));
  let menuColumns = 1;
  let tooltipDetail = $state<string | undefined>();
  let shortcut = $state<string | undefined>();

  function portal(node: HTMLDivElement) {
    return mountPortal(node, container);
  }

  function showMenu() {
    clearTimeout(holdTimer);
    if (disabled || open) return;
    tooltipDetail = container.closest("[data-ui-tooltip-detail]")?.getAttribute("data-ui-tooltip-detail") ?? undefined;
    shortcut = container.closest("[data-ui-shortcut]")?.getAttribute("data-ui-shortcut") ?? undefined;
    flushSync(() => { open = true; selected = value; });
    const viewport = window.visualViewport;
    const scale = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const leftEdge = (viewport?.offsetLeft ?? 0) + 8;
    const topEdge = (viewport?.offsetTop ?? 0) + 8;
    const viewportWidth = viewport?.width ?? window.innerWidth;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const triggerBounds = container.getBoundingClientRect();
    const rightEdge = leftEdge + viewportWidth - 16;
    const bottomEdge = topEdge + viewportHeight - 16;
    if (menuStyle === "list") menu.style.font = getComputedStyle(container).font;
    const requestedSize = menuStyle === "list" ? Number.parseFloat(getComputedStyle(container).getPropertyValue("--ui-tab-button-height")) || 26 : Number.parseFloat(getComputedStyle(menu).getPropertyValue("--combo-item-size")) || 36;
    const itemSize = Math.min(requestedSize, Math.max(1, (viewportWidth - 28) / scale));
    const gap = 4 * scale;
    const padding = (menuStyle === "list" ? 3 : 6) * scale;
    const cell = measureComboMenuItems(menu, itemSize, Math.max(0, viewportWidth - 16) / scale);
    const layout = chooseComboMenuLayout(triggerBounds, { left: leftEdge, top: topEdge, right: rightEdge, bottom: bottomEdge }, options.length, cell.width * scale, gap, padding, cell.height * scale);
    menuColumns = menuStyle === "list" ? 1 : layout.columns;
    const menuWidth = triggerRole === "combobox" ? triggerBounds.width / scale : menuStyle === "list" ? Math.min(280, Math.max(180, triggerBounds.width / scale, ...options.map(option => Math.min(36, option.label.length) * 6 + 54))) : menuColumns * cell.width + (menuColumns - 1) * 4 + 12;
    menu.style.setProperty("--combo-item-size", `${itemSize}px`);
    menu.style.setProperty("--combo-columns", String(menuColumns));
    menu.style.width = `${menuWidth}px`;
    menu.style.maxWidth = `${Math.max(0, viewportWidth - 16) / scale}px`;
    const below = bottomEdge - triggerBounds.bottom - gap;
    const above = triggerBounds.top - topEdge - gap;
    const listBelow = below >= Math.min(options.length * itemSize * scale + padding * 2, 240 * scale) || below >= above;
    menu.style.maxHeight = `${Math.max(0, menuStyle === "list" ? Math.max(itemSize * scale + padding * 2, listBelow ? below : above) : layout.maxHeight) / scale}px`;
    menu.scrollLeft = 0;
    const bounds = menu.getBoundingClientRect();
    const centerX = (triggerBounds.left + triggerBounds.right - bounds.width) / 2;
    const centerY = (triggerBounds.top + triggerBounds.bottom - bounds.height) / 2;
    const desiredLeft = menuStyle === "list" ? triggerBounds.left : layout.side === "right" ? triggerBounds.right + gap : layout.side === "left" ? triggerBounds.left - gap - bounds.width : centerX;
    const desiredTop = menuStyle === "list" ? listBelow ? triggerBounds.bottom + gap : triggerBounds.top - gap - bounds.height : layout.side === "bottom" ? triggerBounds.bottom + gap : layout.side === "top" ? triggerBounds.top - gap - bounds.height : centerY;
    menuLeft = Math.max(leftEdge, Math.min(desiredLeft, rightEdge - bounds.width)) / scale;
    menuTop = Math.max(topEdge, Math.min(desiredTop, bottomEdge - bounds.height)) / scale;
    const activeOption = menu.querySelector<HTMLElement>('[aria-selected="true"]');
    if (activeOption) menu.scrollTop = Math.max(0, activeOption.offsetTop - menu.clientHeight / 2 + activeOption.offsetHeight / 2);
    flushSync();
  }

  function openFromTrigger() {
    const bounds = container.getBoundingClientRect();
    menuLeft = bounds.left + bounds.width / 2;
    menuTop = bounds.top + bounds.height / 2;
    showMenu();
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

  function updateSelection(clientX: number, clientY: number) {
    selected = null;
    const menuBounds = menu.getBoundingClientRect();
    if (clientX < menuBounds.left || clientX > menuBounds.right || clientY < menuBounds.top || clientY > menuBounds.bottom) return;
    for (const option of menu.querySelectorAll<HTMLElement>("[data-combo-value]:not(:disabled)")) {
      const bounds = option.getBoundingClientRect();
      if (clientX >= bounds.left && clientX <= bounds.right && clientY >= bounds.top && clientY <= bounds.bottom) selected = option.dataset.comboValue ?? null;
    }
  }

  function close() {
    clearTimeout(holdTimer);
    const gesture = session;
    session = null;
    open = false;
    selected = null;
    if (gesture?.target.hasPointerCapture(gesture.pointerId)) gesture.target.releasePointerCapture(gesture.pointerId);
  }

  function pointerDown(event: PointerEvent) {
    if (disabled || event.button !== 0 || session) return;
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    const bounds = target.getBoundingClientRect();
    if (!open) {
      menuLeft = bounds.left + bounds.width / 2;
      menuTop = bounds.top + bounds.height / 2;
    }
    session = { pointerId: event.pointerId, target, startX: event.clientX, startY: event.clientY, moved: false, threshold: event.pointerType === "touch" ? 10 : 4, wasOpen: open };
    if (!open) {
      holdTimer = setTimeout(showMenu, 250);
    }
    target.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: PointerEvent) {
    if (!session || session.pointerId !== event.pointerId) return;
    if (!session.moved && Math.hypot(event.clientX - session.startX, event.clientY - session.startY) <= session.threshold) return;
    session.moved = true;
    if (!open) showMenu();
    updateSelection(event.clientX, event.clientY);
  }

  function pointerUp(event: PointerEvent) {
    if (!session || session.pointerId !== event.pointerId) return;
    const target = event.currentTarget as HTMLElement;
    let nextValue: string | null = null;
    if (open && session.moved) {
      updateSelection(event.clientX, event.clientY);
      nextValue = selected;
    }
    const wasOpen = session.wasOpen;
    const moved = session.moved;
    clearTimeout(holdTimer);
    session = null;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    if (nextValue !== null || moved || wasOpen) close();
    else if (!open) openFromTrigger();
    if (nextValue !== null) onchange(nextValue);
  }

  function pointerCancel(event: PointerEvent) {
    if (!session || session.pointerId !== event.pointerId) return;
    close();
  }

  function outsidePointerDown(event: PointerEvent) {
    if (!(event.target instanceof Node)) return;
    if (!container.contains(event.target) && !menu?.contains(event.target)) close();
  }

  function outsideScroll(event: Event) {
    if (open && event.target instanceof Node && !menu.contains(event.target)) close();
  }

  function keyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && session && !open && !event.defaultPrevented) {
      if (hasEscapePriorityOwner(container.ownerDocument)) return;
      event.preventDefault(); event.stopPropagation(); close(); return;
    }
    if (!open || event.defaultPrevented) return;
    if (event.key === "Tab") {
      container.querySelector<HTMLButtonElement>("button")?.focus();
      close();
    } else if (event.key === "Escape") {
      if (hasEscapePriorityOwner(container.ownerDocument)) return;
      event.preventDefault();
      event.stopPropagation();
      close();
      container.querySelector<HTMLButtonElement>("button")?.focus();
    } else if (event.target instanceof Node && menu.contains(event.target)) focusMenuItem(event, menu, "[data-combo-value]:not(:disabled)", menuColumns, loop);
  }
</script>

<svelte:window onpointerdowncapture={outsidePointerDown} onkeydowncapture={keyDown} onresize={close} onblur={close} onscrollcapture={outsideScroll} />

<div
  bind:this={container}
  data-hold-action
  class={`ui-combo-button is-${direction} ${className}`}
  class:is-list={menuStyle === "list"}
  class:is-open={open}
  class:is-wheel={wheel}
  class:has-caption={caption !== undefined}
  class:has-compact-caption={compactCaption}>
  {#if open}
    <div
      bind:this={menu}
      id={menuId}
      use:portal
      class={`ui-combo-options is-${direction}`}
      class:is-list={menuStyle === "list"}
      class:is-toolbar={toolbar}
      data-ui-tooltip-detail={tooltipDetail}
      data-ui-shortcut={shortcut}
      style:left={`${menuLeft}px`}
      style:top={`${menuTop}px`}
      data-application-menu
      role="listbox"
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
            role="option"
            aria-selected={value === option.value}
            disabled={option.disabled}
            data-ui-tooltip={option.label}
            tabindex={!option.disabled && (value === option.value || (!currentOption || currentOption.disabled) && option === options.find(entry => !entry.disabled)) ? 0 : -1}
            onclick={(event) => { close(); onchange(option.value); if (event.detail > 0) (event.currentTarget as HTMLButtonElement).blur(); else container.querySelector<HTMLButtonElement>("button")?.focus(); }}>
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
  {/if}
  {#if caption !== undefined && compactCaption}
    <span class="ui-combo-caption">{caption}</span>
  {/if}
  <UiButton
    class="ui-combo-trigger"
    role={triggerRole}
    {toolbar}
    variant={!wheel && !caption && (currentOption?.iconUrl || currentOption?.path) ? "icon" : "text"}
    {label}
    path={wheel || caption ? undefined : path ?? currentOption?.path}
    iconUrl={caption && !compactCaption ? undefined : iconUrl ?? (wheel ? undefined : currentOption?.iconUrl)}
    text={wheel || caption || currentOption?.iconUrl || currentOption?.path ? undefined : centerText ?? currentOption?.label ?? value}
    {disabled}
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-controls={open ? menuId : undefined}
    onpointerdown={pointerDown}
    onpointermove={pointerMove}
    onpointerup={pointerUp}
    onpointercancel={pointerCancel}
    onlostpointercapture={pointerCancel}
    onkeydown={event => {
      if (!isMenuArrowKey(event)) return;
      event.preventDefault();
      openFromTrigger();
      const buttons = [...menu.querySelectorAll<HTMLButtonElement>("[data-combo-value]:not(:disabled)")];
      (buttons.find(button => button.dataset.comboValue === value) ?? (event.key === "ArrowUp" ? buttons.at(-1) : buttons[0]))?.focus();
    }}
    onclick={(event) => {
      if (event.detail !== 0) return;
      if (open) close();
      else {
        openFromTrigger();
        menu.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus();
      }
    }}
    oncontextmenu={(event) => event.preventDefault()}>
    {#if caption !== undefined}
      {#if !compactCaption}
        <span class="ui-combo-caption">
          {#if iconUrl}
            <UiIcon src={iconUrl} size={26} />
          {/if}
          {caption}
        </span>
      {/if}
      {#if !(currentOption?.iconUrl && compactCaption)}
        <span class="ui-combo-value">{centerText ?? currentOption?.label ?? value}</span>
      {/if}
      <span aria-hidden="true">▾</span>
    {:else if !wheel}
      <span class="ui-combo-chevron" aria-hidden="true">▾</span>
    {:else if wheel}
      {#if (currentOption?.iconUrl || currentOption?.path) && centerText === undefined}
        <UiIcon path={currentOption.path} src={currentOption.iconUrl} size={currentOption.iconUrl ? 26 : 18}></UiIcon>
      {:else}
        <span>{centerText ?? currentOption?.label ?? value}</span>
      {/if}
    {/if}
  </UiButton>
</div>

<style>
  .ui-combo-button.is-square :global(.ui-combo-trigger.ui-button) { box-sizing: border-box; width: var(--ui-tab-button-height, 26px); min-width: var(--ui-tab-button-height, 26px); height: var(--ui-tab-button-height, 26px); padding: 3px; gap: 0; }
  .ui-combo-button.is-square :global(.ui-combo-chevron) { display: none; }
  .ui-combo-button.is-square :global(.ui-combo-trigger svg), .ui-combo-button.is-square :global(.ui-combo-trigger .ui-raster-icon) { width: 16px; height: 16px; }
</style>
