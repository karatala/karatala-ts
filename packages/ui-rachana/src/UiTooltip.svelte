<script lang="ts">
  import { flushSync, onDestroy, onMount, type Snippet } from "svelte";
  import UiShortcutHint from "./UiShortcutHint.svelte";
  import { portal } from "./portal";

  type ShortcutTarget = { id: string; label: string; value: string };
  let { delayMs, resolveShortcuts, shortcutEditor }: { delayMs: number; resolveShortcuts?: (element: Element) => ShortcutTarget[]; shortcutEditor?: Snippet<[ShortcutTarget[], string]> } = $props();
  const tooltipId = $props.id();
  let tooltip = $state<HTMLDivElement>()!;
  let text = $state("");
  let shortcut = $state("");
  let shortcutId = $state<string | null>(null);
  let shortcutTargets = $state<ShortcutTarget[]>([]);
  let sections = $state<{ title: string; text: string }[]>([]);
  let pinned = $state(false);
  let left = $state(0);
  let top = $state(0);
  let target: HTMLElement | SVGElement | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let leaveTimer: ReturnType<typeof setTimeout> | undefined;
  let keyboardInput = false;
  let hold: { timer: ReturnType<typeof setTimeout>; pointerId: number; startX: number; startY: number } | null = null;
  let heldPointerId: number | null = null;
  let suppressClick = false;

  function clearHold() { if (hold) clearTimeout(hold.timer); hold = null; }

  function close() {
    clearHold();
    clearTimeout(timer);
    clearTimeout(leaveTimer);
    if (target) {
      const descriptions = (target.getAttribute("aria-describedby") ?? "").split(" ").filter(description => description && description !== tooltipId);
      if (descriptions.length) target.setAttribute("aria-describedby", descriptions.join(" "));
      else target.removeAttribute("aria-describedby");
    }
    target = null;
    text = "";
    shortcut = "";
    shortcutId = null;
    shortcutTargets = [];
    sections = [];
    pinned = false;
  }

  function show(element: HTMLElement | SVGElement, detailed = false, plain = false) {
    if (!element.isConnected || !plain && element.closest(".ui-wheel-button, .ui-wheel-popup")) return close();
    target = element;
    flushSync(() => {
      text = element.getAttribute("data-ui-tooltip") ?? element.getAttribute("aria-description") ?? element.getAttribute("aria-label") ?? "";
      shortcut = plain ? "" : element.closest("[data-ui-shortcut]")?.getAttribute("data-ui-shortcut") ?? "";
      shortcutTargets = plain || !shortcutEditor ? [] : resolveShortcuts?.(element) ?? [];
      shortcutId = shortcutTargets[0]?.id ?? null;
      sections = JSON.parse(element.getAttribute("data-ui-help") ?? "[]");
      const detail = detailed ? element.closest("[data-ui-tooltip-detail]")?.getAttribute("data-ui-tooltip-detail") : null;
      if (!sections.length && detail) {
        const help = JSON.parse(detail);
        const choice = help.choices?.[text];
        sections = [{ title: text, text: [help.text, choice, element.matches(":disabled, [aria-disabled=true]") ? help.unavailable : ""].filter(Boolean).join("\n\n") }];
      }
    });
    const clipped = element instanceof HTMLElement && (element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight);
    if (!text || !sections.length && !shortcut && !shortcutId && !clipped && text.trim() === element.textContent?.trim()) return close();
    element.setAttribute("aria-describedby", [element.getAttribute("aria-describedby"), tooltipId].filter(Boolean).join(" "));
    place();
  }
  function place() {
    if (!tooltip || !target) return;
    const scale = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const viewport = window.visualViewport;
    const leftEdge = (viewport?.offsetLeft ?? 0) + 8;
    const topEdge = (viewport?.offsetTop ?? 0) + 8;
    const rightEdge = leftEdge + (viewport?.width ?? window.innerWidth) - 16;
    const bottomEdge = topEdge + (viewport?.height ?? window.innerHeight) - 16;
    tooltip.style.maxHeight = `${(bottomEdge - topEdge) / scale}px`;
    tooltip.style.overflowY = "auto";
    tooltip.style.boxSizing = "border-box";
    tooltip.style.maxWidth = `${Math.min(sections.length ? 420 : shortcutId ? 360 : 280, (rightEdge - leftEdge) / scale)}px`;
    const anchor = target.getBoundingClientRect();
    const bounds = tooltip.getBoundingClientRect();
    left = Math.max(leftEdge, Math.min(anchor.left, rightEdge - bounds.width)) / scale;
    top = Math.max(topEdge, Math.min(anchor.bottom + 6 + bounds.height <= bottomEdge ? anchor.bottom + 6 : anchor.top - bounds.height - 6, bottomEdge - bounds.height)) / scale;
  }
  $effect(() => {
    if (!tooltip || !text) return;
    const observer = new ResizeObserver(place);
    observer.observe(tooltip);
    return () => observer.disconnect();
  });

  function expandedPopup(element: Element) {
    return !!element.closest('[aria-expanded="true"][aria-haspopup]:not([aria-haspopup="false"]), [role="combobox"][aria-expanded="true"]');
  }

  function enter(event: PointerEvent | FocusEvent) {
    if (event.target instanceof Node && tooltip?.contains(event.target)) { clearTimeout(leaveTimer); return; }
    if (pinned) return;
    if (event instanceof FocusEvent && !keyboardInput) return;
    if (event instanceof PointerEvent && (event.pointerType !== "mouse" || event.buttons > 0)) return close();
    const element = event.target instanceof Element ? event.target.closest<HTMLElement | SVGElement>("[title], [data-ui-tooltip], [data-ui-help], [aria-description], [data-ui-shortcut] button, button[data-ui-shortcut], button[data-ui-shortcut-id], [data-command-id] button, [data-ui-tooltip-detail] button, [data-ui-tooltip-detail] input") : null;
    if (!element) { if (!shortcutId) close(); return; }
    if (element.closest(".ui-wheel-button, .ui-wheel-popup")) return close();
    const title = element.getAttribute("title");
    if (title !== null) {
      element.setAttribute("data-ui-tooltip", title);
      element.removeAttribute("title");
    }
    if (expandedPopup(element)) return close();
    if (element === target) return;
    close();
    if (!element.getAttribute("data-ui-tooltip") && !element.getAttribute("data-ui-help") && !element.getAttribute("aria-description") && !element.closest("[data-ui-tooltip-detail], [data-ui-shortcut], [data-ui-shortcut-id], [data-command-id]")) return;
    target = element;
    timer = setTimeout(() => { if (expandedPopup(element)) close(); else show(element); }, delayMs);
  }

  function leave(event: PointerEvent | FocusEvent) {
    if (pinned) return;
    if (target && event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return;
    if (event.relatedTarget instanceof Node && tooltip?.contains(event.relatedTarget)) { clearTimeout(leaveTimer); return; }
    if (shortcutId) { clearTimeout(leaveTimer); leaveTimer = setTimeout(close, 180); }
    else close();
  }

  function press(event: PointerEvent) {
    keyboardInput = false;
    heldPointerId = null;
    suppressClick = false;
    if (event.target instanceof Node && tooltip?.contains(event.target)) { pinned = true; clearTimeout(leaveTimer); return; }
    close();
    if (event.pointerType === "mouse" || event.button !== 0 || !(event.target instanceof Element)) return;
    if (event.target.closest("[data-hold-action], .ui-combo-button, .ui-combo-trigger, .ui-wheel-button, [role=slider], input[type=range]")) return;
    if (event.target.closest("[data-hold-context]") && !event.target.closest("input, select, textarea")) return;
    const element = event.target.closest<HTMLElement | SVGElement>("[title], [data-ui-tooltip], [data-ui-help], [aria-description], [role=button][aria-label], [role=checkbox][aria-label], [role=switch][aria-label], [role=tab][aria-label], button[aria-label], input[aria-label], select[aria-label], textarea[aria-label], [data-ui-tooltip-detail] button, [data-ui-tooltip-detail] input");
    if (!element) return;
    const title = element.getAttribute("title");
    if (title !== null) { element.setAttribute("data-ui-tooltip", title); element.removeAttribute("title"); }
    hold = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, timer: setTimeout(() => {
      hold = null;
      show(element, true);
      if (!text) return;
      pinned = true;
      if (element instanceof HTMLElement) element.blur();
      heldPointerId = event.pointerId;
      suppressClick = true;
    }, 550) };
  }
  function move(event: PointerEvent) { if (hold && event.pointerId === hold.pointerId && Math.hypot(event.clientX - hold.startX, event.clientY - hold.startY) > 10) clearHold(); }
  function release(event: PointerEvent) {
    clearHold();
    if (event.pointerId !== heldPointerId) return;
    event.preventDefault(); event.stopPropagation();
    heldPointerId = null;
  }
  function cancel() { heldPointerId = null; close(); }
  function context(event: MouseEvent) {
    if (hold || heldPointerId !== null || suppressClick && event.target instanceof Node && target?.contains(event.target)) { event.preventDefault(); return; }
    if (!resolveShortcuts || !shortcutEditor || !(event.target instanceof Element)) return;
    const element = event.target.closest<HTMLButtonElement>("button");
    if (!element || element.closest("[data-hold-context], .ui-wheel-button, .ui-wheel-popup") || !resolveShortcuts(element).length) return;
    event.preventDefault();
    event.stopPropagation();
    close();
    show(element);
    pinned = !!text;
    element.blur();
  }
  function keydown(event: KeyboardEvent) {
    keyboardInput = true;
    if (tooltip?.querySelector("[data-shortcut-recording]") || pinned && event.key !== "Escape") return;
    if (pinned && event.key === "Escape") { event.preventDefault(); event.stopPropagation(); }
    close();
  }
  function resize() { if (pinned && target?.isConnected) place(); else close(); }
  function scroll(event: Event) {
    if (!pinned) return close();
    if (!target?.isConnected) return close();
    if (!(event.target instanceof Node && tooltip?.contains(event.target))) place();
  }
  function click(event: MouseEvent) {
    if (suppressClick) { suppressClick = false; event.preventDefault(); event.stopPropagation(); return; }
    const element = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-ui-help]") : null;
    if (!element) return;
    const wasPinned = pinned && target === element;
    close();
    if (!wasPinned) { show(element); pinned = true; }
  }
  onMount(() => {
    const hardwareShortcut = () => {
      if (tooltip?.querySelector("[data-shortcut-recording]") || pinned) return;
      flushSync(close);
    };
    const help = (event: Event) => {
      if (!(event.target instanceof HTMLElement)) return;
      close();
      show(event.target, true, true);
      pinned = !!text;
    };
    document.addEventListener("ui-help-request", help);
    window.addEventListener("ui-hardware-shortcut", hardwareShortcut);
    return () => { document.removeEventListener("ui-help-request", help); window.removeEventListener("ui-hardware-shortcut", hardwareShortcut); };
  });
  onDestroy(close);
