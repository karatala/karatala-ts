<script module lang="ts">
  import type { Snippet } from "svelte";

  const formattedHints = new WeakMap<HTMLElement, Snippet>();

  export function tooltipContent(element: HTMLElement, content: Snippet | undefined) {
    if (!content) return;
    formattedHints.set(element, content);
    return { destroy: () => formattedHints.delete(element) };
  }
</script>

<script lang="ts">
  import { onMount, tick, untrack } from "svelte";
  import { formatShortcut, shortcutFromEvent, shortcutSignature, type ShortcutBindings, type ShortcutCommandId, type KeyboardShortcut } from "./shortcut-codec.ts";
  import ShortcutHint from "./ShortcutHint.svelte";
  import Keycap from "./Keycap.svelte";
  import Popover from "./Popover.svelte";
  import Button from "./Button.svelte";
  import { useKomandirUiHost } from "./host";
  const { message } = useKomandirUiHost();
  import { TooltipTitles } from "./tooltip-titles.ts";

  const tooltipId = $props.id();
  const titles = new TooltipTitles();
  let { bindings, defaults, commands, ready, validate, onAssign }: { bindings: ShortcutBindings; defaults: ShortcutBindings; commands: readonly ShortcutCommandId[]; ready: boolean; validate(command: ShortcutCommandId, shortcuts: KeyboardShortcut[]): string; onAssign(command: ShortcutCommandId, shortcuts: KeyboardShortcut[]): Promise<void> } = $props();
  let knownCommands = $derived(new Set<string>(commands));
  let text = $state("");
  let command = $state<ShortcutCommandId | null>(null);
  let content = $state<Snippet>();
  let popup = $state<HTMLDivElement | null>(null);
  let left = $state(0);
  let top = $state(0);
  let pinned = false;
  let recording = $state(false);
  let editingIndex = $state<number | null>(null);
  let draft = $state<KeyboardShortcut | null>(null);
  let draftKey = "";
  let saving = $state(false);
  let error = $state("");
  let recorder = $state<HTMLButtonElement | null>(null);
  let addRecorder = $state<HTMLButtonElement | null>(null);
  let generation = 0;
  let hasDefaultChanges = $derived(command !== null && defaults[command].length > 0 && bindings[command].map(shortcutSignature).join("|") !== defaults[command].map(shortcutSignature).join("|"));
  let target: HTMLElement | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let leaveTimer: ReturnType<typeof setTimeout> | undefined;
  let keyboardInput = false;
  let touch: { id: number; startX: number; startY: number; element: HTMLElement; shown: boolean } | null = null;
  let heldClick: { element: HTMLElement; until: number } | null = null;
  let holdPoint: { x: number; y: number } | null = null;

  function close(): void {
    untrack(() => {
      clearTimeout(timer);
      clearTimeout(leaveTimer);
      touch = null;
      holdPoint = null;
      if (target) {
        const descriptions = (target.getAttribute("aria-describedby") ?? "").split(" ").filter(value => value && value !== tooltipId);
        if (descriptions.length) target.setAttribute("aria-describedby", descriptions.join(" "));
        else target.removeAttribute("aria-describedby");
      }
      target = null;
      text = "";
      command = null;
      content = undefined;
      popup = null;
      pinned = false;
      recording = false;
      editingIndex = null;
      draft = null;
      draftKey = "";
      generation += 1;
      error = "";
    });
  }
  async function show(element: HTMLElement): Promise<void> {
    if (!element.isConnected || target !== element) return;
    const focusedDialog = document.activeElement?.closest("[role=dialog]:not([data-window-non-modal])");
    if (element.closest("[data-tooltip-disabled]")) return close();
    const interactiveBackground = focusedDialog?.hasAttribute("data-interactive-background") && element.closest("[data-tooltip-interactive-background]");
    if (focusedDialog && !focusedDialog.contains(element) && !focusedDialog.matches(".ui-command-tooltip") && !interactiveBackground) return close();
    const title = element.getAttribute("data-tooltip") ?? titles.title(element) ?? element.getAttribute("aria-label") ?? "";
    const candidate = element.closest("[data-shortcut-command]")?.getAttribute("data-shortcut-command") ?? "";
    const shortcut = knownCommands.has(candidate) ? candidate as ShortcutCommandId : null;
    const formatted = shortcut ? undefined : formattedHints.get(element);
    const label = element.querySelector<HTMLElement>("[data-tooltip-text]") ?? element;
    const clipped = label.scrollWidth > label.clientWidth + 1 || label.scrollHeight > label.clientHeight + 1;
    if (element.hasAttribute("data-tooltip-when-clipped") && !clipped) return close();
    if (!title || !formatted && !shortcut && !element.hasAttribute("data-tooltip-always") && !element.closest(".ui-segmented") && title.trim() === element.textContent?.trim() && !clipped) return close();
    text = title;
    command = shortcut;
    content = formatted;
    element.setAttribute("aria-describedby", [element.getAttribute("aria-describedby"), tooltipId].filter(Boolean).join(" "));
    await tick();
    popup = document.getElementById(tooltipId) as HTMLDivElement | null;
    if (!popup || target !== element) return;
    place();
  }
  function place(): void {
    if (!popup || !target?.isConnected) return;
    const scale = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const viewport = window.visualViewport;
    const leftEdge = (viewport?.offsetLeft ?? 0) + 8;
    const topEdge = (viewport?.offsetTop ?? 0) + 8;
    const rightEdge = leftEdge + (viewport?.width ?? window.innerWidth) - 16;
    const bottomEdge = topEdge + (viewport?.height ?? window.innerHeight) - 16;
    popup.style.maxWidth = `${Math.min(recording ? 420 : content ? 380 : 280, (rightEdge - leftEdge) / scale)}px`;
    popup.style.maxHeight = `${(bottomEdge - topEdge) / scale}px`;
    const anchor = target.getBoundingClientRect();
    let bounds = popup.getBoundingClientRect();
    let preferredTop = anchor.bottom + 6 + bounds.height <= bottomEdge ? anchor.bottom + 6 : anchor.top - bounds.height - 6;
    if (holdPoint) {
      const aboveEdge = Math.min(anchor.top - 12, holdPoint.y - 56);
      const belowEdge = Math.max(anchor.bottom + 12, holdPoint.y + 64);
      const aboveSpace = Math.max(0, aboveEdge - topEdge);
      const belowSpace = Math.max(0, bottomEdge - belowEdge);
      const useAbove = aboveSpace >= bounds.height || aboveSpace >= belowSpace;
      popup.style.maxHeight = `${(useAbove ? aboveSpace : belowSpace) / scale}px`;
      bounds = popup.getBoundingClientRect();
      preferredTop = useAbove ? aboveEdge - bounds.height : belowEdge;
    }
    left = Math.max(leftEdge, Math.min(holdPoint ? holdPoint.x - bounds.width / 2 : anchor.left, rightEdge - bounds.width)) / scale;
    top = Math.max(topEdge, Math.min(preferredTop, bottomEdge - bounds.height)) / scale;
  }
  function enter(event: PointerEvent | FocusEvent): void {
    if (content && !pinned && event instanceof PointerEvent && event.target instanceof Node && popup?.contains(event.target)) return close();
    if (event.target instanceof Node && popup?.contains(event.target)) { clearTimeout(leaveTimer); return; }
    if (pinned) return;
    if (event instanceof FocusEvent && !keyboardInput) return;
    if (event instanceof PointerEvent && event.pointerType !== "mouse") return;
    if (event instanceof PointerEvent && event.buttons) return close();
    const element = hintTarget(event);
    if (!element || element === target) return;
    close();
    target = element;
    timer = setTimeout(() => void show(element), 150);
  }
  function leave(event: PointerEvent | FocusEvent): void {
    titles.setSource(event instanceof PointerEvent ? "pointer" : "focus", event.relatedTarget instanceof Element ? event.relatedTarget : null);
    if (pinned || touch) return;
    if (event.relatedTarget instanceof Node && target?.contains(event.relatedTarget)) return;
    if (content && event instanceof PointerEvent) return close();
    if (event.relatedTarget instanceof Node && popup?.contains(event.relatedTarget)) return;
    if (command || content) { clearTimeout(leaveTimer); leaveTimer = setTimeout(close, 180); }
    else close();
  }
  function hintTarget(event: MouseEvent | FocusEvent): HTMLElement | null {
    const source = event.target;
    titles.setSource(event instanceof FocusEvent ? "focus" : "pointer", source instanceof Element ? source : null);
    if (!(source instanceof Element) || source.closest("iframe, object, embed, [data-tooltip-disabled]")) return null;
    let element = source.closest<HTMLElement>("[title], [data-tooltip], [data-shortcut-command], button[aria-label], [data-tooltip-proxy]");
    if (element?.hasAttribute("data-tooltip-proxy")) {
      if (!(event instanceof MouseEvent)) return null;
      element = [...element.querySelectorAll<HTMLButtonElement>("button:disabled")].find(button => {
        const bounds = button.getBoundingClientRect();
        return event.clientX >= bounds.left && event.clientX < bounds.right && event.clientY >= bounds.top && event.clientY < bounds.bottom;
      }) ?? null;
    }
    return element;
  }
  async function assign(shortcuts: KeyboardShortcut[]): Promise<void> {
    if (!command || saving || !ready) return;
    const assignedCommand = command;
    const assignedGeneration = generation;
    saving = true;
    error = "";
    try {
      const conflict = validate(assignedCommand, shortcuts);
      if (conflict) throw new Error(conflict);
      if (bindings[assignedCommand].map(shortcutSignature).join("|") !== shortcuts.map(shortcutSignature).join("|")) await onAssign(assignedCommand, shortcuts);
      if (generation === assignedGeneration) cancelRecording();
    }
    catch (saveError) { if (generation === assignedGeneration) error = saveError instanceof Error ? saveError.message : String(saveError); }
    finally {
      saving = false;
      await tick();
      if (generation === assignedGeneration && (document.activeElement === document.body || document.activeElement === popup)) (recorder?.isConnected ? recorder : addRecorder)?.focus();
    }
  }
  function startRecording(event: MouseEvent, index: number | null): void {
    pinned = true;
    recording = true;
    editingIndex = index;
    recorder = event.currentTarget as HTMLButtonElement;
    draft = null;
    draftKey = "";
    error = "";
  }
  function cancelRecording(): void { recording = false; editingIndex = null; draft = null; draftKey = ""; error = ""; }
  function draftBindings(): KeyboardShortcut[] {
    if (!command || !draft) return [];
    const current = bindings[command] ?? [];
    const next = editingIndex === null ? [...current, draft] : current.map((shortcut, idx) => idx === editingIndex ? draft! : shortcut);
    return next.filter((shortcut, idx) => next.findIndex(candidate => shortcutSignature(candidate) === shortcutSignature(shortcut)) === idx);
  }
  function record(event: KeyboardEvent): void {
    if (!recording) return;
    if (event.key === "Tab") { cancelRecording(); return; }
    event.preventDefault();
    event.stopPropagation();
    if (event.key === "Escape") { cancelRecording(); return; }
    if (saving || event.repeat || event.isComposing) return;
    const shortcut = shortcutFromEvent(event);
    if (shortcut && command) { draft = shortcut; draftKey = event.code || event.key; error = validate(command, draftBindings()); }
  }
  function releaseShortcut(event: KeyboardEvent): void {
    if (!recording || !draft || saving || event.isComposing || (event.code || event.key) !== draftKey) return;
    event.preventDefault();
    event.stopPropagation();
    draftKey = "";
    if (!error) void assign(draftBindings());
  }
  $effect(() => {
    if (!popup || !text) return;
    let frame = 0;
    const observer = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(place); });
    observer.observe(popup);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  });
  onMount(() => {
    const titleObserver = new MutationObserver(() => {
      titles.refresh();
      if (target && !target.isConnected) close();
    });
    titleObserver.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["title"] });
    const blur = () => { close(); titles.clear(); };
    const keyboard = (event: KeyboardEvent) => {
      keyboardInput = true;
      heldClick = null;
      if (pinned && target?.hasAttribute("data-tooltip-toggle")) {
        if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); return; }
        if ((event.key === "Enter" || event.key === " ") && event.target === target) return;
      }
      if (event.target instanceof Node && popup?.contains(event.target)) {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          if (recording) cancelRecording();
          else { const origin = target; close(); keyboardInput = false; origin?.focus(); }
        }
        return;
      }
      close();
    };
    const pointer = (event: PointerEvent) => {
      keyboardInput = false;
      heldClick = null;
      if (event.target instanceof Node && popup?.contains(event.target)) { pinned = true; clearTimeout(leaveTimer); return; }
      if (pinned && target?.hasAttribute("data-tooltip-toggle") && event.target instanceof Node && target.contains(event.target)) return;
      close();
      if (event.pointerType === "mouse" || event.button !== 0 || !event.isPrimary) return;
      if (event.target instanceof Element && event.target.closest("[data-hold-context]")) return;
      const element = hintTarget(event);
      if (!element) return;
      target = element;
      touch = { id: event.pointerId, startX: event.clientX, startY: event.clientY, element, shown: false };
      timer = setTimeout(() => {
        if (!touch || touch.id !== event.pointerId) return;
        touch.shown = true;
        pinned = true;
        holdPoint = { x: touch.startX, y: touch.startY };
        void show(element);
      }, 500);
    };
    const move = (event: PointerEvent) => { if (touch && event.pointerId === touch.id && Math.hypot(event.clientX - touch.startX, event.clientY - touch.startY) > 10) close(); };
    const release = (event: PointerEvent) => {
      if (!touch || event.pointerId !== touch.id) return;
      clearTimeout(timer);
      if (touch.shown) {
        heldClick = { element: touch.element, until: Date.now() + 1000 };
        event.preventDefault();
        event.stopImmediatePropagation();
        touch = null;
      } else close();
    };
    const click = (event: MouseEvent) => {
      if (heldClick && Date.now() < heldClick.until && event.target instanceof Node && heldClick.element.contains(event.target)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        heldClick = null;
        return;
      }
      const element = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-tooltip-toggle]") : null;
      if (!element) return;
      const wasPinned = pinned && target === element;
      close();
      if (wasPinned) return;
      target = element;
      pinned = true;
      void show(element);
    };
    const scroll = (event: Event) => { if ((pinned || content) && event.target instanceof Node && popup?.contains(event.target)) return; close(); };
    const context = (event: MouseEvent) => { if (touch && hintTarget(event) === touch.element) event.preventDefault(); };
    const enterUntracked = (event: PointerEvent | FocusEvent) => untrack(() => enter(event));
    const leaveUntracked = (event: PointerEvent | FocusEvent) => untrack(() => leave(event));
    document.addEventListener("pointerover", enterUntracked, true);
    document.addEventListener("pointerout", leaveUntracked, true);
    document.addEventListener("focusin", enterUntracked, true);
    document.addEventListener("focusout", leaveUntracked, true);
    document.addEventListener("pointerdown", pointer, true);
    document.addEventListener("pointermove", move, true);
    document.addEventListener("pointerup", release, true);
    document.addEventListener("pointercancel", close, true);
    document.addEventListener("click", click, true);
    document.addEventListener("contextmenu", context, true);
    document.addEventListener("scroll", scroll, true);
    window.addEventListener("keydown", keyboard, true);
    window.addEventListener("blur", blur);
    window.addEventListener("resize", close);
    return () => {
      close();
      titleObserver.disconnect();
      titles.clear();
      document.removeEventListener("pointerover", enterUntracked, true);
      document.removeEventListener("pointerout", leaveUntracked, true);
      document.removeEventListener("focusin", enterUntracked, true);
      document.removeEventListener("focusout", leaveUntracked, true);
      document.removeEventListener("pointerdown", pointer, true);
      document.removeEventListener("pointermove", move, true);
      document.removeEventListener("pointerup", release, true);
      document.removeEventListener("pointercancel", close, true);
      document.removeEventListener("click", click, true);
      document.removeEventListener("contextmenu", context, true);
      document.removeEventListener("scroll", scroll, true);
      window.removeEventListener("keydown", keyboard, true);
      window.removeEventListener("blur", blur);
      window.removeEventListener("resize", close);
    };
  });
