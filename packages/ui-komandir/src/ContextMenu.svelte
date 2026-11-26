<script lang="ts">
  import { useKomandirUiHost } from "./host";
  const { message } = useKomandirUiHost();
  import { onMount, setContext, tick, untrack, type Snippet } from "svelte";
  import Popover from "./Popover.svelte";
  import Portal from "./Portal.svelte";
  import Button from "./Button.svelte";
  import { popupContains } from "./portal.ts";
  import "./context-menu.css";
  import { contextSubmenu, type ContextSubmenuHost, type SubmenuItem } from "./context-submenu.ts";

  interface Props {
    label: string;
    left?: number;
    top?: number;
    trigger?: HTMLElement | null;
    anchor?: HTMLElement | null;
    align?: "start" | "end";
    ignoreOutside?: (target: Element) => boolean;
    class?: string;
    initialShift?: boolean;
    initialItem?: string;
    leading?: Snippet<[boolean]>;
    actions?: Snippet<[boolean]>;
    children: Snippet<[boolean]>;
    onClose(): void;
    onFocusReturn(): void;
  }
  let { label, left = 0, top = 0, trigger, anchor, align = "start", ignoreOutside, leading, actions, children, initialShift = false, initialItem, class: className = "", onClose, onFocusReturn }: Props = $props();
  const menuId = $props.id();
  let placedLeft = $state(untrack(() => left));
  let placedTop = $state(untrack(() => top));
  let restoreFocus = true;
  let shifted = $state(untrack(() => initialShift));
  let keyboard = $state(false);
  let submenu = $state.raw<SubmenuItem>();
  let submenuElement = $state<HTMLDivElement>();
  let submenuPlacement = $state<{ left: number; top: number; overlaps: boolean }>();
  let submenuTimer: ReturnType<typeof setTimeout> | undefined;
  let typeaheadText = "";
  let typeaheadTime = 0;
  let typeaheadRoot: HTMLElement | undefined;

  function placeSubmenu(): void {
    if (!submenu || !submenuElement) return;
    const anchor = submenu.anchor.getBoundingClientRect();
    const parent = document.getElementById(menuId)?.parentElement?.getBoundingClientRect();
    if (!parent || !submenu.anchor.isConnected || anchor.bottom <= parent.top || anchor.top >= parent.bottom) { closeSubmenu(); return; }
    const bounds = submenuElement.getBoundingClientRect();
    const zoom = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const viewport = window.visualViewport;
    const minLeft = (viewport?.offsetLeft ?? 0) + 4;
    const minTop = (viewport?.offsetTop ?? 0) + 4;
    const maxRight = minLeft + (viewport?.width ?? innerWidth) - 8;
    const maxBottom = minTop + (viewport?.height ?? innerHeight) - 8;
    const fitsRight = parent.right - 1 + bounds.width <= maxRight;
    const fitsLeft = parent.left + 1 - bounds.width >= minLeft;
    const openRight = fitsRight || !fitsLeft && maxRight - parent.right >= parent.left - minLeft;
    const desired = openRight ? parent.right - 1 : parent.left + 1 - bounds.width;
    submenuPlacement = { left: Math.max(minLeft, Math.min(desired, maxRight - bounds.width)) / zoom, top: Math.max(minTop, Math.min(anchor.top - 4, maxBottom - bounds.height)) / zoom, overlaps: !fitsLeft && !fitsRight };
  }

  function closeSubmenu(returnFocus = false): void {
    clearTimeout(submenuTimer);
    const anchor = submenu?.anchor;
    submenu = undefined;
    submenuPlacement = undefined;
    if (returnFocus) anchor?.focus({ preventScroll: true });
  }

  function showSubmenu(item: SubmenuItem, focus: boolean): void {
    clearTimeout(submenuTimer);
    const open = async () => {
      if (!item.anchor.isConnected) return;
      if (submenu?.anchor !== item.anchor) {
        submenuPlacement = undefined;
        submenu = item;
      }
      await tick();
      placeSubmenu();
      if (focus) await tick();
      if (focus && submenuElement && submenu?.anchor === item.anchor) {
        (menuButtons(submenuElement).find(button => !button.matches(".ui-context-back")) ?? submenuElement).focus({ preventScroll: true });
      }
    };
    if (focus) void open();
    else if (submenu?.anchor !== item.anchor) submenuTimer = setTimeout(open, 140);
  }

  function leaveSubmenu(): void {
    clearTimeout(submenuTimer);
    if (!submenuElement?.contains(document.activeElement)) submenuTimer = setTimeout(closeSubmenu, 240);
  }

  setContext<ContextSubmenuHost>(contextSubmenu, { id: `${menuId}-submenu`, get active() { return submenu?.anchor; }, show: showSubmenu, leave: leaveSubmenu });
  $effect(() => {
    if (!submenuElement) return;
    const observer = new ResizeObserver(placeSubmenu);
    observer.observe(submenuElement);
    return () => observer.disconnect();
  });
  function place(): void {
    const bounds = document.getElementById(menuId)?.parentElement?.getBoundingClientRect();
    if (!bounds) return;
    const origin = anchor?.getBoundingClientRect();
    const zoom = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const viewport = window.visualViewport;
    const minLeft = (viewport?.offsetLeft ?? 0) + 4;
    const minTop = (viewport?.offsetTop ?? 0) + 4;
    const maxRight = minLeft + (viewport?.width ?? innerWidth) - 8;
    const maxBottom = minTop + (viewport?.height ?? innerHeight) - 8;
    const below = origin ? origin.bottom + 3 : top;
    const menuLeft = origin ? align === "end" ? origin.right - bounds.width : origin.left : left;
    const menuTop = origin && below + bounds.height > maxBottom && origin.top - 3 - bounds.height >= minTop ? origin.top - 3 - bounds.height : below;
    placedLeft = Math.max(minLeft, Math.min(menuLeft, maxRight - bounds.width)) / zoom;
    placedTop = Math.max(minTop, Math.min(menuTop, maxBottom - bounds.height)) / zoom;
  }
  function pointerIn(event: PointerEvent, surface: HTMLElement | null | undefined): boolean {
    if (!surface) return false;
    if (event.composedPath().includes(surface)) return true;
    const bounds = surface.getBoundingClientRect();
    return bounds.width > 0 && bounds.height > 0 && event.clientX >= bounds.left && event.clientX < bounds.right && event.clientY >= bounds.top && event.clientY < bounds.bottom;
  }
  function pressSurface(event: PointerEvent): void {
    if (event.target instanceof Element && event.target.closest("button, input, textarea, select, a[href]")) keyboard = false;
    else event.preventDefault();
  }
  function menuButtons(root: HTMLElement): HTMLButtonElement[] {
    return [...root.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")].filter(button => button.getClientRects().length);
  }
  function focusByPrefix(event: KeyboardEvent): boolean {
    if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.key.length !== 1 || event.key === " ") return false;
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select"))) return false;
    const root = event.currentTarget as HTMLElement;
    const now = performance.now();
    typeaheadText = (root === typeaheadRoot && now - typeaheadTime < 700 ? typeaheadText : "") + event.key.toLocaleLowerCase();
    typeaheadTime = now;
    typeaheadRoot = root;
    const prefix = [...typeaheadText].every(character => character === typeaheadText[0]) ? typeaheadText[0]! : typeaheadText;
    const buttons = menuButtons(root).filter(button => button.getAttribute("aria-disabled") !== "true" && getComputedStyle(button).visibility === "visible");
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const start = current < 0 ? 0 : current + Number(prefix.length === 1);
    const ordered = [...buttons.slice(start), ...buttons.slice(0, start)];
    const next = ordered.find(button => {
      const caption = (button.querySelector<HTMLElement>(".ui-menu-caption, .ui-context-action-label")?.innerText ?? button.innerText).trim() || button.getAttribute("aria-label") || "";
      return caption.toLocaleLowerCase().startsWith(prefix);
    });
    event.preventDefault();
    event.stopPropagation();
    keyboard = true;
    next?.focus();
    return true;
  }
  function navigate(event: KeyboardEvent): void {
    if (event.key === "Tab") { leaveMenu(); return; }
    if (focusByPrefix(event)) { closeSubmenu(); return; }
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    typeaheadText = "";
    const buttons = menuButtons(event.currentTarget as HTMLElement);
    const current = document.activeElement as HTMLButtonElement;
    const actionRow = (button: HTMLButtonElement) => button.closest(".ui-context-action-group") ?? button.closest(".ui-context-strip");
    const row = actionRow(current);
    const horizontal = event.key === "ArrowLeft" || event.key === "ArrowRight";
    if (horizontal && !row) return;
    const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
    let next: HTMLButtonElement | undefined;
    if (horizontal) {
      const siblings = buttons.filter(button => actionRow(button) === row);
      if (siblings.length) next = siblings[(siblings.indexOf(current) + direction + siblings.length) % siblings.length];
    } else if (event.key === "Home") next = buttons[0];
    else if (event.key === "End") next = buttons.at(-1);
    else {
      const idx = buttons.indexOf(current);
      const ordered = direction > 0 ? buttons.slice(idx + 1) : buttons.slice(0, idx < 0 ? buttons.length : idx).reverse();
      const eligible = (button: HTMLButtonElement) => !row || actionRow(button) !== row;
      next = ordered.find(eligible) ?? (direction > 0 ? buttons : buttons.slice().reverse()).find(eligible);
    }
    event.preventDefault();
    event.stopPropagation();
    keyboard = true;
    closeSubmenu();
    next?.focus();
  }
  function leaveMenu(): void {
    restoreFocus = false;
    const origin = anchor ?? trigger;
    if (origin?.isConnected) origin.focus({ preventScroll: true });
    onClose();
  }
  function navigateSubmenu(event: KeyboardEvent): void {
    if (event.key === "Tab") { leaveMenu(); return; }
    if (focusByPrefix(event)) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); event.stopPropagation(); closeSubmenu(true); return; }
    if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key) || !submenuElement) return;
    typeaheadText = "";
    event.preventDefault();
    event.stopPropagation();
    const buttons = menuButtons(submenuElement);
    const idx = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (!buttons.length) return;
    const direction = event.key === "ArrowUp" ? -1 : 1;
    const start = idx < 0 && direction < 0 ? 0 : idx;
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (start + direction + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }
  $effect(() => { left; top; anchor; align; void tick().then(place); });
  onMount(() => {
    const root = document.getElementById(menuId)!;
    const surface = root.parentElement!;
    const observer = new ResizeObserver(place);
    observer.observe(root);
    const frame = requestAnimationFrame(() => {
      place();
      const buttons = menuButtons(root);
      const preferred = initialItem ? buttons.find(button => button.dataset.contextCommand === initialItem) : undefined;
      (preferred ?? buttons.find(button => !button.hasAttribute("data-context-secondary")) ?? buttons[0] ?? root).focus({ preventScroll: true });
    });
    const modifiers = (event: KeyboardEvent | PointerEvent) => { shifted = event.shiftKey; };
    const escapeSubmenu = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !submenu) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      closeSubmenu(true);
    };
    const resetModifiers = () => { shifted = false; };
    window.addEventListener("keydown", modifiers, true);
    window.addEventListener("keyup", modifiers, true);
    window.addEventListener("pointermove", modifiers, true);
    window.addEventListener("blur", resetModifiers);
    window.addEventListener("keydown", escapeSubmenu, true);
    const reposition = () => { if (anchor) place(); placeSubmenu(); };
    const viewport = window.visualViewport;
    window.addEventListener("resize", reposition);
    viewport?.addEventListener("resize", reposition);
    viewport?.addEventListener("scroll", reposition);
    document.addEventListener("scroll", reposition, true);
    const outside = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || pointerIn(event, surface) || popupContains(surface, target)) return;
      if (submenuPlacement && (pointerIn(event, submenuElement) || popupContains(submenuElement ?? null, target))) return;
      if (trigger?.contains(target) || target.closest(".ui-command-tooltip") || ignoreOutside?.(target)) return;
      // Browser overlays can retarget or cancel a press while inspecting the menu.
      queueMicrotask(() => {
        if (event.defaultPrevented || !surface.isConnected) return;
        restoreFocus = false;
        onClose();
      });
    };
    document.addEventListener("pointerdown", outside, true);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(submenuTimer);
      document.removeEventListener("pointerdown", outside, true);
      window.removeEventListener("keydown", modifiers, true);
      window.removeEventListener("keyup", modifiers, true);
      window.removeEventListener("pointermove", modifiers, true);
      window.removeEventListener("blur", resetModifiers);
      window.removeEventListener("keydown", escapeSubmenu, true);
      window.removeEventListener("resize", reposition);
      viewport?.removeEventListener("resize", reposition);
      viewport?.removeEventListener("scroll", reposition);
      document.removeEventListener("scroll", reposition, true);
    };
  });
