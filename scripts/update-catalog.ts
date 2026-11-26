import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
function family(name: string): string {
  if (/Check|Switch/.test(name)) return "checks";
  if (/ColorPicker/.test(name)) return "colors";
  if (/Number|StepControl|ValueControl|PositionSlider|Zoom/.test(name)) return "numbers";
  if (/Select|Dropdown|Combo|Wheel|PickerFilter|Segmented|TabSurface/.test(name)) return "selection";
  if (/Window|Dialog|Popup|Popover|Portal/.test(name)) return "windows";
  if (/Menu|Context/.test(name)) return "menus";
  if (/Tooltip|Help|Keycap|Shortcut/.test(name)) return "help";
  if (/Table|Column|RowSweep|FileDate|PathLabel/.test(name)) return "tables";
  if (/Button$|Action$|Favorite/.test(name)) return "buttons";
  if (/Icon/.test(name)) return "icons";
  return "layout";
}
const catalog = [];
for (const variant of ["rachana", "komandir"]) {
  const directory = `packages/ui-${variant}/src`;
  const demo = await readFile(resolve(root, `demo/src/${variant === "rachana" ? "Rachana" : "Komandir"}Demos.svelte`), "utf8");
  const branches = [...demo.matchAll(/(?:\{#if|\{:else if) name\s*===?\s*[^\n]+/g)];
  for (const filename of (await readdir(resolve(root, directory))).filter(filename => filename.endsWith(".svelte")).sort()) {
    const name = filename.slice(0, -7);
    const source = `${directory}/${filename}`;
    const contents = await readFile(resolve(root, source), "utf8");
    let props = contents.match(/\blet \{[\s\S]*?\$props\(\)/)?.[0] ?? "";
    const script = contents.match(/<script lang="ts"[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? "";
    const type = script.match(/(?:interface Props|type Props)[\s\S]*?\n  (?:\}|let)/)?.[0];
    if (type) props = `${type.replace(/\n  let$/, "")}\n\n${props}`;
    const branch = branches.find(branch => branch[0].split("}")[0].includes(`"${name}"`));
    if (!branch) throw new Error(`No live example for ${variant}/${name}. Add its example before updating the catalog.`);
    const start = branch.index! + branch[0].indexOf("}") + 1;
    const next = branches.find(branch => branch.index! > start);
    const end = next?.index ?? demo.indexOf("\n  {/if}", start);
    catalog.push({ id: `${variant}/${name}`, variant, name, family: family(name), importPath: `@karatala/ui-${variant}/${filename}`, props, source, usage: demo.slice(start, end).trim() });
  }
}
catalog.push({ id: "bootstrap/StartupScreen", variant: "bootstrap", name: "StartupScreen", family: "startup", importPath: "@karatala/ui-bootstrap", source: "packages/ui-bootstrap/src/index.ts + markup.ts + styles.css", props: "startupMarkup({ title, logoUrl, labels? }): string\nconnectStartup(root, { labels?, actions: { copy(text): Promise<void>, reload(): void, window?: { minimize(), maximize(), close() } } })\nController: setStatus(message), showError(message), complete(), dispose()", usage: 'import { startupMarkup, connectStartup } from "@karatala/ui-bootstrap";\nimport "@karatala/ui-bootstrap/styles.css";\n\ndocument.body.insertAdjacentHTML("beforeend", startupMarkup({ title: "Example", logoUrl: "./icon.svg" }));\nconst startup = connectStartup(document.getElementById("startup")!, {\n  actions: { copy: text => navigator.clipboard.writeText(text), reload: () => location.reload() },\n});\n// Mount succeeded: startup.complete(). Failure: startup.showError(displayMessage).' });
await writeFile(resolve(root, "demo/src/catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Updated ${catalog.length} component pages.`);
