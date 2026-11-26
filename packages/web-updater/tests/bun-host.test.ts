import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { mkdir, mkdtemp, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { createBunUpdateHost } from "../src/bun-host";
import { builtin, bundleFixture, newer, newest, source } from "./fixtures";

let directory: string;
let cache: string;
let restoreFetch: () => void;
let archives: Map<string, Uint8Array>;
beforeEach(async () => {
  await mkdir("tmp", { recursive: true });
  directory = await mkdtemp(join(resolve("tmp"), "web-update-test-"));
  cache = join(directory, "profile/tmp/cache/web-updates");
  await mkdir(join(directory, "profile/projects"), { recursive: true });
  await writeFile(join(directory, "profile/settings.json"), "settings must survive");
  await writeFile(join(directory, "profile/projects/project.rcn"), "project must survive");
  archives = new Map();
  const fetchMock = spyOn(globalThis, "fetch").mockImplementation(async address => {
    const bytes = archives.get(String(address));
    if (!bytes) throw new Error("Unexpected network request: " + address);
    return new Response(bytes.slice());
  });
  restoreFetch = () => fetchMock.mockRestore();
});
afterEach(async () => {
  restoreFetch();
  await mkdir(".deleted", { recursive: true });
  await rename(directory, join(resolve(".deleted"), basename(directory)));
});

function available(build = newer) {
  const fixture = bundleFixture(build);
  archives.set(fixture.update.url, fixture.archive);
  return fixture;
}

test("staging leaves embedded assets active and scheduled updates start on the next launch", async () => {
  const fixture = available();
  const storage = await createBunUpdateHost(cache, builtin, source.repository);
  const identifier = await storage.host.stage(fixture.update);
  expect(storage.getFiles()).toBeUndefined();
  await storage.host.schedule(identifier);
  const reopened = await createBunUpdateHost(cache, builtin, source.repository);
  expect(reopened.getBuild()).toEqual(newer);
  expect(await readFile(reopened.getFiles()!["/index.html"]!, "utf8")).toBe("<html>v2</html>");
  expect(await readFile(join(directory, "profile/settings.json"), "utf8")).toBe("settings must survive");
  expect(await readFile(join(directory, "profile/projects/project.rcn"), "utf8")).toBe("project must survive");
});

test("an unconfirmed first update returns to embedded assets and is not retried", async () => {
  const fixture = available();
  const first = await createBunUpdateHost(cache, builtin, source.repository);
  await first.host.schedule(await first.host.stage(fixture.update));
  const trial = await createBunUpdateHost(cache, builtin, source.repository);
  expect(trial.getBuild()).toEqual(newer);
  const recovered = await createBunUpdateHost(cache, builtin, source.repository);
  expect(recovered.getBuild()).toEqual(builtin);
  expect(recovered.getFiles()).toBeUndefined();
  await expect(recovered.host.stage(fixture.update)).rejects.toThrow("failed to start before");
  expect(await readFile(join(cache, fixture.manifest.archive.sha256, "bundle.zip"))).toEqual(fixture.archive);
});

test("a failed second update returns to the previous confirmed bundle", async () => {
  const first = available(newer);
  const second = available(newest);
  const storage = await createBunUpdateHost(cache, builtin, source.repository);
  await storage.host.activate(await storage.host.stage(first.update));
  await storage.host.ready();
  await storage.host.activate(await storage.host.stage(second.update));
  const recovered = await createBunUpdateHost(cache, builtin, source.repository);
  expect(recovered.getBuild()).toEqual(newer);
  await expect(recovered.host.stage(second.update)).rejects.toThrow("failed to start before");
  expect(await readFile(join(cache, second.manifest.archive.sha256, "web/index.html"), "utf8")).toBe("<html>v3</html>");
});

test("the watchdog rolls back an unconfirmed update but retains a confirmed update", async () => {
  const fixture = available();
  const storage = await createBunUpdateHost(cache, builtin, source.repository);
  await storage.host.activate(await storage.host.stage(fixture.update));
  expect(await storage.rollbackUnconfirmed()).toBe(true);
  expect(storage.getBuild()).toEqual(builtin);
  const replacement = available(newest);
  await storage.host.activate(await storage.host.stage(replacement.update));
  await storage.host.ready();
  expect(await storage.rollbackUnconfirmed()).toBe(false);
  expect((await createBunUpdateHost(cache, builtin, source.repository)).getBuild()).toEqual(newest);
});

test("a damaged archive is not scheduled and a later retry retains the incomplete attempt", async () => {
  const fixture = available();
  const damaged = Buffer.from(fixture.archive);
  damaged[50]! ^= 1;
  archives.set(fixture.update.url, damaged);
  const storage = await createBunUpdateHost(cache, builtin, source.repository);
  await expect(storage.host.stage(fixture.update)).rejects.toThrow("download is damaged");
  expect(storage.getFiles()).toBeUndefined();
  await writeFile(join(cache, fixture.manifest.archive.sha256, "unfinished.txt"), "retain this attempt");
  archives.set(fixture.update.url, fixture.archive);
  await storage.host.stage(fixture.update);
  expect(await readFile(join(cache, fixture.manifest.archive.sha256 + ".incomplete-1", "unfinished.txt"), "utf8")).toBe("retain this attempt");
  const reopened = await createBunUpdateHost(cache, builtin, source.repository);
  expect(reopened.getBuild()).toEqual(builtin);
});

test("an interrupted state replacement keeps the committed update and preserves the candidate", async () => {
  const fixture = available();
  const storage = await createBunUpdateHost(cache, builtin, source.repository);
  await storage.host.activate(await storage.host.stage(fixture.update));
  await storage.host.ready();
  await writeFile(join(cache, "state.json.next"), "{unfinished");
  const reopened = await createBunUpdateHost(cache, builtin, source.repository);
  expect(reopened.getBuild()).toEqual(newer);
  expect(await readFile(join(cache, "state.json.next.incomplete-1"), "utf8")).toBe("{unfinished");
});

test("a damaged primary state recovers the previous complete state", async () => {
  const fixture = available();
  const storage = await createBunUpdateHost(cache, builtin, source.repository);
  await storage.host.activate(await storage.host.stage(fixture.update));
  await storage.host.ready();
  await storage.host.ready(); // Both primary and backup now contain a confirmed launch.
  await writeFile(join(cache, "state.json"), "{broken");
  const reopened = await createBunUpdateHost(cache, builtin, source.repository);
  expect(reopened.getBuild()).toEqual(newer);
  expect((await readdir(cache)).includes(fixture.manifest.archive.sha256)).toBe(true);
});

test("a new native runtime never selects an incompatible cached bundle", async () => {
  const fixture = available();
  const storage = await createBunUpdateHost(cache, builtin, source.repository);
  await storage.host.activate(await storage.host.stage(fixture.update));
  await storage.host.ready();
  const replacement = { ...builtin, revision: "4".repeat(40), runtime: "b".repeat(64), sequence: 400 };
  const reopened = await createBunUpdateHost(cache, replacement, source.repository);
  expect(reopened.getBuild()).toEqual(replacement);
  expect(reopened.getFiles()).toBeUndefined();
});