</script>

<svelte:document onpointerovercapture={enter} onpointeroutcapture={leave} onfocusincapture={enter} onfocusoutcapture={leave} onpointerdowncapture={press} onpointermovecapture={move} onpointerupcapture={release} onpointercancelcapture={cancel} oncontextmenucapture={context} onclickcapture={click} onscrollcapture={scroll} />
<svelte:window onkeydowncapture={keydown} onblur={close} onresize={resize} />

{#if text}
  <div
    bind:this={tooltip}
    use:portal={null}
    id={tooltipId}
    class="ui-tooltip"
    class:is-help={sections.length > 0}
    role={shortcutId ? "dialog" : "tooltip"}
    aria-label={shortcutId ? text : undefined}
    data-ui-tooltip-pinned={pinned || undefined}
    data-application-menu={shortcutId ? "" : undefined}
    style:position="fixed"
    style:left={`${left}px`}
    style:top={`${top}px`}
    style:pointer-events={pinned || shortcutId ? "auto" : "none"}>
    {#if sections.length}
      {#each sections as section}
        <section>
          <strong>{section.title}</strong>
          <p>{section.text}</p>
        </section>
      {/each}
    {:else}
      <span class="tooltip-caption">{text}</span>
    {/if}
    {#if shortcutId}
      <div class="tooltip-shortcut-controls">
        {@render shortcutEditor?.(shortcutTargets, text)}
      </div>
    {:else if shortcut}<UiShortcutHint value={shortcut} />{/if}
  </div>
{/if}
