<script lang="ts">
  import UiIcon from "./UiIcon.svelte";
  let { text, path, tone = "light", pulsing = false }: { text: string; path?: string; tone?: "light" | "gray" | "red"; pulsing?: boolean } = $props();
</script>

<kbd class="ui-keycap" class:is-gray={tone === "gray"} class:is-red={tone === "red"} class:is-pulsing={pulsing} aria-label={path ? text : undefined}>
  {#if path}
    <UiIcon {path} size={14} />
  {:else}
    {text}
  {/if}
</kbd>

<style>
  .ui-keycap.ui-keycap { --keycap-surface: var(--ui-keycap-light-surface); --keycap-edge: var(--ui-keycap-light-edge); --keycap-text: var(--ui-keycap-light-text); display: inline-flex; box-sizing: border-box; align-items: center; justify-content: center; min-width: 18px; height: 19px; padding: 1px 4px; border: none; border-radius: 3px; color: var(--keycap-text); background: var(--keycap-surface); box-shadow: 0 4px 0 var(--keycap-edge), 0 5px 4px rgb(0 0 0 / 24%); font: 600 10px/1.2 Tahoma, "Segoe UI", sans-serif; text-shadow: none; }
  .ui-keycap.is-gray { --keycap-surface: var(--ui-keycap-gray-surface); --keycap-edge: var(--ui-keycap-gray-edge); --keycap-text: var(--ui-keycap-gray-text); }
  .ui-keycap.is-red { --keycap-surface: var(--ui-keycap-red-surface); --keycap-edge: var(--ui-keycap-red-edge); --keycap-text: var(--ui-keycap-red-text); }
  .is-pulsing { animation: keycap-press 3.6s ease-in-out infinite; }
  @keyframes keycap-press {
    0%, 12%, 24%, 100% { transform: translateY(0); box-shadow: 0 4px 0 var(--keycap-edge), 0 5px 4px rgb(0 0 0 / 24%); }
    6%, 18% { transform: translateY(3px); box-shadow: 0 1px 0 var(--keycap-edge), 0 2px 2px rgb(0 0 0 / 24%); }
  }
  @media (prefers-reduced-motion: reduce) { .is-pulsing { animation: none; } }
</style>
