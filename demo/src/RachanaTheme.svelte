<script lang="ts">
  import { onMount } from "svelte";
  import { installHoverInput } from "@karatala/dom-input";
  import "@karatala/ui-rachana/styles.css";
  import "@karatala/ui-theme/rachana.css";
  import { provideRachanaUiHost } from "@karatala/ui-rachana/host.ts";
  import UiButton from "@karatala/ui-rachana/UiButton.svelte";
  import UiColorPicker from "@karatala/ui-rachana/UiColorPicker.svelte";
  import UiTextInput from "@karatala/ui-rachana/UiTextInput.svelte";
  import UiNumberStepper from "@karatala/ui-rachana/UiNumberStepper.svelte";
  import UiCheckboxButton from "@karatala/ui-rachana/UiCheckboxButton.svelte";
  import UiSegmentedControl from "@karatala/ui-rachana/UiSegmentedControl.svelte";
  import UiSelect from "@karatala/ui-rachana/UiSelect.svelte";
  import UiMiniPopup from "@karatala/ui-rachana/UiMiniPopup.svelte";
  import { rachanaPalettes, themePalette } from "./theme-preview";
  import ThemeSwatches from "./ThemeSwatches.svelte";
  provideRachanaUiHost({ translate: (text, values) => text.replace(/\{([^}]+)\}/g, (match, key: string) => String(values?.[key] ?? match)) });
  onMount(() => installHoverInput(window));
  let palette = $state("original");
  let accentText = $state("#4e7aff");
  let accent = $state<string>();
  let text = $state("Sample");
  let amount = $state(75);
  let checked = $state(true);
  let choice = $state("all");
  let open = $state(false);
  let status = $state("Ready");
  const options = [{ value: "all", label: "All" }, { value: "files", label: "Files" }, { value: "folders", label: "Folders" }];
  const colors = $derived({ ...rachanaPalettes[palette], ...(accent ? { "--ui-accent-fill": accent } : {}) });
  function choosePalette() { accent = undefined; accentText = palette === "light" ? "#3d65d9" : palette === "shravanam" ? "#8461af" : "#4e7aff"; status = "Palette changed; sample values retained"; }
</script>

<div class="app-shell theme-case" data-appearance="rachana-dark" style:display="block" style:background="var(--karatala-color-background)" use:themePalette={{ variant: "rachana", colors, mode: palette === "light" ? "light" : "dark" }}>
  <div class="theme-row"><UiSelect label="Palette" bind:value={palette} onchange={choosePalette}><option value="original">Rachana default</option><option value="light">Rachana light colors</option><option value="shravanam">Shravanam colors</option></UiSelect></div>
  <div class="theme-row"><span>Accent fill</span><UiColorPicker label="Accent fill" value={accentText} onchange={next => { accentText = next; accent = next; status = "Accent fill applied: " + next; }} /></div>
  <div class="theme-row"><UiButton label="Save sample" text="Save" tone="primary" onclick={() => status = "Saved: " + text} /><UiButton label="Unavailable action" text="Unavailable" disabled /><UiCheckboxButton label="Include folders" {checked} onchange={next => checked = next} /></div>
  <div class="theme-row"><UiTextInput aria-label="Sample name" bind:value={text} /><UiNumberStepper label="Amount" value={amount} min={0} max={100} suffix="%" onchange={next => amount = next} /></div>
  <UiSegmentedControl label="Scope" value={choice} {options} labelMode="all" onchange={next => choice = next} />
  <div class="theme-row"><UiMiniPopup bind:open label="Palette popup">{#snippet trigger(attributes)}<UiButton {...attributes} label="Open themed popup" text="Open popup" />{/snippet}<p>Popup uses this document's palette.</p><UiTextInput aria-label="Popup sample name" bind:value={text} /><UiButton label="Close themed popup" text="Close" onclick={() => open = false} /></UiMiniPopup></div>
  <output class="theme-status" aria-label="Theme example result">{status}</output>
  <ThemeSwatches />
</div>
