<script lang="ts">
  import { onMount, tick, type Snippet } from "svelte";
  import Portal from "./Portal.svelte";
  import { popupContains } from "./portal.ts";
  import Popover from "./Popover.svelte";
  import IconButton from "./IconButton.svelte";
  import Icon from "./Icon.svelte";
  import { useKomandirUiHost } from "./host";
  const { message } = useKomandirUiHost();

  let { title, trigger, side = "bottom", pending = false, initialFocus, class: className = "", children, onClose, onFocusReturn }: { title: string; trigger: HTMLElement | null; side?: "bottom" | "right"; pending?: boolean; initialFocus?: string; class?: string; children: Snippet; onClose(): void; onFocusReturn(): void } = $props();
  const popupId = $props.id();
  let left = $state(0);
  let top = $state(0);
  let placed = $state(false);
  let restoreFocus = true;

  function close(): void { if (!pending) onClose(); }
  onMount(() => {
    let removed = false;
    let dispose: (() => void) | undefined;
    void tick().then(() => { if (!removed) dispose = attachPopup(); });
    return () => { removed = true; dispose?.(); };
  });
  function attachPopup(): () => void {
    const root = document.getElementById(popupId)!;
    const place = () => {
      if (!trigger?.isConnected) { close(); return; }
      const scale = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
      const viewport = window.visualViewport;
      const leftEdge = (viewport?.offsetLeft ?? 0) + 12;
      const topEdge = (viewport?.offsetTop ?? 0) + 12;
      const rightEdge = leftEdge + (viewport?.width ?? innerWidth) - 24;
      const bottomEdge = topEdge + (viewport?.height ?? innerHeight) - 24;
      root.style.maxWidth = `${Math.max(0, rightEdge - leftEdge) / scale}px`;
      root.style.maxHeight = `${Math.max(0, bottomEdge - topEdge) / scale}px`;
      const anchor = trigger.getBoundingClientRect();
      const bounds = root.getBoundingClientRect();
      const gap = 6 * scale;
      const flip = side === "right" ? rightEdge - anchor.right < bounds.width + gap && anchor.left - leftEdge > rightEdge - anchor.right : bottomEdge - anchor.bottom < bounds.height + gap && anchor.top - topEdge > bottomEdge - anchor.bottom;
      const desiredLeft = side === "right" ? flip ? anchor.left - bounds.width - gap : anchor.right + gap : anchor.left;
      const desiredTop = side === "bottom" ? flip ? anchor.top - bounds.height - gap : anchor.bottom + gap : anchor.top;
      left = Math.max(leftEdge, Math.min(desiredLeft, rightEdge - bounds.width)) / scale;
      top = Math.max(topEdge, Math.min(desiredTop, bottomEdge - bounds.height)) / scale;
      placed = true;
    };
    const observer = new ResizeObserver(place);
    observer.observe(root);
    if (trigger) observer.observe(trigger);
    const frame = requestAnimationFrame(async () => {
      place();
      await tick();
      if (!root.isConnected || document.activeElement !== trigger && document.activeElement !== document.body) return;
      const field = (initialFocus ? root.querySelector<HTMLElement>(initialFocus) : null) ?? root.querySelector<HTMLElement>("input:not(:disabled), select:not(:disabled), textarea:not(:disabled)");
      (field ?? root).focus({ preventScroll: true });
      if (field instanceof HTMLInputElement) field.select();
    });
    const outside = (event: PointerEvent) => {
      if (pending || !(event.target instanceof Node) || popupContains(root, event.target) || trigger?.contains(event.target)) return;
      restoreFocus = false;
      close();
    };
    const blur = () => { if (!pending) { restoreFocus = false; close(); } };
    const viewport = window.visualViewport;
    document.addEventListener("pointerdown", outside, true);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    window.addEventListener("blur", blur);
    viewport?.addEventListener("resize", place);
    viewport?.addEventListener("scroll", place);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", outside, true);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      window.removeEventListener("blur", blur);
      viewport?.removeEventListener("resize", place);
      viewport?.removeEventListener("scroll", place);
    };
  }
</script>

<Portal to="body">
  <Popover
    id={popupId}
    class={`ui-mini-popup ${className}`}
    aria-labelledby={`${popupId}-title`}
    aria-busy={pending}
    tabindex={-1}
    autoFocus={false}
    style={`left:${left}px;top:${top}px;visibility:${placed ? "visible" : "hidden"}`}
    onClose={close}
    onFocusReturn={() => { if (restoreFocus && document.activeElement === document.body) onFocusReturn(); }}>
    <header class="mini-popup-heading">
      <strong id={`${popupId}-title`}>{title}</strong>
      <IconButton class="mini-popup-close ui-close-button" label={message("Close")} disabled={pending} onclick={close}>
        <Icon name="sharedControls.remove" size={16} />
      </IconButton>
    </header>
    {@render children()}
  </Popover>
</Portal>

<style>
  :global(.ui-mini-popup) { position: fixed; z-index: 1450; display: grid; box-sizing: border-box; width: 320px; max-width: calc(100vw - 24px); max-height: calc(100dvh - 24px); gap: 9px; padding: 8px; overflow: auto; --theme-workbench-input: var(--karatala-color-popup-field, color-mix(in srgb, var(--theme-workbench-surface), var(--theme-workbench-foreground) 24%)); --karatala-color-field: var(--theme-workbench-input); border: 0; border-radius: var(--ui-corner-radius, 6px); color: var(--theme-workbench-foreground); background: var(--theme-workbench-surface); box-shadow: var(--ui-popup-shadow); font-size: var(--ui-font-normal); line-height: 1.35; }
  .mini-popup-heading { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .mini-popup-heading strong { flex: 1; min-width: 0; overflow-wrap: anywhere; font-weight: var(--ui-weight-strong); }
  .mini-popup-heading :global(.mini-popup-close.ui-button) { width: 24px; min-width: 24px; min-height: 24px; padding: 2px; background: transparent; }
</style>
