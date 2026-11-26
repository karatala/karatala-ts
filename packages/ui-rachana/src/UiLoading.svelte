<script lang="ts">
  let { label, class: className = "" }: { label: string; class?: string } = $props();
</script>

<div class="ui-loading {className}" role="status" aria-label={label} aria-busy="true">
  <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="56 20" />
  </svg>
</div>

<style>
  .ui-loading { display: grid; place-items: center; min-height: 64px; height: 100%; min-width: 0; color: var(--ui-accent-fill, currentColor); }
  svg { animation: loading-spin 800ms linear infinite; }
  @keyframes loading-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { svg { animation: none; } }
</style>
