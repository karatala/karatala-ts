<script lang="ts">
  import catalog from "./catalog.json";
  let { families }: { families: Record<string, string> } = $props();
</script>

<ol class="guide-rules">
  <li>Choose an existing component below. New features import the package; keep one implementation and one live example.</li>
  <li>Use its standard size, spacing, icon scale and states. Plain layout markup may arrange controls. A missing capability needs a small extension or a focused component.</li>
  <li>Use short labels. Put long explanations in Help. Errors say what failed, give the accepted form and explain how to recover.</li>
  <li>Show numeric units after the number inside the control. Keep window actions at the bottom and fit nonstretching content.</li>
  <li>Use an overlay notification or reserved status area for temporary messages. Keep existing controls in place.</li>
  <li>Preserve each variant's focus, keyboard, commit and cancel contract. A visual resemblance does not permit changing those behaviors.</li>
  <li>Use semantic theme roles for shared presentation. Applications own palettes and meaningful content colors. Keep cards flat; retain functional focus, separators and approved popup-shell treatment.</li>
  <li>Applications provide data, callbacks, translations and platform services. Generic controls must not import application source or request permissions.</li>
</ol>
<p class="note">The package exports and live component pages form the prepared shared catalog. Product-specific approval stays with each application's source plan. Shravanam uses these prepared variants; its former draft controls are not library candidates.</p>
<div class="guide-catalog">
  {#each Object.entries(families) as [family, label]}
    <section><h2><a href={`/compare/${family}`}>{label}</a></h2>
      <ul>{#each catalog.filter(item => item.family === family) as item}<li><a href={`/${item.id}`}>{item.variant}: {item.name}</a></li>{/each}</ul>
    </section>
  {/each}
</div>
<details><summary>Choosing a variant</summary><p>Use Rachana UiNumberStepper for bounded numeric input. Both segment-button and KoMandir segment variants are allowed. Keep Dropdown focus policies, shortcut confirmation and color commit/cancel behavior distinct. Use the component's live page and props before choosing; further comparison is needed only when replacing one contract with another.</p><p><a href="/themes">Inspect theme roles and dynamic palettes →</a></p></details>

<style>
  .guide-rules { max-width: 840px; padding-left: 24px; line-height: 1.7; }
  .guide-rules li { margin-block: 10px; }
  .guide-catalog { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 22px; margin-top: 30px; }
  .guide-catalog h2 { font-size: 18px; }
  .guide-catalog ul { padding-left: 18px; line-height: 1.8; font-size: 13px; }
</style>
