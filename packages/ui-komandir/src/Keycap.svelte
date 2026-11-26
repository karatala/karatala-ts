<script lang="ts">
  let { text, tone = "light", pulsing = false }: { text: string; tone?: "light" | "gray" | "red"; pulsing?: boolean } = $props();
</script>

<kbd class="ui-keycap" class:gray={tone === "gray"} class:red={tone === "red"} class:pulsing>{text}</kbd>

<style>
  .ui-keycap { --keycap-surface: var(--theme-workbench-foreground); --keycap-text: var(--theme-workbench-background); display: inline-flex; box-sizing: border-box; align-items: center; justify-content: center; min-width: 18px; height: 19px; padding: 1px 4px; border: 0; border-radius: 3px; color: var(--keycap-text); background: var(--keycap-surface); font: inherit; font-weight: var(--ui-weight-strong); text-shadow: none; }
  .gray { --keycap-surface: color-mix(in srgb, var(--theme-workbench-foreground) 72%, var(--theme-workbench-background)); }
  .red { --keycap-surface: var(--delete); --keycap-text: #fff; }
  .pulsing { animation: keycap-press 3.6s ease-in-out infinite; }
  @keyframes keycap-press {
    0%, 12%, 24%, 100% { transform: translateY(0); }
    6%, 18% { transform: translateY(3px); }
  }
  @media (prefers-reduced-motion: reduce) { .pulsing { animation: none; } }
</style>
