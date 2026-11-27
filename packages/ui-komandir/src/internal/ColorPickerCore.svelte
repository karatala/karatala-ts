<script module lang="ts">
  import type { Snippet } from "svelte";
  export interface PickerTrigger { label: string; value: string; color: string; open: boolean; toggle(event: MouseEvent): void; }
  export interface PickerPopup { label: string; trigger: HTMLElement | null; initialFocus: string; close(): void; returnFocus(): void; content: Snippet; }
</script>
<script lang="ts">
  import "../color-picker.css";
  import { oklchToRgb, parseHexColor, rgbToHex, rgbToOklch, type OklchColor, type SrgbColor } from "../color-space.ts";
  import Button from "./Button.svelte";
  import SegmentedControl from "./SegmentedControl.svelte";

  let { value, label, onChange, trigger: renderTrigger, popup: renderPopup, translate: message }: { value: string; label: string; onChange(value: string): void; trigger: Snippet<[PickerTrigger]>; popup: Snippet<[PickerPopup]>; translate(text: string, values?: Record<string, string | number>): string } = $props();
  const maxChroma = 0.4;
  let open = $state(false);
  let keyboardOpened = $state(false);
  let trigger = $state<HTMLButtonElement | null>(null);
  let form = $state<HTMLFormElement>();
  let ring = $state<HTMLCanvasElement>();
  let plane = $state<HTMLCanvasElement>();
  let draft = $state<OklchColor>({ lightness: 0.7, chroma: 0.1, hue: 0 });
  let hexText = $state("");
  let model = $state<"oklch" | "rgb">("oklch");
  let display = $derived(oklchToRgb(draft));
  let hex = $derived(rgbToHex(display));
  let validHex = $derived(/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(hexText));
  let planeHue = $derived(draft.hue);
  let hueRadians = $derived((draft.hue - 90) * Math.PI / 180);
  let lightnessGradient = $derived(Array.from({ length: 11 }, (_entry, idx) => rgbToHex(oklchToRgb({ ...draft, lightness: idx / 10 }))).join(","));

  function toggle(event: MouseEvent): void {
    trigger = event.currentTarget as HTMLButtonElement;
    if (open) { open = false; return; }
    keyboardOpened = event.detail === 0;
    const color = parseHexColor(value) ?? { red: 0, green: 0, blue: 0 };
    draft = rgbToOklch(color);
    hexText = rgbToHex(color);
    open = true;
  }
  function update(next: OklchColor): void {
    draft = { lightness: Math.max(0, Math.min(1, next.lightness)), chroma: Math.max(0, Math.min(maxChroma, next.chroma)), hue: (next.hue % 360 + 360) % 360 };
    hexText = rgbToHex(oklchToRgb(draft));
  }
  function readHex(event: Event): void {
    hexText = (event.currentTarget as HTMLInputElement).value;
    const parsed = parseHexColor(hexText);
    if (!parsed) return;
    const next = rgbToOklch(parsed);
    draft = { ...next, hue: next.chroma < 0.000001 ? draft.hue : next.hue };
  }
  function changeChannel(channel: keyof SrgbColor, event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    if (input.validity.valid && Number.isFinite(input.valueAsNumber)) update(rgbToOklch({ ...display, [channel]: input.valueAsNumber }));
  }
  function changeComponent(component: keyof OklchColor, event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    if (input.validity.valid && Number.isFinite(input.valueAsNumber)) update({ ...draft, [component]: input.valueAsNumber / (component === "lightness" ? 100 : 1) });
  }
  function apply(): void {
    if (!validHex || !form?.reportValidity()) return;
    onChange(hex);
    open = false;
  }
  function point(event: PointerEvent, area: "hue" | "plane"): void {
    const button = event.currentTarget as HTMLButtonElement;
    if (event.type === "pointerdown") {
      if (event.button !== 0) return;
      event.preventDefault();
      button.focus({ preventScroll: true });
      button.setPointerCapture(event.pointerId);
    } else if (!button.hasPointerCapture(event.pointerId)) return;
    const bounds = button.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width;
    const vertical = (event.clientY - bounds.top) / bounds.height;
    if (area === "hue") update({ ...draft, hue: Math.atan2(vertical - 0.5, horizontal - 0.5) * 180 / Math.PI + 90 });
    else update({ ...draft, chroma: horizontal * maxChroma, lightness: 1 - vertical });
  }
  function release(event: PointerEvent): void {
    const button = event.currentTarget as HTMLButtonElement;
    if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
  }
  function key(event: KeyboardEvent, area: "hue" | "plane"): void {
    if (event.key === "Enter") { event.preventDefault(); apply(); return; }
    if (event.altKey || event.ctrlKey || event.metaKey || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const direction = event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 1;
    const step = event.shiftKey ? 10 : 1;
    if (area === "hue") update({ ...draft, hue: event.key === "Home" ? 0 : event.key === "End" ? 359 : draft.hue + direction * step });
    else if (event.key === "ArrowUp" || event.key === "ArrowDown") update({ ...draft, lightness: draft.lightness + direction * step / 100 });
    else update({ ...draft, chroma: event.key === "Home" ? 0 : event.key === "End" ? maxChroma : draft.chroma + direction * step / 1000 });
  }
  $effect(() => {
    if (!ring) return;
    const canvas = ring;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, 216, 216);
    context.lineWidth = 20;
    for (let hue = 0; hue < 360; hue++) {
      context.strokeStyle = rgbToHex(oklchToRgb({ lightness: 0.75, chroma: 0.15, hue }));
      context.beginPath();
      context.arc(108, 108, 98, (hue - 90.6) * Math.PI / 180, (hue - 89.4) * Math.PI / 180);
      context.stroke();
    }
  });
  $effect(() => {
    const canvas = plane;
    const hue = planeHue;
    if (!canvas) return;
    const frame = requestAnimationFrame(() => {
      const context = canvas.getContext("2d");
      if (!context) return;
      const image = context.createImageData(128, 128);
      for (let row = 0; row < 128; row++) {
        for (let column = 0; column < 128; column++) {
          const color = oklchToRgb({ lightness: 1 - row / 127, chroma: column / 127 * maxChroma, hue });
          const offset = (row * 128 + column) * 4;
          const shade = (Math.floor(row / 4) + Math.floor(column / 4)) % 2 ? 155 : 180;
          const blend = color.inGamut ? 1 : 0.35;
          image.data[offset] = color.red * blend + shade * (1 - blend);
          image.data[offset + 1] = color.green * blend + shade * (1 - blend);
          image.data[offset + 2] = color.blue * blend + shade * (1 - blend);
          image.data[offset + 3] = 255;
        }
      }
      context.putImageData(image, 0, 0);
    });
    return () => cancelAnimationFrame(frame);
  });
