<script lang="ts">
  import { onDestroy } from "svelte";
  import Icon from "./Icon.svelte";
  import { useKomandirUiHost } from "./host";
  const { message } = useKomandirUiHost();

  let { label, accessibleLabel, sorted, onSort, onResize, width = null, minimum = 40, resizeFromStart = false, onReset, onAutoSize }: { label: string; accessibleLabel?: string; sorted?: "ascending" | "descending"; onSort(): void; onResize?(width: number): void; width?: number | null; minimum?: number; resizeFromStart?: boolean; onReset?(): void; onAutoSize?(): void } = $props();
  let fullLabel = $derived(accessibleLabel ?? label);
  let header = $state<HTMLDivElement>();
  let measuredWidth = $state(0);
  $effect(() => {
    if (!header || !onResize) return;
    const observer = new ResizeObserver(() => measuredWidth = header!.offsetWidth);
    observer.observe(header);
    return () => observer.disconnect();
  });
  let drag = $state.raw<{ pointerId: number; start: number; width: number; scale: number } | null>(null);
  let sortTimer: ReturnType<typeof setTimeout> | undefined;
  let lastTap: { time: number; clientX: number; clientY: number } | null = null;
  let suppressClick = false;
  function resize(value: number): void { onResize?.(Math.max(minimum, Math.min(2000, Math.round(value)))); }
  function fit(): void { clearTimeout(sortTimer); (onAutoSize ?? onReset)?.(); }
  function sort(event: MouseEvent): void {
    if (suppressClick) { suppressClick = false; return; }
    if (!onAutoSize || event.detail === 0) { onSort(); return; }
    clearTimeout(sortTimer);
    if (event.detail === 1) sortTimer = setTimeout(onSort, 300);
  }
  function tap(event: PointerEvent): void {
    if (!onAutoSize || event.pointerType === "mouse") return;
    if (drag && Math.abs(event.clientX - drag.start) > 6) { lastTap = null; return; }
    if (lastTap && event.timeStamp - lastTap.time < 350 && Math.hypot(event.clientX - lastTap.clientX, event.clientY - lastTap.clientY) < 12) {
      lastTap = null;
      suppressClick = event.currentTarget instanceof Element && event.currentTarget.matches("button");
      fit();
    } else lastTap = { time: event.timeStamp, clientX: event.clientX, clientY: event.clientY };
  }
  onDestroy(() => clearTimeout(sortTimer));
</script>

<div class="column-header" role="columnheader" aria-label={fullLabel} aria-sort={sorted ?? "none"} bind:this={header}>
  <button
    type="button"
    class="column-sort"
    title={fullLabel}
    aria-label={fullLabel}
    onclick={sort}
    ondblclick={fit}
    onpointerdown={event => { if (event.button === 0) event.preventDefault(); }}
    onpointerup={tap}
    onpointercancel={() => lastTap = null}
    onkeydown={event => event.stopPropagation()}>
    <span>{label}</span>
    <span class="column-sort-indicator" aria-hidden="true">
      {#if sorted}
        <Icon name={sorted === "ascending" ? "navigation.sortAscending" : "navigation.sortDescending"} size={11} />
      {/if}
    </span>
  </button>
  {#if onResize}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (Focusable separator exposes its width and implements keyboard resizing.) -->
    <div
      class="column-resizer"
      class:from-start={resizeFromStart}
      class:resizing={drag !== null}
      role="separator"
      tabindex="0"
      aria-label={message(onAutoSize ? "Resize {name}: drag or arrows; double-click, double-tap or Enter to fit; Home to reset" : "Resize {name}: drag, arrows, double-click or Home to reset", { name: fullLabel })}
      aria-orientation="vertical"
      aria-valuemin={minimum}
      aria-valuemax={Math.max(2000, measuredWidth)}
      aria-valuenow={measuredWidth || width || minimum}
      onpointerdown={event => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        const width = header!.offsetWidth;
        drag = { pointerId: event.pointerId, start: event.clientX, width, scale: header!.getBoundingClientRect().width / width };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onpointermove={event => {
        if (drag?.pointerId !== event.pointerId) return;
        const delta = (event.clientX - drag.start) / drag.scale;
        resize(drag.width + (resizeFromStart ? -delta : delta));
      }}
      onpointerup={event => { tap(event); if (drag?.pointerId === event.pointerId) { drag = null; event.currentTarget.releasePointerCapture(event.pointerId); } }}
      onpointercancel={() => drag = null}
      onlostpointercapture={() => drag = null}
      ondblclick={fit}
      onkeydown={event => {
        event.stopPropagation();
        if (event.key === "Home") { event.preventDefault(); onReset?.(); }
        else if (event.key === "Enter" && onAutoSize) { event.preventDefault(); fit(); }
        else if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); resize(header!.offsetWidth + ((event.key === "ArrowLeft") === resizeFromStart ? 10 : -10)); }
      }}></div>
  {/if}
</div>

<style>
  .column-header {
    position: relative;
    display: flex;
    align-items: stretch;
    min-width: 0;
    height: 100%;
    overflow: visible;
  }
  .column-sort {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 3px;
    width: 100%;
    min-width: 0;
    height: 100%;
    padding: 0 7px;
    border: 0;
    border-radius: 0;
    color: inherit;
    background: transparent;
    font-size: var(--ui-font-small);
    cursor: pointer;
    touch-action: manipulation;
  }
  .column-sort > span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .column-sort-indicator {
    display: grid;
    place-items: center;
    flex: 0 0 11px;
    width: 11px;
  }
  .column-sort:hover {
    background: var(--theme-workbench-hover);
  }
  .column-resizer {
    position: absolute;
    z-index: 2;
    inset: 0 -3px 0 auto;
    width: 7px;
    min-height: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    cursor: col-resize;
    touch-action: none;
    user-select: none;
  }
  .column-resizer.from-start { inset-inline: 0 auto; }
  .column-resizer:is(:hover, :focus-visible, .resizing) {
    background: color-mix(in srgb, var(--theme-workbench-accent) 65%, transparent);
    outline: none;
  }
</style>
