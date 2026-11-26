<script lang="ts">
  import { iconSvgReferenceUrl } from "./icon-svg-reference.ts";

  let { url, viewBox, lazy = false, centerArtwork = false, onError }: { url: string; viewBox: string; lazy?: boolean; centerArtwork?: boolean; onError(): void } = $props();
  let visible = $state(false);
  let centeredViewBox = $state<string>();

  function observe(element: SVGSVGElement) {
    if (!lazy) { visible = true; return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { visible = true; observer.disconnect(); }
    }, { rootMargin: "128px" });
    observer.observe(element);
    return { destroy: () => observer.disconnect() };
  }

  function centerPaintedBounds(element: SVGUseElement, authoredViewBox: string | undefined) {
    let observer: ResizeObserver | undefined;
    function update(nextViewBox: string | undefined) {
      observer?.disconnect();
      centeredViewBox = undefined;
      if (!nextViewBox) return;
      const dimensions = nextViewBox.split(" ").map(Number);
      const width = dimensions[2]!;
      const height = dimensions[3]!;
      observer = new ResizeObserver(() => {
        let bounds: DOMRect;
        try { bounds = element.getBBox(); } catch { return; }
        if (bounds.width <= 0 || bounds.height <= 0) return;
        observer?.disconnect();
        centeredViewBox = `${bounds.x + (bounds.width - width) / 2} ${bounds.y + (bounds.height - height) / 2} ${width} ${height}`;
      });
      observer.observe(element);
    }
    update(authoredViewBox);
    return { update, destroy: () => observer?.disconnect() };
  }
</script>

<svg viewBox={centeredViewBox ?? viewBox} width="100%" height="100%" aria-hidden="true" focusable="false" use:observe>
  <use href={visible ? iconSvgReferenceUrl(url) : undefined} width="100%" height="100%" onerror={onError} use:centerPaintedBounds={centerArtwork ? viewBox : undefined} />
</svg>

<style>
  svg { display: block; width: 100%; height: 100%; overflow: hidden; }
</style>
