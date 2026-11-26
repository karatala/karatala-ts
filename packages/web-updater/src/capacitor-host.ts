import { CapacitorHttp, registerPlugin } from "@capacitor/core";
import type { CapacitorUpdaterPlugin, BundleInfo } from "@capgo/capacitor-updater";
import { createWebUpdater, readWebBuild, type ReadJson, type UpdateSource, type WebBuild } from "./core";

interface StartupInfo { build: unknown; coldStart: boolean; }
const versionOf = (build: WebBuild) => `r${build.runtime}.${build.sequence}.${build.revision}`;

export async function createCapacitorWebUpdater(source: UpdateSource, running: WebBuild) {
  // Register directly to keep the optional plugin's browser-history hooks out of application storage.
  const plugin = registerPlugin<CapacitorUpdaterPlugin>("CapacitorUpdater");
  const information = registerPlugin<{ startup(): Promise<StartupInfo> }>("WebUpdateInfo");
  const startup = await information.startup();
  const builtin = readWebBuild(startup.build);
  const current = (await plugin.current()).bundle;
  async function reloadBuiltin(markFailed: boolean) {
    if (markFailed && current.id !== "builtin") await plugin.setBundleError({ id: current.id });
    await plugin.reset({ toLastSuccessful: false });
    return await new Promise<never>(() => {}); // The native host reloads the document.
  }
  if (current.id !== "builtin" && current.version !== versionOf(running)) return await reloadBuiltin(true);
  if (running.appId !== builtin.appId) return await reloadBuiltin(true);
  if (running.runtime !== builtin.runtime || running.sequence < builtin.sequence || !builtin.revision && current.id !== "builtin") return await reloadBuiltin(false);
  const bundles = (await plugin.list()).bundles;
  if (startup.coldStart && builtin.revision) {
    const candidates = bundles.flatMap(bundle => {
      const match = /^r([a-f0-9]{64})\.([0-9]+)\.([a-f0-9]{40,64})$/.exec(bundle.version);
      const sequence = match ? Number(match[2]) : 0;
      return match && match[1] === builtin.runtime && sequence > running.sequence && Number.isSafeInteger(sequence) && ["pending", "success"].includes(bundle.status) ? [{ bundle, sequence }] : [];
    }).sort((first, second) => second.sequence - first.sequence);
    if (candidates[0]) {
      await plugin.set({ id: candidates[0].bundle.id });
      return await new Promise<never>(() => {});
    }
  }
  const json: ReadJson = async (url, headers = {}) => {
    const response = await CapacitorHttp.get({ url, headers, responseType: "json", connectTimeout: 30000, readTimeout: 30000 });
    if (response.status === 404) return null;
    const serialized = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    if (response.status !== 200 || !serialized || serialized.length > 1024 * 1024) throw new Error("Cannot read the update information. Check your internet connection and try again.");
    return typeof response.data === "string" ? JSON.parse(response.data) : response.data;
  };
  const staged = new Set<string>();
  return createWebUpdater(source, running, {
    async ready() { await plugin.notifyAppReady(); },
    async stage(update) {
      const version = versionOf(update.manifest);
      const previous = (await plugin.list()).bundles.filter(bundle => bundle.version === version);
      if (previous.some(bundle => bundle.status === "error")) throw new Error("This update failed to start before. Keep the working version and wait for a newer release.");
      let bundle: BundleInfo | undefined = previous.find(bundle => ["pending", "success"].includes(bundle.status));
      bundle ??= await plugin.download({ url: update.url, version, checksum: update.manifest.archive.sha256 });
      staged.add(bundle.id);
      return bundle.id;
    },
    async schedule(identifier) {
      if (!staged.has(identifier)) throw new Error("Download and verify the update before applying it.");
      // Downloaded bundles are selected on a new native process launch, never on background entry.
    },
    async activate(identifier) {
      if (!staged.has(identifier)) throw new Error("Download and verify the update before applying it.");
      await plugin.set({ id: identifier });
    }
  }, json);
}
