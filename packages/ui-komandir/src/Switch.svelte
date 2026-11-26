<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { tick } from "svelte";
  import "./switch.css";
  type Props = Omit<HTMLButtonAttributes, "type" | "role" | "aria-checked" | "onclick" | "children"> & { checked: boolean; label: string; description?: string; compact?: boolean; onChange(checked: boolean): void };
  let { checked, label, description, compact = false, class: className = "", title, onChange, ...attributes }: Props = $props();
  const controlId = $props.id();
</script>

<button
  {...attributes}
  type="button"
  role="switch"
  aria-checked={checked}
  aria-label={label}
  aria-describedby={description && !compact ? `${controlId}-description` : attributes["aria-describedby"]}
  title={title ?? (compact ? label : undefined)}
  class={`ui-switch ${compact ? "compact" : ""} ${className}`}
  onclick={event => {
    const button = event.currentTarget;
    const focused = document.activeElement === button;
    onChange(!checked);
    void tick().then(() => { if (focused && button.isConnected && document.activeElement === document.body) button.focus(); });
  }}>
  {#if !compact}
    <span class="ui-switch-copy">
      <span>{label}</span>
      {#if description}
        <small id={`${controlId}-description`}>{description}</small>
      {/if}
    </span>
  {/if}
  <span class="ui-switch-track" aria-hidden="true">
    <span></span>
  </span>
</button>
