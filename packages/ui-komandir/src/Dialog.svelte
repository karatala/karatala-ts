<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { containModalTab, focusableElements, registerOverlay, returnFocus } from "./overlay-focus.ts";
  import { popupContains } from "./portal.ts";

  interface Props extends Pick<HTMLAttributes<HTMLDivElement>, "class" | "style" | "aria-label" | "aria-labelledby" | "onmousedown"> {
    children: Snippet;
    onClose(): void;
    initialFocus?: string;
    interactiveBackground?: boolean;
    onFocusReturn(): void;
  }

  let { children, onClose, initialFocus, interactiveBackground = false, onFocusReturn, ...attributes }: Props = $props();
  let content = $state<HTMLDivElement | null>(null);

  onMount(() => {
    const root = content!;
    const dispose = registerOverlay(root, () => onClose());
    if (initialFocus || !popupContains(root, document.activeElement ?? document.body)) (initialFocus ? root.querySelector<HTMLElement>(initialFocus) ?? root : focusableElements(root)[0] ?? root).focus({ preventScroll: true });
    return () => { dispose(); returnFocus(onFocusReturn); };
  });
  $effect(() => {
    if (content && !interactiveBackground) return containModalTab(content);
  });
</script>

<div {...attributes} bind:this={content} role="dialog" tabindex={-1} aria-modal={interactiveBackground ? undefined : "true"} data-interactive-background={interactiveBackground ? "" : undefined}>
  {@render children()}
</div>
