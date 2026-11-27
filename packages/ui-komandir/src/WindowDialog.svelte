<script lang="ts">
  import { useKomandirUiHost } from "./host";
  const { message, loadInterfaceState, saveInterfaceState } = useKomandirUiHost();
  import { onMount, type Snippet } from "svelte";
  import Portal from "./Portal.svelte";
  import { popupContains } from "./portal.ts";
  import { containModalTab, registerOverlay, returnFocus } from "./overlay-focus.ts";
  import IconButton from "./IconButton.svelte";
  import Icon from "./Icon.svelte";
  import WindowTitleBar from "./WindowTitleBar.svelte";

  let { title, titleContent, titleActions, titleButtons, stateKey, initialSize, layer = 0, nonModal = false, blocked = false, closeDisabled = false, topmost = true, toolbarEditing = false, children, onClose, onOpenWindow, onFocusReturn, onActivate, onMoveEnd }: { title: string; titleContent?: Snippet; titleActions?: Snippet; titleButtons?: Snippet; stateKey?: string; initialSize?: { width: number; height: number }; layer?: number; nonModal?: boolean; blocked?: boolean; closeDisabled?: boolean; topmost?: boolean; toolbarEditing?: boolean; children: Snippet; onClose(): void; onOpenWindow?(): void; onFocusReturn?(): void; onActivate?(): void; onMoveEnd?(event: PointerEvent): void } = $props();
  const titleId = $props.id();
  let body = $state<HTMLDivElement>();
  let floatingWindow = $state<HTMLDivElement>();
  let maximized = $state(false);
  let viewport = $state({ left: 0, top: 0, width: innerWidth, height: innerHeight, scale: 1 });
  let normal = $state({ left: 40, top: 35, width: 1100, height: 760 });
  let compact = $derived(viewport.width < 700 || viewport.height < 500);
  let bounds = $derived(fit(normal));
  let geometry = $derived(`left:${bounds.left}px;top:${bounds.top}px;width:${bounds.width}px;height:${bounds.height}px`);
  let gesture: { id: number; clientX: number; clientY: number; rect: typeof normal; resize: boolean } | null = null;
  let geometryChanged = false;
  let savedGeometry = "";

  function rememberGeometry(): void {
    geometryChanged = true;
    if (!stateKey) return;
    const state = { ...normal, maximized };
    const key = JSON.stringify(state);
    if (key === savedGeometry) return;
    savedGeometry = key;
    void saveInterfaceState({ toolWindows: { [stateKey]: state } }).catch(reason => { if (savedGeometry === key) savedGeometry = ""; console.warn(reason); });
  }
  function toggleMaximized(): void { maximized = !maximized; rememberGeometry(); }
  function close(): void { if (closeDisabled) return; if (geometryChanged) rememberGeometry(); onClose(); }

  function fit(rect: typeof normal): typeof normal {
    const inset = compact ? 0 : 8;
    const width = maximized || compact ? viewport.width - inset * 2 : Math.min(Math.max(360, rect.width), viewport.width - inset * 2);
    const toolbarOffset = toolbarEditing ? (document.querySelector(".file-manager-layout-toolbar")?.getBoundingClientRect().bottom ?? 0) / viewport.scale - viewport.top : 0;
    const minTop = viewport.top + inset + Math.max(0, Math.min(toolbarOffset, viewport.height - inset * 2 - 80));
    const availableHeight = viewport.height + viewport.top - minTop - inset;
    const fillHeight = maximized || compact;
    const height = fillHeight ? availableHeight : Math.min(Math.max(240, rect.height), availableHeight);
    return { width, height, left: maximized || compact ? viewport.left + inset : Math.max(viewport.left + inset, Math.min(rect.left, viewport.left + viewport.width - width - inset)), top: fillHeight ? minTop : Math.max(minTop, Math.min(rect.top, viewport.top + viewport.height - height - inset)) };
  }
  export function focusContent(): void {
    (body?.querySelector<HTMLElement>('input:not(:disabled), textarea:not(:disabled), [tabindex="0"], button:not(:disabled)') ?? body)?.focus({ preventScroll: true });
  }
  function start(event: PointerEvent, resize = false): void {
    if (event.button !== 0 || compact || maximized) return;
    event.preventDefault();
    gesture = { id: event.pointerId, clientX: event.clientX, clientY: event.clientY, rect: { ...bounds }, resize };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent): void {
    if (!gesture || gesture.id !== event.pointerId) return;
    const deltaX = (event.clientX - gesture.clientX) / viewport.scale;
    const deltaY = (event.clientY - gesture.clientY) / viewport.scale;
    normal = fit(gesture.resize ? { ...gesture.rect, width: gesture.rect.width + deltaX, height: gesture.rect.height + deltaY } : { ...gesture.rect, left: gesture.rect.left + deltaX, top: gesture.rect.top + deltaY });
  }
  function end(event: PointerEvent): void {
    if (gesture?.id !== event.pointerId) return;
    const moved = !gesture.resize;
    gesture = null;
    rememberGeometry();
    const handle = event.currentTarget as HTMLElement;
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    if (moved && event.type === "pointerup") onMoveEnd?.(event);
  }
  const moveEvents = { onpointerdown: (event: PointerEvent) => start(event), onpointermove: move, onpointerup: end, onpointercancel: end, onlostpointercapture: end, ondblclick: toggleMaximized };
  function key(event: KeyboardEvent, resize = false): void {
    if (compact || maximized || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const step = event.shiftKey ? 1 : 16;
    const deltaX = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
    const deltaY = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
    normal = fit(resize ? { ...bounds, width: bounds.width + deltaX, height: bounds.height + deltaY } : { ...bounds, left: bounds.left + deltaX, top: bounds.top + deltaY });
    rememberGeometry();
  }
  function closeOnEscape(event: KeyboardEvent): boolean | void {
    if (blocked || !(event.target instanceof Node) || !popupContains(floatingWindow ?? null, event.target)) return false;
    close();
  }
  $effect(() => {
    if (!floatingWindow) return;
    const dispose = registerOverlay(floatingWindow, closeOnEscape);
    return dispose;
  });
  $effect(() => {
    if (floatingWindow && !nonModal && topmost && !blocked) return containModalTab(floatingWindow);
  });
  onMount(() => {
    const update = () => {
      const visual = window.visualViewport;
      const scale = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
      viewport = { left: (visual?.offsetLeft ?? 0) / scale, top: (visual?.offsetTop ?? 0) / scale, width: (visual?.width ?? innerWidth) / scale, height: (visual?.height ?? innerHeight) / scale, scale };
    };
    update();
    const width = initialSize?.width ?? (nonModal ? 920 : normal.width);
    const requestedHeight = initialSize?.height ?? (nonModal ? 680 : normal.height);
    const toolbarBottom = (document.querySelector(".file-manager-layout-toolbar")?.getBoundingClientRect().bottom ?? 0) / viewport.scale;
    const top = viewport.top + (nonModal ? Math.max(80, toolbarBottom - viewport.top + 8) : 24) + layer * 16;
    const height = nonModal ? Math.min(requestedHeight, viewport.height + viewport.top - top - 8) : requestedHeight;
    const margin = Math.max(8, (viewport.width - Math.min(width, viewport.width - 32)) / 2);
    normal = { width, height, left: viewport.left + margin + layer * 16, top };
    const requests = new AbortController();
    if (stateKey) void loadInterfaceState(requests.signal).then(state => {
      if (requests.signal.aborted) return;
      const stored = state.toolWindows?.[stateKey!];
      if (stored && !geometryChanged) {
        normal = { left: stored.left, top: stored.top, width: stored.width, height: stored.height };
        maximized = stored.maximized;
        savedGeometry = JSON.stringify(stored);
      }
    }).catch(reason => { if (!requests.signal.aborted) console.warn(reason); });
    window.addEventListener("resize", update);
    if (!nonModal && topmost) body?.focus({ preventScroll: true });
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      if (geometryChanged) rememberGeometry();
      requests.abort();
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
      returnFocus(() => onFocusReturn?.());
    };
  });
