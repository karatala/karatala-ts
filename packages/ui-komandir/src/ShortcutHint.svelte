<script lang="ts">
  import { formatShortcut, type KeyboardShortcut } from "./shortcut-codec.ts";
  import Keycap from "./Keycap.svelte";
  let { bindings, tone = "light" }: { bindings: KeyboardShortcut[]; tone?: "light" | "red" } = $props();
  const names: Record<string, string> = { ArrowLeft: "←", ArrowRight: "→", ArrowUp: "↑", ArrowDown: "↓", Escape: "Esc", Backspace: "⌫", Delete: "Del", Insert: "Ins", PageUp: "PgUp", PageDown: "PgDn", Enter: "Enter", Home: "Home", End: "End", Tab: "Tab" };
  function keys(binding: KeyboardShortcut): string[] {
    return [...(binding.ctrl ? ["Ctrl"] : []), ...(binding.alt ? ["Alt"] : []), ...(binding.shift ? ["Shift"] : []), ...(binding.meta ? ["Meta"] : []), names[binding.key] ?? formatShortcut({ key: binding.key, code: binding.code })];
  }
</script>

<span class="shortcut-hint" aria-label={bindings.map(formatShortcut).join(" / ")}>
  {#each bindings as binding, idx}
    {#if idx}
      <span aria-hidden="true">/</span>
    {/if}
    <span class="shortcut-chord" aria-hidden="true">
      {#each keys(binding) as key, keyIndex}
        {#if keyIndex}
          <span class="shortcut-separator">+</span>
        {/if}
        <Keycap text={key} {tone} />
      {/each}
    </span>
  {/each}
</span>

<style>
  .shortcut-hint { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 5px; padding-bottom: 4px; font-size: var(--ui-font-small); }
  .shortcut-chord { display: inline-flex; align-items: center; gap: 2px; white-space: nowrap; }
  .shortcut-separator { color: var(--theme-workbench-muted); }
</style>
