<script lang="ts">
  import { useKomandirUiHost } from "./host";
  const { message } = useKomandirUiHost();
  import CheckMark from "./CheckMark.svelte";

  let { label, pressed, onclick }: { label: string; pressed: boolean; onclick(): void } = $props();
</script>

<button
  class="row-sweep-handle"
  type="button"
  data-sweep-handle
  data-hold-context
  aria-label={label}
  aria-pressed={pressed}
  data-tooltip={`${label}\n${message("Hold and drag to select rows")}`}
  oncontextmenu={event => { event.preventDefault(); event.stopPropagation(); }}
  onmousedown={event => event.stopPropagation()}
  ondblclick={event => event.stopPropagation()}
  {onclick}>
  <CheckMark checked={pressed} size={12} />
</button>

<style>
  .row-sweep-handle { display: inline-grid; flex: 0 0 16px; place-items: center; box-sizing: border-box; width: 16px; height: 16px; max-height: 100%; padding: 2px; border: 0; border-radius: 4px; color: var(--theme-workbench-muted); background: transparent; cursor: ns-resize; touch-action: none; user-select: none; }
</style>
