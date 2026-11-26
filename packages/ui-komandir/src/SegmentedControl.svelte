<script module lang="ts">
  import type { IconName } from "./host";
  export interface SegmentOption<Value extends string = string> { value: Value; label: string; icon?: IconName; text?: string; disabled?: boolean }
</script>

<script lang="ts" generics="Value extends string">
  import Button from "./Button.svelte";
  import Icon from "./Icon.svelte";
  let { label, value, options, disabled = false, onChange }: { label: string; value: Value; options: SegmentOption<Value>[]; disabled?: boolean; onChange(value: Value): void } = $props();
  let tabValue = $derived(options.find(option => option.value === value && !option.disabled)?.value ?? options.find(option => !option.disabled)?.value);
  function navigate(event: KeyboardEvent, current: Value): void {
    if (event.altKey || event.ctrlKey || event.metaKey || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const button = event.currentTarget as HTMLButtonElement;
    if (button.matches(":disabled")) return;
    const enabled = options.filter(option => !option.disabled);
    const position = enabled.findIndex(option => option.value === current);
    const next = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1 : (position + (event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1) + enabled.length) % enabled.length;
    event.preventDefault();
    event.stopPropagation();
    button.parentElement?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")[next]?.focus();
    if (enabled[next]) onChange(enabled[next].value);
  }
</script>

<div class="ui-segmented ui-choice" role="radiogroup" aria-label={label} aria-disabled={disabled}>
  {#each options as option (option.value)}
    <Button
      class={option.icon && option.text === undefined ? "ui-icon-button" : ""}
      role="radio"
      aria-checked={value === option.value}
      aria-label={option.label}
      title={option.label}
      data-tooltip-always
      tabindex={option.value === tabValue ? 0 : -1}
      disabled={disabled || option.disabled}
      onclick={() => onChange(option.value)}
      onkeydown={event => navigate(event, option.value)}>
      {#if option.icon}
        <Icon name={option.icon} size={16} />
      {/if}
      {#if option.text !== undefined || !option.icon}
        <span>{option.text ?? option.label}</span>
      {/if}
    </Button>
  {/each}
</div>
