<script lang="ts">
  import { untrack, type Snippet } from "svelte";
  import { portal } from "./portal";
  import { hasEscapePriorityOwner } from "./menu-keyboard";
  import type { WindowGeometry } from "./host";
  import { useLanguage } from "./host";
  import UiButton from "./UiButton.svelte";
  import { uiIcons } from "./icons";
  import { useWindowLayouts } from "./host";

  let { title, layoutKey, onclose, children, actions, titleStart, titleEnd, showTitle = true, modal = true, stretchContent = false, translate: translateLabel, class: className = "" }: {
    title: string;
    layoutKey: string;
    onclose?: () => void;
    translate?: (text: string) => string;
    children: Snippet;
    actions?: Snippet;
    titleStart?: Snippet;
    titleEnd?: Snippet;
    showTitle?: boolean;
    modal?: boolean;
    stretchContent?: boolean;
    class?: string;
  } = $props();
  type Geometry = WindowGeometry;
  const componentId = $props.id();
  const titleId = `${componentId}-title`;
  const language = useLanguage();
  const translate = (text: string) => translateLabel?.(text) ?? language.translate(text);
  const layouts = useWindowLayouts();
  let panel = $state<HTMLElement | null>(null);
  let content = $state<HTMLElement | null>(null);
  let geometry = $state<Geometry | null>(null);
  let previousContentLimit = Infinity;
  let gesture = $state.raw<{ pointerId: number; startX: number; startY: number; geometry: Geometry; scale: number; resize: boolean } | null>(null);
  const geometryStyle = $derived(geometry ? `left:${geometry.x}px;top:${geometry.y}px;right:auto;bottom:auto;transform:none;width:${geometry.width}px;height:${geometry.height}px` : undefined);

  function close() { if (onclose) { save(); onclose(); } }

  function windowBehavior(node: HTMLDivElement) {
    const origin = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const restoreFocus = origin?.matches(":focus-visible") ?? false;
    const siblings = modal ? [...node.parentElement!.children].filter((element): element is HTMLElement => element instanceof HTMLElement && element !== node).map(element => ({ element, inert: element.inert })) : [];
    for (const sibling of siblings) sibling.element.inert = true;
    const topWindow = () => [...document.querySelectorAll("[data-ui-window]")].at(-1) === node;
    const focusable = () => [...node.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]')].filter(element => !element.closest("[inert]") && element.getClientRects().length > 0);
    const frame = requestAnimationFrame(() => {
      if (!modal || !topWindow()) return;
      const requested = node.querySelector<HTMLElement>("[data-dialog-autofocus]");
      (requested ?? focusable()[0] ?? panel)?.focus({ preventScroll: true });
      if (requested instanceof HTMLInputElement && requested.type === "text") requested.select();
    });
    const keyDown = (event: KeyboardEvent) => {
      if (!topWindow() || event.defaultPrevented) return;
      const keyOwners = '[data-ui-popup], [role="menu"], [role="listbox"], [role="dialog"], [data-shortcut-recording], [data-favorite-layout-editor]';
      if ([...node.ownerDocument.querySelectorAll<HTMLElement>("[data-application-menu]")].some(menu => {
        if (menu.closest("[inert]") || !menu.getClientRects().length) return false;
        if (!node.contains(menu) || menu.matches(keyOwners)) return true;
        return [...menu.querySelectorAll<HTMLElement>(keyOwners)].some(owner => !owner.closest("[inert]") && owner.getClientRects().length > 0);
      })) return;
      if (event.key === "Escape") {
        if (hasEscapePriorityOwner(node.ownerDocument)) return;
        event.preventDefault(); event.stopPropagation(); close();
      }
      else if (modal && event.key === "Tab") {
        const controls = focusable();
        const first = controls[0] ?? panel;
        const last = controls.at(-1) ?? panel;
        if (!node.contains(document.activeElement) || event.shiftKey && document.activeElement === first || !event.shiftKey && document.activeElement === last || !controls.length) {
          event.preventDefault();
          (event.shiftKey ? last : first)?.focus({ preventScroll: true });
        }
      }
    };
    const focusIn = (event: FocusEvent) => {
      if (modal && topWindow() && event.target instanceof Element && !node.contains(event.target) && !event.target.closest("[data-application-menu]")) (focusable()[0] ?? panel)?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", keyDown, true);
    document.addEventListener("focusin", focusIn);
    return { destroy() {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", keyDown, true);
      document.removeEventListener("focusin", focusIn);
      for (const sibling of siblings) sibling.element.inert = sibling.inert;
      if (restoreFocus && origin?.isConnected && !origin.closest("[inert]")) origin.focus({ preventScroll: true });
    } };
  }

  function scale() {
    return panel ? panel.getBoundingClientRect().width / panel.offsetWidth || 1 : 1;
  }
  function measure(): Geometry {
    const bounds = panel!.getBoundingClientRect();
    const screenScale = scale();
    return { x: bounds.left / screenScale, y: bounds.top / screenScale, width: panel!.offsetWidth, height: panel!.offsetHeight };
  }
  function portraitDock() {
    return window.matchMedia("(max-width: 640px) and (orientation: portrait)").matches;
  }
  function storageKey() {
    return portraitDock() ? `${layoutKey}:portrait` : layoutKey;
  }
  function windowChromeHeight() {
    if (!panel) return 0;
    const styles = getComputedStyle(panel);
    const header = panel.querySelector<HTMLElement>(".dialog-header");
    const footer = panel.querySelector<HTMLElement>(":scope > .modal-actions");
    const padding = (Number.parseFloat(styles.paddingTop) || 0) + (Number.parseFloat(styles.paddingBottom) || 0);
    const gaps = (Number.parseFloat(styles.rowGap) || 0) * (footer ? 2 : 1);
    return Math.ceil(padding + gaps + (header?.offsetHeight ?? 0) + (footer?.offsetHeight ?? 0));
  }
  function contentHeightLimit(chromeHeight = windowChromeHeight()) {
    return stretchContent || !content ? Infinity : chromeHeight + content.scrollHeight;
  }
  function fit(next: Geometry, initial = false): Geometry {
    const screenScale = scale();
    const viewportWidth = window.innerWidth / screenScale;
    const viewportHeight = window.innerHeight / screenScale;
    const styles = panel ? getComputedStyle(panel) : null;
    const minimumWidth = Number.parseFloat(styles?.getPropertyValue("--dialog-min-width") ?? "") || 0;
    const maximumWidth = Math.max(1, Math.min(viewportWidth - 24, Number.parseFloat(styles?.maxWidth ?? "") || Infinity));
    const width = Math.min(Math.max(minimumWidth, next.width), maximumWidth);
    const top = initial && portraitDock() ? viewportHeight / 2 : 12;
    const chromeHeight = windowChromeHeight();
    const height = Math.min(Math.max(next.height, chromeHeight), contentHeightLimit(chromeHeight), Math.max(1, viewportHeight - top - 12));
    return { width, height, x: Math.max(12, Math.min(next.x, viewportWidth - width - 12)), y: Math.max(top, Math.min(next.y, viewportHeight - height - 12)) };
  }
  function save() {
    if (panel) layouts?.save(storageKey(), measure());
  }
  function startGesture(event: PointerEvent, resize = false) {
    if (event.button !== 0 || !panel || gesture) return;
    const control = event.target instanceof Element ? event.target.closest('button, input, select, textarea, a[href], [contenteditable], [role="button"]:not(.dialog-move-handle), [role="slider"], [role="combobox"]') : null;
    if (!resize && control) return;
    event.preventDefault();
    const handle = event.currentTarget as HTMLElement;
    gesture = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, geometry: measure(), scale: scale(), resize };
    handle.setPointerCapture(event.pointerId);
  }
  function moveGesture(event: PointerEvent) {
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const deltaX = (event.clientX - gesture.startX) / gesture.scale;
    const deltaY = (event.clientY - gesture.startY) / gesture.scale;
    const start = gesture.geometry;
    geometry = fit(gesture.resize ? { ...start, width: Math.max(240, start.width + deltaX), height: Math.max(160, start.height + deltaY) } : { ...start, x: start.x + deltaX, y: start.y + deltaY });
  }
  function endGesture(event: PointerEvent) {
    if (gesture?.pointerId !== event.pointerId) return;
    gesture = null;
    const handle = event.currentTarget as HTMLElement;
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    if (geometry) { geometry = fit(geometry); layouts?.save(storageKey(), geometry); }
    handle.blur();
  }
  function moveWithKeys(event: KeyboardEvent, resize = false) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key) || !panel) return;
    event.preventDefault();
    event.stopPropagation();
    const next = measure();
    const deltaX = event.key === "ArrowLeft" ? -16 : event.key === "ArrowRight" ? 16 : 0;
    const deltaY = event.key === "ArrowUp" ? -16 : event.key === "ArrowDown" ? 16 : 0;
    geometry = fit(resize ? { ...next, width: Math.max(240, next.width + deltaX), height: Math.max(160, next.height + deltaY) } : { ...next, x: next.x + deltaX, y: next.y + deltaY });
    layouts?.save(storageKey(), geometry);
  }
  $effect(() => {
    if (!panel) return;
    const observedPanel = panel;
    const observedContent = content;
    const contentCanStretch = stretchContent;
    previousContentLimit = Infinity;
    const saved = untrack(() => layouts?.read(storageKey()));
    if (saved) geometry = fit(saved);
    const frame = requestAnimationFrame(() => { if (panel && !gesture) geometry = fit(saved ?? measure(), !saved); });
    const resize = () => {
      if (gesture || !panel) return;
      const next = { ...(layouts?.read(storageKey()) ?? measure()) };
      const limit = contentCanStretch ? Infinity : contentHeightLimit();
      if (Number.isFinite(previousContentLimit) && Math.abs(measure().height - previousContentLimit) <= 1) next.height = limit;
      previousContentLimit = limit;
      geometry = fit(next);
    };
    const observer = new ResizeObserver(resize);
    const observe = () => {
      observer.disconnect();
      for (const element of [observedPanel, ...observedPanel.children, ...(observedContent?.children ?? [])]) if (element instanceof HTMLElement) observer.observe(element);
      resize();
    };
    untrack(observe);
    const mutation = new MutationObserver(observe);
    mutation.observe(observedPanel, { childList: true });
    if (observedContent) mutation.observe(observedContent, { childList: true });
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutation.disconnect();
      window.removeEventListener("resize", resize);
    };
  });
