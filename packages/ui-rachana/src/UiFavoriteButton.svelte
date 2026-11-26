<script lang="ts">
  import UiButton from "./UiButton.svelte";
  import UiIcon from "./UiIcon.svelte";
  import { uiIcons } from "./icons";
  let { active, label, onclick }: { active: boolean; label: string; onclick: () => void } = $props();
</script>

<span class="favorite-slot" class:is-favorite={active}>
  <UiButton variant="icon" {label} {active} {onclick}>
    <UiIcon path={uiIcons.star} size={active ? 18 : 13} />
  </UiButton>
</span>

<style>
  .favorite-slot { display: flex; flex: 0 0 24px; width: 24px; opacity: 0; }
  .favorite-slot.is-favorite, .favorite-slot:focus-within, :global([data-favorite-item]:is(:hover:where([data-ui-hover="true"] *), :focus-within, .is-selected)) .favorite-slot { opacity: 1; }
  .favorite-slot :global(button.ui-button.is-icon) { display: flex; align-items: center; justify-content: center; width: 24px; min-width: 24px; height: 22px; padding: 0; color: var(--ui-text-muted); background: transparent; text-shadow: none; }
  .favorite-slot:not(.is-favorite) :global(svg) { fill: none; stroke: currentColor; stroke-width: 1.7; }
  .favorite-slot.is-favorite :global(button.ui-button.is-icon), .favorite-slot :global(button.ui-button.is-icon:hover:where([data-ui-hover="true"] *)), .favorite-slot :global(button.ui-button.is-icon:focus-visible) { color: var(--ui-favorite); background: transparent; }
</style>
