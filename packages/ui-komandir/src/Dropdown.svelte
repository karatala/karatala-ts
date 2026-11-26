<script lang="ts" generics="Value extends string">
  import { onMount, tick } from "svelte";
  import Button from "./Button.svelte";
  import Icon from "./Icon.svelte";
  import Portal from "./Portal.svelte";
  import { registerOverlay } from "./overlay-focus.ts";
  import { popupContains } from "./portal.ts";
  import "./controls.css";

  let { label, value, options, disabled = false, placeholder = "", onChange }: {
    label: string;
    value: Value | "";
    options: readonly { value: Value; label: string; disabled?: boolean }[];
    disabled?: boolean;
    placeholder?: string;
    onChange(value: Value): void;
  } = $props();
  const dropdownId = $props.id();
  let trigger = $state<HTMLButtonElement | null>(null);
  let listbox = $state<HTMLDivElement | null>(null);
  let expanded = $state(false);
  let activeIndex = $state(-1);
  let selected = $derived(options.find(option => option.value === value));
  let pointerOrigin: HTMLElement | null = null;
  let pointerOpened = false;
  let focusFrame = 0;
  let searchText = "";
  let searchedAt = 0;

  function close(pointer = false): void {
    expanded = false;
    searchText = "";
    pointerOpened = false;
    if (!pointer || !trigger) return;
    const button = trigger;
    const origin = pointerOrigin;
    cancelAnimationFrame(focusFrame);
    focusFrame = requestAnimationFrame(() => {
      if (expanded || document.activeElement !== button && document.activeElement !== document.body) return;
      if (origin?.isConnected && origin !== button && origin !== document.body) origin.focus({ preventScroll: true });
      if (document.activeElement === button) button.blur();
    });
  }
  function show(last = false, pointer = false): void {
    if (disabled || !options.length) return;
    cancelAnimationFrame(focusFrame);
    const selectedIndex = options.findIndex(option => option.value === value && !option.disabled);
    activeIndex = selectedIndex >= 0 ? selectedIndex : last ? options.findLastIndex(option => !option.disabled) : options.findIndex(option => !option.disabled);
    searchText = "";
    pointerOpened = pointer;
    expanded = true;
    trigger?.focus({ preventScroll: true });
  }
  function choose(idx: number, pointer = false): void {
    const option = options[idx];
    if (!option || option.disabled) return;
    close(pointer);
    onChange(option.value);
  }
  function navigate(event: KeyboardEvent): void {
    if (event.key === "Escape" && expanded && !event.isComposing) {
      event.preventDefault();
      event.stopPropagation();
      close(pointerOpened);
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    if (performance.now() - searchedAt >= 700) searchText = "";
    if (event.key === "Tab") { close(); return; }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      if (!expanded) {
        show(event.key === "ArrowUp");
        if (event.key === "Home") activeIndex = options.findIndex(option => !option.disabled);
        else if (event.key === "End") activeIndex = options.findLastIndex(option => !option.disabled);
        return;
      }
      const enabled = options.map((option, idx) => option.disabled ? -1 : idx).filter(idx => idx >= 0);
      const direction = event.key === "ArrowUp" ? -1 : 1;
      const current = Math.max(enabled.indexOf(activeIndex), direction < 0 ? 0 : -1);
      activeIndex = event.key === "Home" ? enabled[0] ?? -1 : event.key === "End" ? enabled.at(-1) ?? -1 : enabled[(current + direction + enabled.length) % enabled.length] ?? -1;
      return;
    }
    if (event.key === "Enter" || event.key === " " && !searchText) {
      event.preventDefault();
      event.stopPropagation();
      if (expanded) choose(activeIndex);
      else show();
      return;
    }
    if (event.key.length !== 1) return;
    event.preventDefault();
    event.stopPropagation();
    if (!expanded) show();
    const now = performance.now();
    searchText = `${now - searchedAt < 700 ? searchText : ""}${event.key.toLocaleLowerCase()}`;
    searchedAt = now;
    const query = [...searchText].every(character => character === searchText[0]) ? searchText.charAt(0) : searchText;
    const start = query.length === 1 ? activeIndex + 1 : Math.max(0, activeIndex);
    for (let offset = 0; offset < options.length; offset += 1) {
      const idx = (start + offset) % options.length;
      const option = options[idx];
      if (option && !option.disabled && option.label.toLocaleLowerCase().startsWith(query)) { activeIndex = idx; break; }
    }
  }
  function scrollActive(): void {
    const option = document.getElementById(`${dropdownId}-option-${activeIndex}`);
    if (!listbox || !option) return;
    if (option.offsetTop < listbox.scrollTop) listbox.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > listbox.scrollTop + listbox.clientHeight) listbox.scrollTop = option.offsetTop + option.offsetHeight - listbox.clientHeight;
  }
  $effect(() => {
    const activeOption = options[activeIndex];
    if (disabled || !options.length) expanded = false;
    else if (expanded && (!activeOption || activeOption.disabled)) activeIndex = options.findIndex(option => !option.disabled);
  });
  $effect(() => {
    if (!expanded || !listbox || !trigger) return;
    const surface = listbox;
    const button = trigger;
    const place = () => {
      if (!button.isConnected) { close(); return; }
      const scale = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
      const viewport = window.visualViewport;
      const boundary = button.closest<HTMLElement>('[role="dialog"]')?.getBoundingClientRect();
      const leftEdge = Math.max(viewport?.offsetLeft ?? 0, boundary?.left ?? 0) + 6;
      const topEdge = Math.max(viewport?.offsetTop ?? 0, boundary?.top ?? 0) + 6;
      const rightEdge = Math.min((viewport?.offsetLeft ?? 0) + (viewport?.width ?? innerWidth), boundary?.right ?? Infinity) - 6;
      const bottomEdge = Math.min((viewport?.offsetTop ?? 0) + (viewport?.height ?? innerHeight), boundary?.bottom ?? Infinity) - 6;
      const bounds = button.getBoundingClientRect();
      const gap = 3 * scale;
      const below = Math.max(0, bottomEdge - bounds.bottom - gap);
      const above = Math.max(0, bounds.top - gap - topEdge);
      surface.style.setProperty("--ui-dropdown-anchor-width", `${Math.min(bounds.width, Math.max(0, rightEdge - leftEdge)) / scale}px`);
      surface.style.setProperty("--ui-dropdown-available-width", `${Math.max(0, rightEdge - leftEdge) / scale}px`);
      surface.style.setProperty("--ui-dropdown-available-height", `${Math.max(below, above) / scale}px`);
      const menu = surface.getBoundingClientRect();
      const openAbove = menu.height > below && above > below;
      surface.style.left = `${Math.max(leftEdge, Math.min(bounds.left, rightEdge - menu.width)) / scale}px`;
      surface.style.top = `${Math.max(topEdge, Math.min(openAbove ? bounds.top - gap - menu.height : bounds.bottom + gap, bottomEdge - menu.height)) / scale}px`;
      surface.style.visibility = "visible";
    };
    const unregister = registerOverlay(surface, () => close(pointerOpened));
    const observer = new ResizeObserver(place);
    observer.observe(surface);
    observer.observe(button);
    const frame = requestAnimationFrame(() => { place(); scrollActive(); });
    const outside = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || button.contains(event.target) || popupContains(surface, event.target)) return;
      queueMicrotask(() => { if (!event.defaultPrevented && surface.isConnected) close(); });
    };
    const blur = () => close();
    const viewport = window.visualViewport;
    document.addEventListener("pointerdown", outside, true);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    window.addEventListener("blur", blur);
    viewport?.addEventListener("resize", place);
    viewport?.addEventListener("scroll", place);
    return () => {
      unregister();
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", outside, true);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      window.removeEventListener("blur", blur);
      viewport?.removeEventListener("resize", place);
      viewport?.removeEventListener("scroll", place);
    };
  });
  $effect(() => { if (expanded && listbox) { activeIndex; void tick().then(() => { if (expanded) scrollActive(); }); } });
  onMount(() => () => cancelAnimationFrame(focusFrame));