</script>

{#snippet frame()}
  <WindowTitleBar center={titleContent} actions={titleActions}>
    {#snippet heading()}
      <button
        class="window-move"
        type="button"
        aria-label={message("Move window: drag or use arrow keys")}
        {...moveEvents}
        onkeydown={event => key(event)}>
        <strong id={titleId}>{title}</strong>
      </button>
    {/snippet}
    {#snippet trailingDrag()}
      <div class="window-move" role="presentation" {...moveEvents}></div>
    {/snippet}
      {@render titleButtons?.()}
      {#if onOpenWindow}
        <IconButton ghost label={message("Open in separate window")} onclick={onOpenWindow}>
          <Icon name="window.detach" />
        </IconButton>
      {/if}
      {#if !compact}
        <IconButton ghost label={message(maximized ? "Restore window size" : "Maximize")} aria-pressed={maximized} onclick={toggleMaximized}>
          <Icon name={maximized ? "window.restore" : "window.maximize"} />
        </IconButton>
      {/if}
      <IconButton ghost class="ui-close-button" label={message("Close")} disabled={closeDisabled} onclick={close}>
        <Icon name="sharedControls.remove" />
      </IconButton>
  </WindowTitleBar>
    <div class="window-content" data-window-content tabindex="-1" bind:this={body}>
      {@render children()}
    </div>
    {#if !compact && !maximized}
      <button
        class="window-resize"
        type="button"
        aria-label={message("Resize window: drag or use arrow keys")}
        onpointerdown={event => start(event, true)}
        onpointermove={move}
        onpointerup={end}
        onpointercancel={end}
        onlostpointercapture={end}
        onkeydown={event => key(event, true)}></button>
    {/if}
{/snippet}

<Portal to="body">
  <div class="window-layer" inert={blocked} style:z-index={(nonModal ? 900 : 1800) + layer * 2}>
    {#if !nonModal}<div class="window-shade" aria-hidden="true"></div>{/if}
    <div
      class="window-dialog"
      role="dialog"
      aria-labelledby={titleId}
      aria-modal={!nonModal && topmost ? true : undefined}
      tabindex="-1"
      data-window-non-modal={nonModal ? "" : undefined}
      style={geometry}
      bind:this={floatingWindow}
      onpointerdowncapture={onActivate}>
      {@render frame()}
    </div>
  </div>
</Portal>

<style>
  .window-layer { position: fixed; inset: 0; pointer-events: none; }
  .window-shade { position: absolute; inset: 0; background: rgb(0 0 0 / 25%); pointer-events: auto; }
  :global(.window-dialog) { --theme-workbench-input: color-mix(in srgb, var(--theme-workbench-background), var(--theme-workbench-foreground) 24%); --karatala-color-field: var(--theme-workbench-input); position: fixed; display: flex; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden; border: 0; border-radius: var(--ui-corner-radius, 6px); color: var(--theme-workbench-foreground); background: var(--theme-workbench-background); box-shadow: var(--ui-popup-shadow); pointer-events: auto; }
  .window-move { flex: 1; align-self: stretch; justify-content: flex-start; min-width: 0; padding: 0 6px; overflow: hidden; border: 0; color: inherit; background: transparent; cursor: move; touch-action: none; user-select: none; }
  div.window-move { padding: 0; }
  .window-move:focus-visible { outline: none; color: var(--theme-workbench-accent); }
  .window-move strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: var(--ui-weight-strong); }
  .window-content { flex: 1; min-width: 0; min-height: 0; overflow: hidden; container: tool-page / inline-size; }
  .window-resize { position: absolute; right: 0; bottom: 0; width: 15px; height: 15px; min-height: 0; padding: 0; border: 0; background: linear-gradient(135deg, transparent 55%, var(--theme-workbench-muted) 56% 61%, transparent 62% 75%, var(--theme-workbench-muted) 76% 81%, transparent 82%); cursor: nwse-resize; touch-action: none; }
  @media (max-width: 700px), (max-height: 500px) { :global(.window-dialog) { border-radius: 0; } .window-move { cursor: default; } }
</style>
