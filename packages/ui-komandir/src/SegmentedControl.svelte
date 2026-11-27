<script module lang="ts">
  import type { IconName } from "./host";
  export interface SegmentOption<Value extends string = string> { value: Value; label: string; icon?: IconName; text?: string; disabled?: boolean }
</script>

<script lang="ts" generics="Value extends string">
  import "./controls.css";
  import Segments from "./internal/SegmentedControl.svelte";
  let { label, value, options, disabled = false, onChange }: { label: string; value: Value; options: SegmentOption<Value>[]; disabled?: boolean; onChange(value: Value): void } = $props();
</script>

<Segments {label} {value} {options} {disabled} {onChange} />
