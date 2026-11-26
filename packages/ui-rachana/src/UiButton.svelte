<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import UiIcon from "./UiIcon.svelte";
  import { releasePointerFocus } from "@karatala/dom-input";

  type Props = {
    label: string;
    title?: string;
    path?: string;
    iconUrl?: string;
    text?: string;
    active?: boolean | "mixed";
    disabled?: boolean;
    toolbar?: boolean;
    filled?: boolean;
    variant?: "control" | "icon" | "text";
    tone?: "default" | "primary" | "danger" | "close";
    shape?: "circle" | "rounded";
    class?: string;
    type?: "button" | "reset" | "submit";
    onclick?: (event: MouseEvent) => void;
    onpointerup?: (event: PointerEvent & { currentTarget: HTMLButtonElement }) => void;
    children?: Snippet;
  } & Omit<HTMLButtonAttributes, "aria-label" | "aria-pressed" | "children" | "class" | "disabled" | "onclick" | "onpointerup" | "title" | "type">;
  let {
    label,
    title,
    path,
    iconUrl,
    text,
    active,
    disabled = false,
    toolbar = false,
    filled,
    variant = "control",
    tone = "default",
    shape = "rounded",
    class: className = "",
    type = "button",
    onclick,
    onpointerup,
    children,
    ...buttonProps
  }: Props = $props();
  const tooltip = $derived((title ?? label).trim() === text?.trim() ? undefined : title ?? label);
  const hasCaption = $derived(variant !== "icon" && !!(text || children && !path && !iconUrl));
  const hasFill = $derived(filled ?? (hasCaption || tone !== "default"));
  const classes = $derived(`ui-button is-${variant} is-${tone} is-${shape} ${hasFill ? "is-filled" : ""} ${className}`);
  function pointerUp(event: PointerEvent & { currentTarget: HTMLButtonElement }) {
    onpointerup?.(event);
    releasePointerFocus(event);
  }
</script>

{#snippet content()}
  {#if iconUrl || path}
    <UiIcon {path} src={iconUrl} size={iconUrl ? 26 : variant === "icon" ? 16 : 18} />
  {/if}
  {#if text}<span>{text}</span>{/if}
  {#if children}{@render children()}{/if}
{/snippet}

<button {...buttonProps} {type} class={classes} {disabled} aria-label={label} aria-pressed={active} data-toolbar-item={toolbar || undefined} data-ui-tooltip={tooltip} {onclick} onpointerup={pointerUp}>
  {@render content()}
</button>