</script>

{@render renderTrigger({ label, value, color: rgbToHex(parseHexColor(value) ?? { red: 0, green: 0, blue: 0 }), open, toggle })}
{#if open}
  {#snippet content()}
    <form bind:this={form} class="color-picker-form" tabindex="-1" onsubmit={event => { event.preventDefault(); apply(); }}>
      <div class="color-picker-scroll">
        <div class="color-picker-wheel">
          <button
            type="button"
            class="color-picker-hue"
            role="slider"
            aria-label={message("Hue")}
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={Math.round(draft.hue)}
            aria-valuetext={`${Math.round(draft.hue)}°`}
            onpointerdown={event => point(event, "hue")}
            onpointermove={event => point(event, "hue")}
            onpointerup={release}
            onpointercancel={release}
            onkeydown={event => key(event, "hue")}>
            <canvas width="216" height="216" bind:this={ring} aria-hidden="true"></canvas>
            <span class="color-picker-marker" style={`left:${50 + Math.cos(hueRadians) * 45.37}%;top:${50 + Math.sin(hueRadians) * 45.37}%;background:${hex}`} aria-hidden="true"></span>
          </button>
          <button
            type="button"
            class="color-picker-plane"
            role="slider"
            aria-label={message("Lightness and chroma")}
            aria-valuemin={0}
            aria-valuemax={0.4}
            aria-valuenow={Number(draft.chroma.toFixed(3))}
            aria-valuetext={message("Lightness {lightness}%, chroma {chroma}", { lightness: (draft.lightness * 100).toFixed(1), chroma: draft.chroma.toFixed(3) })}
            title={message("Left/Right: chroma. Up/Down: lightness.")}
            onpointerdown={event => point(event, "plane")}
            onpointermove={event => point(event, "plane")}
            onpointerup={release}
            onpointercancel={release}
            onkeydown={event => key(event, "plane")}>
            <canvas width="128" height="128" bind:this={plane} aria-hidden="true"></canvas>
            <span class="color-picker-marker" style={`left:${draft.chroma / maxChroma * 100}%;top:${(1 - draft.lightness) * 100}%;background:${hex}`} aria-hidden="true"></span>
          </button>
        </div>
        <label class="color-picker-lightness">
          <span>
            {message("Lightness")}
            <output>{(draft.lightness * 100).toFixed(1)}%</output>
          </span>
          <input type="range" min="0" max="100" step="0.1" value={draft.lightness * 100} style={`background:linear-gradient(to right,${lightnessGradient})`} oninput={event => changeComponent("lightness", event)} />
        </label>
        <SegmentedControl label={message("Color model")} value={model} options={[{ value: "oklch", label: "OKLCH" }, { value: "rgb", label: "RGB" }]} onChange={next => model = next} />
        <div class="color-picker-channels">
          {#if model === "oklch"}
            <label>
              <span>{message("Lightness")} %</span>
              <input class="color-picker-input" type="number" min="0" max="100" step="0.1" required value={Number((draft.lightness * 100).toFixed(1))} oninput={event => changeComponent("lightness", event)} />
            </label>
            <label>
              <span>{message("Chroma")}</span>
              <input class="color-picker-input" type="number" min="0" max={maxChroma} step="0.001" required value={Number(draft.chroma.toFixed(3))} oninput={event => changeComponent("chroma", event)} />
            </label>
            <label>
              <span>{message("Hue")} °</span>
              <input class="color-picker-input" type="number" min="0" max="360" step="1" required value={Math.round(draft.hue)} oninput={event => changeComponent("hue", event)} />
            </label>
          {:else}
            {#each [{ key: "red", label: message("Red") }, { key: "green", label: message("Green") }, { key: "blue", label: message("Blue") }] as channel (channel.key)}
              <label>
                <span>{channel.label}</span>
                <input class="color-picker-input" type="number" min="0" max="255" step="1" required value={Math.round(display[channel.key as keyof SrgbColor])} oninput={event => changeChannel(channel.key as keyof SrgbColor, event)} />
              </label>
            {/each}
          {/if}
        </div>
        <label class="color-picker-hex-field">
          <span>{message("Hex color")}</span>
          <span>
            <i style={`background:${hex}`} aria-hidden="true"></i>
            <input class="color-picker-hex color-picker-input" value={hexText} oninput={readHex} spellcheck="false" maxlength="7" required pattern={"#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?"} aria-invalid={!validHex} />
          </span>
        </label>
        <small class="color-picker-note" role="status">{!validHex ? message("Enter a color such as #ffcc00.") : !display.inGamut ? message("Outside sRGB. Apply uses the shown color.") : ""}</small>
      </div>
      <div class="color-picker-actions">
        <Button onclick={() => open = false}>{message("Cancel")}</Button>
        <Button type="submit" tone="primary" disabled={!validHex}>{message("Apply")}</Button>
      </div>
    </form>
  {/snippet}
  {@render renderPopup({ label, trigger, initialFocus: keyboardOpened ? ".color-picker-hex" : ".color-picker-form", close: () => open = false, returnFocus: () => trigger?.focus(), content })}
{/if}
