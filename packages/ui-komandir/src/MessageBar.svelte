<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "role"> {
    message: string;
    role: "alert" | "status";
  }

  let { message, ...attributes }: Props = $props();
</script>

<div {...attributes}>{message}</div>
