<script lang="ts">
  import { onMount, untrack } from "svelte";
  import Popover from "./Popover.svelte";
  import Button from "./Button.svelte";
  import MessageBar from "./MessageBar.svelte";
  import "./confirm-popover.css";
  let { label, message, confirmLabel, cancelLabel, left, top, trigger, pending, error, onConfirm, onClose, onFocusReturn }: { label: string; message: string; confirmLabel: string; cancelLabel: string; left: number; top: number; trigger: HTMLElement | null; pending: boolean; error: string; onConfirm(): void; onClose(): void; onFocusReturn(): void } = $props();
  const contentId = $props.id();
  let placedLeft = $state(untrack(() => left));
  let placedTop = $state(untrack(() => top));
  let restoreFocus = true;
  function place(): void {
    const bounds = document.getElementById(contentId)?.parentElement?.getBoundingClientRect();
    if (!bounds) return;
    placedLeft = Math.max(4, Math.min(left, innerWidth - bounds.width - 4));
    placedTop = Math.max(4, Math.min(top, innerHeight - bounds.height - 4));
  }
  onMount(() => {
    const root = document.getElementById(contentId)!;
    const observer = new ResizeObserver(place);
    observer.observe(root);
    const frame = requestAnimationFrame(() => { place(); root.querySelector<HTMLButtonElement>("[data-confirm]")?.focus(); });
    const outside = (event: PointerEvent) => {
      if (pending || !(event.target instanceof Element) || root.contains(event.target) || trigger?.contains(event.target)) return;
      restoreFocus = false;
      onClose();
    };
    document.addEventListener("pointerdown", outside, true);
    window.addEventListener("resize", place);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); document.removeEventListener("pointerdown", outside, true); window.removeEventListener("resize", place); };
  });
</script>

<Popover
  class="ui-confirm-popover"
  aria-label={label}
  tabindex={-1}
  style={`left:${placedLeft}px;top:${placedTop}px`}
  onClose={() => { if (!pending) onClose(); }}
  onFocusReturn={() => { if (restoreFocus && document.activeElement === document.body) onFocusReturn(); }}>
  <form id={contentId} onsubmit={event => { event.preventDefault(); event.stopPropagation(); if (!pending) onConfirm(); }}>
    <strong>{label}</strong>
    <p>{message}</p>
    {#if error}
      <MessageBar role="alert" message={error} />
    {/if}
    <div>
      <Button disabled={pending} onclick={onClose}>{cancelLabel}</Button>
      <Button data-confirm type="submit" tone="danger" disabled={pending}>{confirmLabel}</Button>
    </div>
  </form>
</Popover>
