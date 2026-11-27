<script lang="ts">
  import "@karatala/ui-theme/komandir.css";
  import UiTextInput from "@karatala/ui-rachana/UiTextInput.svelte";
  import { provideKomandirUiHost } from "@karatala/ui-komandir/host.ts";
  import Button from "@karatala/ui-komandir/Button.svelte";
  import CheckButton from "@karatala/ui-komandir/CheckButton.svelte";
  import ColorPicker from "@karatala/ui-komandir/ColorPicker.svelte";
  import Dropdown from "@karatala/ui-komandir/Dropdown.svelte";
  import SegmentedControl from "@karatala/ui-komandir/SegmentedControl.svelte";
  import MiniPopup from "@karatala/ui-komandir/MiniPopup.svelte";
  import palettes from "./palettes.json";
  import { themePalette } from "./theme-preview";
  import ThemeSwatches from "./ThemeSwatches.svelte";
  provideKomandirUiHost({});
  let palette = $state<keyof typeof palettes>("commander");
  let accent = $state<string>();
  let checked = $state(true);
  let text = $state("Sample");
  let choice = $state("all");
  let status = $state("Ready");
  let open = $state(false);
  let trigger = $state<HTMLElement | null>(null);
  const options = [{ value: "all", label: "All" }, { value: "files", label: "Files" }, { value: "folders", label: "Folders" }];
  const sourceColors = $derived({ ...palettes.commander, ...palettes[palette] });
  const colors = $derived({ ...sourceColors, "--theme-workbench-raised": `color-mix(in srgb, ${sourceColors["--theme-workbench-surface"]}, ${sourceColors["--theme-workbench-foreground"]} ${palette === "light" ? 16 : 12}%)`, "--theme-workbench-hover": `color-mix(in srgb, ${sourceColors["--theme-workbench-surface"]}, ${sourceColors["--theme-workbench-foreground"]} ${palette === "light" ? 24 : 18}%)`, ...(accent ? { "--theme-workbench-accent": accent } : {}) });
</script>

<div class="theme-case" use:themePalette={{ variant: "komandir", colors, mode: palette === "light" ? "light" : "dark" }}>
  <div class="theme-row"><Dropdown label="Palette" value={palette} options={[{ value: "commander", label: "Commander" }, { value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} onChange={next => { palette = next; accent = undefined; status = "Palette changed; sample values retained"; }} /></div>
  <div class="theme-row"><span>Accent and focus</span><ColorPicker label="Accent and focus" value={colors["--theme-workbench-accent"]} onChange={next => { accent = next; status = "Accent applied: " + next; }} /></div>
  <div class="theme-row"><Button tone="primary" onclick={() => status = "Saved: " + text}>Save</Button><Button disabled>Unavailable</Button><CheckButton label="Include folders" {checked} onChange={next => checked = next} /></div>
  <SegmentedControl label="Scope" value={choice} {options} onChange={next => choice = next} />
  <div class="theme-row"><Dropdown label="File scope" value={choice} {options} onChange={next => choice = next} /></div>
  <div class="theme-row"><Button onclick={event => { trigger = event.currentTarget; open = true; }}>Open popup</Button>{#if open}<MiniPopup title="Palette popup" {trigger} onClose={() => open = false} onFocusReturn={() => trigger?.focus()}><p>Popup uses this document's palette.</p><UiTextInput aria-label="Popup sample name" bind:value={text} style="--ui-text:var(--karatala-color-text);--ui-field-surface:var(--karatala-color-field);--ui-accent:var(--karatala-color-focus)" /><Button onclick={() => open = false}>Close</Button></MiniPopup>{/if}</div>
  <output class="theme-status" aria-label="Theme example result">{status}</output>
  <ThemeSwatches />
</div>
