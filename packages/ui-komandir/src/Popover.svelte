<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { registerOverlay, returnFocus } from "./overlay-focus.ts";

  interface Props extends Pick<HTMLAttributes<HTMLDivElement>, "class" | "style" | "tabindex" | "aria-label" | "aria-labelledby" | "aria-busy" | "onpointerdown" | "oncontextmenu"> {
    id?: string;
    children: Snippet;
    onClose(): void;
    onFocusReturn(): void;
    autoFocus?: boolean;
  }

  let { children, onClose, onFocusReturn, autoFocus = true, ...attributes }: Props = $props();
  let content = $state<HTMLDivElement | null>(null);

  onMount(() => {
    const dispose = registerOverlay(content!, () => onClose());
    if (autoFocus) content?.focus({ preventScroll: true });
    return () => { dispose(); returnFocus(onFocusReturn); };
  });
</script>

<div {...attributes} bind:this={content} role="dialog" tabindex={attributes.tabindex ?? -1}>
  {@render children()}
</div>