</script>

{#snippet windowContent()}
  <div
    class="dialog-header"
    class:is-moving={gesture !== null && !gesture.resize}
    role="presentation"
    onpointerdown={event => startGesture(event)}
    onpointermove={moveGesture}
    onpointerup={endGesture}
    onpointercancel={endGesture}
    onlostpointercapture={endGesture}>
    {#if titleStart || titleEnd}
      <div class="dialog-title-start">{@render titleStart?.()}</div>
    {/if}
    <div
      class="dialog-move-handle"
      class:is-moving={gesture !== null && !gesture.resize}
      role="button"
      tabindex="0"
      aria-label={translate("Move window")}
      onkeydown={event => moveWithKeys(event)}>
      <h2 id={titleId} class={`modal-title${showTitle ? "" : " visually-hidden"}`}>{title}</h2>
    </div>
    <div class="dialog-title-end">
      {@render titleEnd?.()}
      {#if onclose}
        <UiButton class="modal-close" variant="icon" tone="close" label={translate("Close")} path={uiIcons.close} onclick={close} />
      {/if}
    </div>
  </div>
  <div bind:this={content} class="modal-content">{@render children()}</div>
  {#if actions}
    <footer class="modal-actions">{@render actions()}</footer>
  {/if}
  <div
    class="dialog-resize-handle"
    class:is-resizing={gesture?.resize === true}
    role="button"
    tabindex="0"
    aria-label={translate("Resize window")}
    data-ui-tooltip={translate("Resize window")}
    onpointerdown={event => startGesture(event, true)}
    onpointermove={moveGesture}
    onpointerup={endGesture}
    onpointercancel={endGesture}
    onlostpointercapture={endGesture}
    onkeydown={event => moveWithKeys(event, true)}></div>
{/snippet}

<div use:portal use:windowBehavior data-ui-window style="display:contents">
  {#if modal}
    <div class="modal-overlay" aria-hidden="true" onpointerdown={close}></div>
  {/if}
  <div bind:this={panel} role="dialog" aria-modal={modal || undefined} aria-labelledby={titleId} tabindex="-1" class={`modal-dialog ${className}`} class:has-stretch-content={stretchContent} style={geometryStyle}>
    {@render windowContent()}
  </div>
</div>
