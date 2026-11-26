<script lang="ts">
  import UiKeycap from "./UiKeycap.svelte";
  import { uiIcons } from "./icons";
  let { value }: { value: string } = $props();
  const groups = $derived(value.split(" | ").filter(Boolean).map(group => {
    const separator = group.indexOf(": ");
    return { label: separator < 0 ? "" : group.slice(0, separator), alternatives: (separator < 0 ? group : group.slice(separator + 2)).split(" / ").map(binding => binding.split("+")) };
  }));
  const keyNames: Record<string, string> = { Left: "←", Right: "→", Up: "↑", Down: "↓", Space: "Space", Escape: "Esc", Backspace: "⌫", Delete: "Del", Insert: "Ins", Minus: "−", Equal: "=", Period: ".", Comma: ",", NumpadAdd: "Num +", NumpadSubtract: "Num −", NumpadDecimal: "Num ." };
  const keyIcons: Record<string, string> = { Left: uiIcons.arrowLeftBold, Right: uiIcons.arrowRightBold, Up: uiIcons.arrowUpBold, Down: uiIcons.arrowDownBold };
</script>

<span class="shortcut-hint" aria-label={value}>
  {#each groups as group}
    <span class="shortcut-group" aria-hidden="true">
      {#if group.label}<span class="shortcut-label">{group.label}</span>{/if}
      <span class="shortcut-alternatives">
        {#each group.alternatives as keys, idx}
          {#if idx}<span class="shortcut-separator">/</span>{/if}
          <span class="shortcut-chord">
            {#each keys as key, idx}
              {#if idx}<span class="shortcut-separator">+</span>{/if}
              <UiKeycap text={keyNames[key] ?? key.replace(/^Numpad/, "Num ")} path={keyIcons[key]} />
            {/each}
          </span>
        {/each}
      </span>
    </span>
  {/each}
</span>

<style>
  .shortcut-hint { display: grid; gap: 6px; min-width: 0; max-width: 100%; padding-bottom: 4px; }
  .shortcut-group { display: grid; gap: 3px; min-width: 0; }
  .shortcut-label { color: var(--ui-text-muted); font-size: 11px; line-height: 1.35; }
  .shortcut-alternatives { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 5px; }
  .shortcut-chord { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 2px; max-width: 100%; row-gap: 7px; }
  .shortcut-separator { color: var(--ui-text-muted); font-size: 10px; }
</style>