</script>

<Portal>
  <Popover
    class={`ui-context-menu ui-context-surface ${className}`}
    aria-label={label}
    autoFocus={false}
    style={`left:${placedLeft}px;top:${placedTop}px`}
    onpointerdown={pressSurface}
    oncontextmenu={event => event.preventDefault()}
    {onClose}
    onFocusReturn={() => { if (restoreFocus && document.activeElement === document.body) onFocusReturn(); }}>
    <div id={menuId} role="menu" aria-label={label} tabindex="-1" class="ui-context-content" class:keyboard onkeydown={navigate}>
      {@render leading?.(shifted)}
      {#if actions}
        <div class="ui-context-strip" role="group" aria-label={message("Standard actions")}>
          {@render actions(shifted)}
        </div>
      {/if}
      {@render children(shifted)}
    </div>
  </Popover>

  {#if submenu}
    <div
      id={`${menuId}-submenu`}
      bind:this={submenuElement}
      class="ui-context-menu ui-context-surface ui-context-content ui-context-flyout"
      role="menu"
      aria-label={submenu.label}
      tabindex="-1"
      style:left={`${submenuPlacement?.left ?? 0}px`}
      style:top={`${submenuPlacement?.top ?? 0}px`}
      style:visibility={submenuPlacement ? "visible" : "hidden"}
      onkeydown={navigateSubmenu}
      onpointerdown={pressSurface}
      onpointerenter={() => clearTimeout(submenuTimer)}
      onpointerleave={event => { if (event.pointerType === "mouse") leaveSubmenu(); }}
      oncontextmenu={event => event.preventDefault()}>
      {#if submenuPlacement?.overlaps}
        <Button class="ui-context-back" role="menuitem" onclick={() => closeSubmenu(true)}>
          <span aria-hidden="true">‹</span>{message("Back to menu")}
        </Button>
      {/if}
      {@render submenu.children()}
    </div>
  {/if}
</Portal>
