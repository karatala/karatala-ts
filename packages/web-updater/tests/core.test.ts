import { expect, test } from "bun:test";
import { checkForWebUpdate, createWebUpdater, type ReadJson, type WebUpdateHost } from "../src/core";
import { builtin, bundleFixture, newer, releaseFixture, source } from "./fixtures";

test("a newer compatible public release is offered through its pinned GitHub asset", async () => {
  const fixture = bundleFixture();
  const addresses: string[] = [];
  const json: ReadJson = async address => { addresses.push(address); return address.includes("api.github.com") ? releaseFixture(fixture.manifest) : fixture.manifest; };
  expect(await checkForWebUpdate(source, builtin, json)).toEqual({ kind: "available", update: fixture.update });
  expect(addresses).toEqual(["https://api.github.com/repos/example/editor/releases/latest", "https://github.com/example/editor/releases/download/v2/web-update.json"]);
});

test.each(["v2", "release/v2"])("tagged assets are resolved from the release tag: %s", async tag => {
  const fixture = bundleFixture({ ...newer, version: tag });
  const filenameTag = tag.replace("/", "-");
  const manifestName = `editor-${filenameTag}-web-update.json`;
  const archiveName = `editor-${filenameTag}-web-update.zip`;
  const prefix = `https://github.com/${source.repository}/releases/download/${encodeURIComponent(tag)}/`;
  const manifest = { ...fixture.manifest, archive: { ...fixture.manifest.archive, name: archiveName } };
  const release = { draft: false, prerelease: false, tag_name: tag, assets: [
    { name: manifestName, browser_download_url: prefix + manifestName, size: JSON.stringify(manifest).length },
    { name: archiveName, browser_download_url: prefix + archiveName, size: manifest.archive.size, digest: `sha256:${manifest.archive.sha256}` }
  ] };
  const taggedSource = { ...source, manifestName: "editor-{tag}-web-update.json", archiveName: "editor-{tag}-web-update.zip" };
  const addresses: string[] = [];
  const json: ReadJson = async address => { addresses.push(address); return address.includes("api.github.com") ? release : manifest; };
  expect(await checkForWebUpdate(taggedSource, builtin, json)).toEqual({ kind: "available", update: { manifest, url: prefix + archiveName, releaseUrl: `https://github.com/${source.repository}/releases/tag/${encodeURIComponent(tag)}` } });
  expect(addresses[1]).toBe(prefix + manifestName);
  manifest.archive.name = "editor-another-tag-web-update.zip";
  await expect(checkForWebUpdate(taggedSource, builtin, json)).rejects.toThrow("Cannot read the update package");
});

test("another native runtime requires a full package and is never staged", async () => {
  const fixture = bundleFixture({ ...newer, runtime: "b".repeat(64) });
  let staged = false;
  const host: WebUpdateHost = { async ready() {}, async stage() { staged = true; return "candidate"; }, async schedule() {}, async activate() {} };
  const updater = createWebUpdater(source, builtin, host, async address => address.includes("api.github.com") ? releaseFixture(fixture.manifest) : fixture.manifest);
  expect(await updater.update()).toEqual({ kind: "native-required", releaseUrl: fixture.update.releaseUrl });
  expect(staged).toBe(false);
});

test.each([builtin, { ...builtin, revision: "4".repeat(40), sequence: 99 }])("the same or an older commit is not offered", async build => {
  const fixture = bundleFixture(build);
  expect(await checkForWebUpdate(source, builtin, async address => address.includes("api.github.com") ? releaseFixture(fixture.manifest) : fixture.manifest)).toEqual({ kind: "current" });
});

test.each(["draft", "prerelease"])("unpublished and preview releases are ignored: %s", async flag => {
  const release = { ...releaseFixture(), [flag]: true };
  expect(await checkForWebUpdate(source, builtin, async () => release)).toEqual({ kind: "current" });
});

test("an archive digest or download address cannot disagree with release metadata", async () => {
  const fixture = bundleFixture();
  const release = releaseFixture(fixture.manifest);
  release.assets[1]!.digest = "sha256:" + "0".repeat(64);
  await expect(checkForWebUpdate(source, builtin, async address => address.includes("api.github.com") ? release : fixture.manifest)).rejects.toThrow("does not match");
  release.assets[0]!.browser_download_url = "https://other.example/update.json";
  await expect(checkForWebUpdate(source, builtin, async address => address.includes("api.github.com") ? release : fixture.manifest)).rejects.toThrow("unexpected address");
});

test("background staging never activates; prepared activation does not check or download again", async () => {
  const fixture = bundleFixture();
  const calls: string[] = [];
  let requests = 0;
  const host: WebUpdateHost = { async ready() { calls.push("ready"); }, async stage() { calls.push("stage"); return "candidate"; }, async schedule() { calls.push("schedule"); }, async activate() { calls.push("activate"); } };
  const updater = createWebUpdater(source, builtin, host, async address => { requests++; return address.includes("api.github.com") ? releaseFixture(fixture.manifest) : fixture.manifest; });
  await updater.ready();
  await updater.update();
  expect(calls).toEqual(["ready", "stage", "schedule"]);
  await updater.applyPrepared();
  expect(calls).toEqual(["ready", "stage", "schedule", "activate"]);
  expect(requests).toBe(2);
});

test("the final save happens after download and a failed save stops activation", async () => {
  const fixture = bundleFixture();
  const calls: string[] = [];
  const host: WebUpdateHost = { async ready() {}, async stage() { calls.push("stage"); return "candidate"; }, async schedule() {}, async activate() { calls.push("activate"); } };
  const updater = createWebUpdater(source, builtin, host, async address => address.includes("api.github.com") ? releaseFixture(fixture.manifest) : fixture.manifest);
  await expect(updater.update(true, async () => { calls.push("save"); throw new Error("Disk full"); })).rejects.toThrow("Disk full");
  expect(calls).toEqual(["stage", "save"]);
  calls.length = 0;
  await updater.update(true, async () => { calls.push("save"); });
  expect(calls).toEqual(["stage", "save", "activate"]);
});

test("source archives without Git do not contact the update service", async () => {
  expect(await checkForWebUpdate(source, { ...builtin, revision: "", sequence: 0 }, async () => { throw new Error("Unexpected request"); })).toEqual({ kind: "current" });
});