</script>

<Button
  plain
  class="ui-dropdown"
  role="combobox"
  aria-label={label}
  aria-haspopup="listbox"
  aria-expanded={expanded}
  aria-controls={expanded ? `${dropdownId}-options` : undefined}
  aria-activedescendant={expanded && activeIndex >= 0 ? `${dropdownId}-option-${activeIndex}` : undefined}
  data-state={expanded ? "open" : "closed"}
  disabled={disabled || !options.length}
  onpointerdown={() => { if (!expanded) pointerOrigin = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
  onclick={event => { trigger = event.currentTarget; if (expanded) close(event.detail > 0); else show(false, event.detail > 0); }}
  onfocus={event => trigger = event.currentTarget}
  onblur={event => { if (!(event.relatedTarget instanceof Node) || !popupContains(listbox, event.relatedTarget)) close(); }}
  onkeydown={navigate}>
  <span>{selected?.label ?? placeholder}</span>
  <Icon name="sharedControls.dropdown" size={12} />
</Button>

{#if expanded}
  <Portal to="body">
    <div
      id={`${dropdownId}-options`}
      bind:this={listbox}
      class="ui-dropdown-options"
      role="listbox"
      aria-label={label}
      tabindex="-1"
      data-ui-overlay=""
      style="position:fixed;visibility:hidden"
      onpointerdown={event => event.preventDefault()}>
      {#each options as option, idx (option.value)}
        <div
          id={`${dropdownId}-option-${idx}`}
          role="option"
          tabindex="-1"
          aria-selected={option.value === value}
          aria-disabled={option.disabled || undefined}
          data-highlighted={activeIndex === idx ? "" : undefined}
          data-selected={option.value === value ? "" : undefined}
          data-disabled={option.disabled ? "" : undefined}
          onpointermove={event => { if (event.pointerType === "mouse" && !option.disabled) activeIndex = idx; }}
          onclick={event => choose(idx, event.detail > 0)}
          onkeydown={navigate}>
          <span>{option.label}</span>
          {#if option.value === value}
            <span aria-hidden="true">✓</span>
          {/if}
        </div>
      {/each}
    </div>
  </Portal>
{/if}
