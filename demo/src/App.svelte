<script lang="ts">
  import catalog from "./catalog.json";
  import Preview from "./Preview.svelte";
  import ThemePreview from "./ThemePreview.svelte";
  import Themes from "./Themes.svelte";
  import StyleGuide from "./StyleGuide.svelte";
  const pathname = window.location.pathname;
  const preview = pathname.startsWith("/preview/");
  const themePreview = pathname.startsWith("/theme-preview/");
  const themes = pathname === "/themes";
  const guide = pathname === "/guide";
  const route = pathname.replace(/^\/(?:preview\/)?/, "");
  const families: Record<string, string> = { buttons: "Buttons", colors: "Colors", checks: "Checkboxes & switches", numbers: "Numbers & sliders", selection: "Selection & dropdowns", windows: "Windows & overlays", menus: "Menus", help: "Help & shortcuts", tables: "Tables & rows", icons: "Icons", layout: "Fields & layout", startup: "Startup & recovery" };
  const variantLabels: Record<string, string> = { rachana: "Rachana", komandir: "KoMandir", bootstrap: "Independent DOM" };
  const previewUrl = (item: typeof catalog[number]) => item.variant === "bootstrap" ? "/startup-preview.html?state=error" : `/preview/${item.id}`;
  const family = route.startsWith("compare/") ? route.slice(8) : undefined;
  const selected = catalog.find(item => item.id === route);
  const examples = family ? groupVariants(catalog.filter(item => item.family === family)) : selected ? [[selected]] : [];
  function groupVariants(items: typeof catalog): (typeof catalog)[] {
    const aliases: Record<string, string> = { UiCheckboxButton: "CheckButton", UiSelect: "Dropdown", ModalDialog: "WindowDialog", UiHelp: "HelpButton" };
    const groups = new Map<string, typeof catalog>();
    for (const item of items) {
      const key = aliases[item.name] ?? item.name.replace(/^Ui/, "");
      const group = groups.get(key) ?? [];
      group.push(item);
      groups.set(key, group);
    }
    return [...groups.values()];
  }
  let search = $state("");
  const visible = $derived(catalog.filter(item => `${item.name} ${item.variant}`.toLowerCase().includes(search.toLowerCase())));
  const title = themes ? "Themes & color roles" : guide ? "Component guide" : family ? families[family] : selected?.name ?? "Components";
</script>

<svelte:head><title>{themePreview ? "Theme preview" : preview ? "Preview" : title} · Karatala</title></svelte:head>

{#if themePreview}
  <ThemePreview variant={pathname.split("/")[2]} />
{:else if preview}
  <Preview id={route} />
{:else}
  <div class="docs">
    <aside class="sidebar">
      <a class="brand" href="/">karatala<span>Component library</span></a>
      <nav aria-label="Library guides"><a href="/guide" aria-current={guide ? "page" : undefined}>Component guide</a><a href="/themes" aria-current={themes ? "page" : undefined}>Themes & color roles</a></nav>
      <label class="search">Find a component<input type="search" bind:value={search} placeholder="Button, select, window…" /></label>
      <nav aria-label="Compare component families">
        <h2>Compare variants</h2>
        {#each Object.entries(families) as [key, label]}
          <a href={`/compare/${key}`} aria-current={family === key ? "page" : undefined}>{label}</a>
        {/each}
      </nav>
      {#each ["rachana", "komandir", "bootstrap"] as variant}
        <nav aria-label={`${variant} components`}>
          <h2>{variantLabels[variant]}</h2>
          {#each visible.filter(item => item.variant === variant) as item}
            <a href={`/${item.id}`} aria-current={selected?.id === item.id ? "page" : undefined}>{item.name}</a>
          {/each}
        </nav>
      {/each}
    </aside>
    <main class="content">
      <header class="page-title"><p>KARATALA / UI CATALOG</p><h1>{title}</h1>
        <p>{themes ? "Live palettes and shared color names, with preserved component variants." : guide ? "Use the prepared controls for new features and keep application behavior with its owner." : family ? "Existing variants, side by side. Each example keeps its own styles and behavior." : selected ? `${variantLabels[selected.variant]} variant · preserved source component` : "Ready components from Rachana and KoMandir. Pick a component or compare a family."}</p>
      </header>
      {#if selected}<p><a href={`/compare/${selected.family}`}>Compare all {families[selected.family].toLowerCase()} →</a></p>{/if}
      {#if themes}<Themes />
      {:else if guide}<StyleGuide {families} />
      {:else if !examples.length}
        <div class="family-grid">
          {#each Object.entries(families) as [key, label]}
            <a class="family-link" href={`/compare/${key}`}><strong>{label}</strong><span>{catalog.filter(item => item.family === key).length} components · compare variants →</span></a>
          {/each}
        </div>
        <p class="note">Examples change memory only. No application files, settings, devices or services are used. Application icon themes and window persistence are supplied through host adapters.</p>
      {:else}
        <div class="examples">
          {#each examples as group}
          <div class="example-group" class:is-comparison={!!family && group.length > 1}>
          {#each group as item (item.id)}
            <article class="example">
              <div class="example-heading"><div><span class="badge">{variantLabels[item.variant]}</span><h2><a href={`/${item.id}`}>{item.name}</a></h2></div><a href={previewUrl(item)} target="_blank" rel="noopener">Open example ↗</a></div>
              <iframe title={`${item.variant} ${item.name} live example`} src={previewUrl(item)} loading="lazy" style:height={item.family === "startup" || item.family === "windows" || item.name === "IconPicker" ? "540px" : item.family === "selection" || item.family === "menus" || item.family === "help" ? "350px" : "220px"}></iframe>
              <details open={!family}><summary>Usage</summary><pre><code>{item.variant === "bootstrap" ? item.usage : `import ${item.name} from "${item.importPath}";\n\n${item.usage ?? ""}`}</code></pre><p>Use the props below. Markup from the live example. Its values and callbacks are local demo state; application actions and persistence remain with the caller.</p></details>
              {#if item.variant === "bootstrap"}<p class="note">Standalone scenarios: <a href="/startup-preview.html?state=loading" target="_blank" rel="noopener">Loading</a> · <a href="/startup-preview.html?state=late-error" target="_blank" rel="noopener">Failure after startup</a> · <a href="/startup-preview.html?state=error&clipboard=denied" target="_blank" rel="noopener">Clipboard denied</a>. This preview has no Svelte import. Window, copy and reload actions change memory only.</p>{/if}
              <details><summary>Props and defaults</summary><pre><code>{item.props}</code></pre></details>
              <details><summary>Source and integration</summary><p>{item.source}</p><p>{#if item.variant === "bootstrap"}Render static markup and inline this package CSS and a separate classic connection script before loading the application. The application owns labels, fatal-error policy and action callbacks. No Svelte runtime is required.{:else}Import from this package, compile with one Svelte 5 peer, and supply the existing theme roles. See the package README for host setup. Each preview runs in its own document so the two legacy style systems cannot overwrite each other.{/if}</p></details>
            </article>
          {/each}
          </div>
          {/each}
        </div>
      {/if}
      <footer class="docs-footer">{catalog.length} components · separate variants · memory-only examples</footer>
    </main>
  </div>
{/if}
