import { createHash } from "node:crypto";
import { mkdir, readFile, rename, lstat, open } from "node:fs/promises";
import { dirname, join } from "node:path";
import { readWebBuild, type AvailableUpdate, type WebBuild, type WebUpdateHost } from "./core";
import { unpackWebUpdate, updatePath } from "./zip";

interface UpdateState { builtin: string; current?: string; previous?: string; next?: string; trial?: boolean; failed: string[]; }
interface BundleFiles { build: WebBuild; files: Record<string, string>; }
const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const validIdentifier = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);

async function existing(path: string) {
  try { return await lstat(path); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
}

async function preserve(path: string) {
  if (!await existing(path)) return;
  let sequence = 1;
  while (await existing(`${path}.incomplete-${sequence}`)) sequence++;
  await rename(path, `${path}.incomplete-${sequence}`);
}

async function verifiedWrite(path: string, bytes: Uint8Array) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.next`;
  if (await existing(temporary)) await preserve(temporary);
  const file = await open(temporary, "wx", 0o600);
  try { await file.writeFile(bytes); await file.sync(); } finally { await file.close(); }
  if (digest(await readFile(temporary)) !== digest(bytes)) throw new Error("Cannot verify the saved update. Free some storage space and try again.");
  await rename(temporary, path);
}

export async function createBunUpdateHost(root: string, builtin: WebBuild, repository: string) {
  const statePath = join(root, "state.json");
  const emptyState = (): UpdateState => ({ builtin: builtin.revision, failed: [] });
  let state = emptyState();
  let lastSaved: Uint8Array | undefined;
  let saving = Promise.resolve();
  await mkdir(root, { recursive: true, mode: 0o700 });
  if ((await lstat(root)).isSymbolicLink()) throw new Error("Cannot use the update cache through a symbolic link. Move it to a local folder and restart the application.");
  for (const candidate of [statePath, statePath + ".backup"]) {
    if (!await existing(candidate)) continue;
    try {
      const bytes = await readFile(candidate);
      const saved = JSON.parse(bytes.toString("utf8")) as UpdateState;
      if (typeof saved.builtin !== "string" || !Array.isArray(saved.failed) || !saved.failed.every(validIdentifier) || [saved.current, saved.previous, saved.next].some(value => value !== undefined && !validIdentifier(value)) || saved.trial !== undefined && typeof saved.trial !== "boolean") continue;
      state = saved.builtin === builtin.revision ? saved : emptyState();
      lastSaved = bytes;
      break;
    } catch { /* A damaged primary can recover from its last complete backup. */ }
  }
  function saveState() {
    const bytes = Buffer.from(JSON.stringify(state));
    saving = saving.catch(() => {}).then(async () => {
      if (lastSaved) await verifiedWrite(statePath + ".backup", lastSaved);
      await verifiedWrite(statePath, bytes);
      lastSaved = bytes;
    });
    return saving;
  }
  async function verifiedBundle(identifier: string): Promise<BundleFiles> {
    if (!validIdentifier(identifier)) throw new Error("Invalid saved update. Restart with the complete application package.");
    const directory = join(root, identifier);
    if ((await lstat(directory)).isSymbolicLink()) throw new Error("Cannot read an update through a symbolic link.");
    const archivePath = join(directory, "bundle.zip");
    const archiveMetadata = await lstat(archivePath);
    if (!archiveMetadata.isFile() || archiveMetadata.isSymbolicLink() || archiveMetadata.size > 256 * 1024 * 1024) throw new Error("The saved update archive is invalid. Restart with the complete application package.");
    const archive = await readFile(archivePath);
    if (digest(archive) !== identifier) throw new Error("The saved update is damaged. Restart with the complete application package.");
    const unpacked = unpackWebUpdate(archive);
    const build = readWebBuild(JSON.parse(new TextDecoder().decode(unpacked.get("app-build.json"))));
    if (build.appId !== builtin.appId || build.runtime !== builtin.runtime || build.sequence <= builtin.sequence) throw new Error("The saved update needs another application version. Install the complete current package.");
    const files: Record<string, string> = {};
    for (const [name, expected] of unpacked) {
      updatePath(name);
      const path = join(directory, "web", name);
      let parent = dirname(path);
      while (parent !== directory) { if ((await lstat(parent)).isSymbolicLink()) throw new Error("Cannot read an update through a symbolic link."); parent = dirname(parent); }
      const metadata = await lstat(path);
      if (!metadata.isFile() || metadata.isSymbolicLink() || metadata.size !== expected.length || digest(await readFile(path)) !== digest(expected)) throw new Error("A saved update file is damaged. Restart with the complete application package.");
      files[`/${name}`] = path;
    }
    return { build, files };
  }
  let selected: BundleFiles | undefined;
  if (state.trial && state.current) {
    state.failed.push(state.current);
    state.current = state.previous;
    state.previous = undefined;
    state.trial = false;
  }
  if (state.next && !state.failed.includes(state.next)) {
    state.previous = state.current;
    state.current = state.next;
    state.next = undefined;
    state.trial = true;
  }
  if (state.current) {
    try { selected = await verifiedBundle(state.current); }
    catch (error) {
      console.error("Saved web update rejected.", error);
      state.failed.push(state.current);
      state.current = state.previous;
      state.previous = undefined;
      state.trial = false;
      if (state.current) {
        try { selected = await verifiedBundle(state.current); }
        catch { state.failed.push(state.current); state.current = undefined; }
      }
    }
  }
  await saveState();
  const staged = new Set<string>();
  const host: WebUpdateHost = {
    async ready() { state.trial = false; await saveState(); },
    async stage(update: AvailableUpdate) {
      const manifest = update.manifest;
      const prefix = `https://github.com/${repository}/releases/download/${encodeURIComponent(manifest.version)}/`;
      if (manifest.appId !== builtin.appId || manifest.runtime !== builtin.runtime || manifest.sequence <= (selected?.build.sequence ?? builtin.sequence) || !validIdentifier(manifest.archive.sha256) || update.url !== prefix + manifest.archive.name) throw new Error("This web update does not match the installed application. Install the complete current package.");
      const identifier = manifest.archive.sha256;
      if (state.failed.includes(identifier)) throw new Error("This update failed to start before. Keep the working version and wait for a newer release.");
      try { await verifiedBundle(identifier); staged.add(identifier); return identifier; } catch { /* Retain an incomplete attempt before downloading a replacement. */ }
      const directory = join(root, identifier);
      await preserve(directory);
      await mkdir(directory, { recursive: true, mode: 0o700 });
      const response = await fetch(update.url, { signal: AbortSignal.timeout(300000) });
      if (!response.ok || !response.body) throw new Error("Cannot download the update. Check your internet connection and try again.");
      const chunks: Uint8Array[] = [];
      let size = 0;
      const reader = response.body.getReader();
      try {
        while (true) {
          const next = await reader.read();
          if (next.done) break;
          size += next.value.length;
          if (size > manifest.archive.size || size > 256 * 1024 * 1024) throw new Error("The update download is larger than expected. Keep the installed version and try again later.");
          chunks.push(next.value);
        }
      } finally { await reader.cancel(); }
      const archive = Buffer.concat(chunks, size);
      if (size !== manifest.archive.size || digest(archive) !== identifier) throw new Error("The update download is damaged. Keep the installed version and try again.");
      const unpacked = unpackWebUpdate(archive);
      const build = readWebBuild(JSON.parse(new TextDecoder().decode(unpacked.get("app-build.json"))));
      if (["appId", "runtime", "version", "revision", "sequence"].some(key => build[key as keyof WebBuild] !== manifest[key as keyof WebBuild])) throw new Error("The update contents belong to another release. Keep the installed version and try again later.");
      for (const [name, bytes] of unpacked) await verifiedWrite(join(directory, "web", name), bytes);
      await verifiedWrite(join(directory, "bundle.zip"), archive);
      await verifiedBundle(identifier);
      staged.add(identifier);
      return identifier;
    },
    async schedule(identifier: string) {
      if (!staged.has(identifier)) throw new Error("Download and verify the update before applying it.");
      if (identifier === state.current) return;
      state.next = identifier;
      await saveState();
    },
    async activate(identifier: string) {
      await this.schedule(identifier);
      const bundle = await verifiedBundle(identifier);
      state.previous = state.current;
      state.current = identifier;
      state.next = undefined;
      state.trial = true;
      await saveState();
      selected = bundle;
    }
  };
  return { host, getBuild: () => selected?.build ?? builtin, getFiles: () => selected?.files, async rollbackUnconfirmed() {
    if (!state.trial || !state.current) return false;
    state.failed.push(state.current);
    state.current = state.previous;
    state.previous = undefined;
    state.next = undefined;
    state.trial = false;
    let fallback: BundleFiles | undefined;
    if (state.current) {
      try { fallback = await verifiedBundle(state.current); }
      catch { state.failed.push(state.current); state.current = undefined; }
    }
    await saveState();
    selected = fallback;
    return true;
  } };
}
