<script lang="ts">
  import type { FormattedFileDate } from "./file-date.ts";
  import { splitTextDifference } from "./text-difference.ts";

  let { date, comparison, changedClass, commonClass, title = date.full }: {
    date: FormattedFileDate;
    comparison?: FormattedFileDate | null;
    changedClass?: string;
    commonClass?: string;
    title?: string;
  } = $props();
</script>

{#snippet part(value: string, peer: string)}
  {#if changedClass}
    {@const difference = splitTextDifference(value, peer)}
    <span class={commonClass}>{difference.prefix}</span><span class={changedClass}>{difference.changed}</span><span class={commonClass}>{difference.suffix}</span>
  {:else}
    <span class={commonClass}>{value}</span>
  {/if}
{/snippet}

<span class="file-date" {title}>
  {#each date.parts as segment, idx}
    <span class:muted={segment.muted}>{@render part(segment.text, comparison?.parts[idx]?.text ?? "")}</span>
  {/each}
</span>

<style>
  .file-date { font-variant-numeric: tabular-nums; white-space: nowrap; }
  .muted { opacity: .65; }
</style>
