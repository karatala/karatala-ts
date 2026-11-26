<script lang="ts">
  import type { Snippet } from "svelte";
  import UiComboButton from "./UiComboButton.svelte";
  let { label, value = $bindable(), disabled = false, toolbar = false, class: className = "", onchange, children }: {
    label: string;
    value: string | number | boolean;
    disabled?: boolean;
    toolbar?: boolean;
    class?: string;
    onchange?: (event: Event & { currentTarget: HTMLSelectElement }) => void;
    children: Snippet;
  } = $props();
  let select: HTMLSelectElement;
  let options = $state<{ value: string; label: string; disabled: boolean }[]>([]);
  function optionSource(node: HTMLSelectElement) {
    const read = () => { options = Array.from(node.options, option => ({ value: option.value, label: option.label, disabled: option.disabled || option.parentElement instanceof HTMLOptGroupElement && option.parentElement.disabled })); };
    read();
    const observer = new MutationObserver(read);
    observer.observe(node, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["value", "label", "disabled"] });
    return { destroy: () => observer.disconnect() };
  }
  function choose(nextValue: string) {
    if (disabled || nextValue === String(value ?? "")) return;
    select.value = nextValue;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }
</script>

<span class={`ui-select ${className}`} class:is-disabled={disabled} class:is-toolbar={toolbar}>
  <UiComboButton class="ui-select-control" {label} value={String(value ?? "")} {options} {disabled} {toolbar} menuStyle="list" triggerRole="combobox" onchange={choose} />
  <select bind:this={select} bind:value {disabled} {onchange} use:optionSource aria-label={label} aria-hidden="true" tabindex="-1" hidden style="display: none">{@render children()}</select>
</span>

<style>
  .ui-select { display: grid; width: 100%; min-width: 0; color: var(--ui-text); }
  .ui-select :global(.ui-combo-button) { min-width: 0; width: 100%; }
  .ui-select :global(.ui-combo-button.ui-select-control .ui-combo-trigger.ui-button) { box-sizing: border-box; justify-content: flex-start; width: 100%; min-width: 0; height: var(--ui-tab-button-height, 26px); min-height: var(--ui-tab-button-height, 26px); padding: 3px 7px; border: none; border-radius: 4px; background: var(--ui-field-surface, var(--ui-control-surface)); color: var(--ui-text); font: inherit; text-align: start; }
  .ui-select :global(.ui-combo-trigger > span:first-child) { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ui-select.is-toolbar :global(.ui-combo-button.ui-select-control .ui-combo-trigger.ui-button) { background: var(--ui-segment-surface); }
</style>
