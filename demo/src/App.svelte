<script lang="ts">
  import catalog from "./catalog.json";
  import Preview from "./Preview.svelte";
  const pathname = window.location.pathname;
  const preview = pathname.startsWith("/preview/");
  const route = pathname.replace(/^\/(?:preview\/)?/, "");
  const families: Record<string, string> = { buttons: "Buttons", colors: "Colors", checks: "Checkboxes & switches", numbers: "Numbers & sliders", selection: "Selection & dropdowns", windows: "Windows & overlays", menus: "Menus", help: "Help & shortcuts", tables: "Tables & rows", icons: "Icons", layout: "Fields & layout" };
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
  const title = family ? families[family] : selected?.name ?? "Components";
</script>

<svelte:head><title>{preview ? "Preview" : title} · Karatala</title></svelte:head>

{#if preview}
  <Preview id={route} />
{:else}
  <div class="docs">
    <aside class="sidebar">
      <a class="brand" href="/">karatala<span>Component library</span></a>
      <label class="search">Find a component<input type="search" bind:value={search} placeholder="Button, select, window…" /></label>
      <nav aria-label="Compare component families">
        <h2>Compare variants</h2>
        {#each Object.entries(families) as [key, label]}
          <a href={`/compare/${key}`} aria-current={family === key ? "page" : undefined}>{label}</a>
        {/each}
      </nav>
      {#each ["rachana", "komandir"] as variant}
        <nav aria-label={`${variant} components`}>
          <h2>{variant === "rachana" ? "Rachana" : "KoMandir"}</h2>
          {#each visible.filter(item => item.variant === variant) as item}
            <a href={`/${item.id}`} aria-current={selected?.id === item.id ? "page" : undefined}>{item.name}</a>
          {/each}
        </nav>
      {/each}
    </aside>
    <main class="content">
      <header class="page-title"><p>KARATALA / UI CATALOG</p><h1>{title}</h1>
        <p>{family ? "Existing variants, side by side. Each example keeps its own styles and behavior." : selected ? `${selected.variant === "rachana" ? "Rachana" : "KoMandir"} variant · preserved source component` : "Ready components from Rachana and KoMandir. Pick a component or compare a family."}</p>
      </header>
      {#if selected}<p><a href={`/compare/${selected.family}`}>Compare all {families[selected.family].toLowerCase()} →</a></p>{/if}
      {#if !examples.length}
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
              <div class="example-heading"><div><span class="badge">{item.variant === "rachana" ? "Rachana" : "KoMandir"}</span><h2><a href={`/${item.id}`}>{item.name}</a></h2></div><a href={`/preview/${item.id}`} target="_blank" rel="noopener">Open example ↗</a></div>
              <iframe title={`${item.variant} ${item.name} live example`} src={`/preview/${item.id}`} loading="lazy" style:height={item.family === "windows" ? "540px" : item.family === "selection" || item.family === "menus" || item.family === "help" ? "350px" : "220px"}></iframe>
              <details open={!family}><summary>Usage</summary><pre><code>{`import ${item.name} from "${item.importPath}";\n\n${item.usage ?? ""}`}</code></pre><p>Use the props below. Markup from the live example. Its values and callbacks are local demo state; application actions and persistence remain with the caller.</p></details>
              <details><summary>Props and defaults</summary><pre><code>{item.props}</code></pre></details>
              <details><summary>Source and integration</summary><p>{item.source}</p><p>Import from this package, compile with one Svelte 5 peer, and supply the existing theme roles. See the package README for host setup. Each preview runs in its own document so the two legacy style systems cannot overwrite each other.</p></details>
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