</script>

{#if text}
  {#if command}
    <Popover id={tooltipId} class="ui-tooltip ui-command-tooltip" aria-label={text} autoFocus={false} style={`left:${left}px;top:${top}px`} onClose={close} onFocusReturn={() => {}}>
      <span class="tooltip-caption">{text}</span>
      <div class="tooltip-shortcut-controls">
        <button
          bind:this={addRecorder}
          class="ui-button tooltip-shortcut"
          type="button"
          aria-label={message(recording && editingIndex === null ? "Press shortcut..." : "Add shortcut")}
          aria-pressed={recording && editingIndex === null}
          disabled={saving || !ready || (bindings[command]?.length ?? 0) >= 8}
          onclick={event => startRecording(event, null)}
          onkeydown={record}
          onkeyup={releaseShortcut}>
          {#if recording && editingIndex === null && draft}
            <ShortcutHint bindings={[draft]} tone="red" />
          {:else if recording && editingIndex === null}
            <span class="tooltip-keycap">
              <Keycap text={message("Press shortcut...")} tone="red" pulsing={true} />
            </span>
          {:else}
            <span class="tooltip-keycap">
              <Keycap text={bindings[command]?.length ? "+" : message("+ hotkey")} tone="gray" />
            </span>
          {/if}
        </button>
        {#each bindings[command] as binding, idx}
          {#if idx}
            <span class="tooltip-shortcut-separator" aria-hidden="true">/</span>
          {/if}
          <button
            class="ui-button tooltip-shortcut"
            type="button"
            aria-label={message(recording && editingIndex === idx ? "Press shortcut..." : "Edit shortcut {shortcut}", { shortcut: formatShortcut(binding) })}
            aria-pressed={recording && editingIndex === idx}
            disabled={saving || !ready}
            onclick={event => startRecording(event, idx)}
            onkeydown={record}
            onkeyup={releaseShortcut}>
            {#if recording && editingIndex === idx}
              {#if draft}
                <ShortcutHint bindings={[draft]} tone="red" />
              {:else}
                <span class="tooltip-keycap">
                  <Keycap text={message("Press shortcut...")} tone="red" pulsing={true} />
                </span>
              {/if}
            {:else}
              <ShortcutHint bindings={[binding]} />
            {/if}
          </button>
        {/each}
        {#if bindings[command].length}
          <Button class="tooltip-shortcut-action" aria-label={message("Clear shortcuts")} disabled={saving || !ready} onclick={() => void assign([])}>
            {message("Clear")}
          </Button>
        {/if}
        {#if hasDefaultChanges}
          <Button class="tooltip-shortcut-action" aria-label={message("Reset shortcuts to default")} disabled={saving || !ready} onclick={() => { if (command) void assign(defaults[command].map(shortcut => ({ ...shortcut }))); }}>
            {message("Default")}
          </Button>
        {/if}
      </div>
      {#if error}
        <small class="tooltip-error" role="alert">{error}</small>
      {/if}
    </Popover>
  {:else}
    <div bind:this={popup} id={tooltipId} class="ui-tooltip" class:tooltip-formatted={content} role="tooltip" style:left={`${left}px`} style:top={`${top}px`}>
      {#if content}
        {@render content()}
      {:else}
        <span class="tooltip-text">{text}</span>
      {/if}
    </div>
  {/if}
{/if}

<style>
  :global(.ui-tooltip) { position: fixed; z-index: 4000; display: flex; align-items: center; flex-wrap: wrap; gap: 6px; max-width: min(280px, calc(100vw - 16px)); max-height: calc(100vh - 16px); overflow: auto; padding: 6px 8px; border: 0; border-radius: var(--ui-corner-radius, 6px); color: var(--theme-workbench-foreground); background: var(--theme-workbench-raised); box-shadow: var(--ui-popup-shadow); font-size: var(--ui-font-small); line-height: 1.35; pointer-events: none; overflow-wrap: anywhere; }
  :global(.ui-command-tooltip) { display: grid; grid-template-columns: minmax(0, 1fr); align-items: start; pointer-events: auto; }
  .tooltip-formatted { display: block; padding: 9px 10px; overscroll-behavior: contain; pointer-events: auto; }
  .tooltip-text { white-space: pre-line; }
  :global(.tooltip-caption) { flex: 1; min-width: 0; }
  :global(.tooltip-shortcut-controls) { display: flex; align-items: center; flex-wrap: wrap; gap: 3px; min-width: 0; max-width: 100%; }
  :global(.ui-tooltip .tooltip-shortcut.ui-button.ui-button) { min-width: 0; max-width: 100%; height: auto; min-height: 23px; padding: 0; background: transparent; font-size: var(--ui-font-small); text-align: left; }
  :global(.ui-command-tooltip .shortcut-hint) { max-width: 100%; row-gap: 8px; }
  :global(.ui-command-tooltip .shortcut-chord) { flex-wrap: wrap; max-width: 100%; row-gap: 7px; }
  :global(.ui-tooltip .tooltip-shortcut-action.ui-button) { min-width: 0; min-height: 23px; padding: 2px 6px; font-size: var(--ui-font-small); }
  :global(.tooltip-shortcut-separator) { color: var(--theme-workbench-muted); }
  :global(.tooltip-keycap) { display: inline-flex; padding-bottom: 4px; }
  :global(.ui-tooltip .tooltip-error) { flex-basis: 100%; color: var(--delete); }
</style>
