<script lang="ts">
  const roles = ["background", "control", "control-hover", "field", "popup", "text", "muted", "accent", "on-accent", "focus", "selection", "on-selection"];
</script>

<details><summary>Resolved shared color roles</summary>
  <dl>{#each roles as role}<div><dt>{role}</dt><dd><span class="swatch" aria-hidden="true" style:background={`var(--karatala-color-${role})`}></span><code>--karatala-color-{role}</code></dd></div>{/each}</dl>
</details>

<style>
  details { margin-top: 18px; font: inherit; }
  dl { display: grid; gap: 8px; }
  dl > div { display: grid; grid-template-columns: 100px minmax(0, 1fr); gap: 8px; }
  dd { display: flex; align-items: center; gap: 8px; margin: 0; min-width: 0; }
  .swatch { display: inline-block; width: 18px; height: 18px; flex-shrink: 0; border-radius: 3px; }
  code { overflow-wrap: anywhere; font-size: 11px; }
</style>
