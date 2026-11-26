export interface WebBuild {
  appId: string;
  runtime: string;
  version: string;
  revision: string;
  sequence: number;
}

export interface WebUpdate extends WebBuild {
  format: 1;
  archive: { name: string; size: number; sha256: string };
}

export interface UpdateSource {
  repository: string;
  manifestName: string;
  archiveName: string;
}

export function releaseAssetName(pattern: string, tag: string) {
  return pattern.replaceAll("{tag}", tag.replace(/[^a-zA-Z0-9._-]+/g, "-"));
}

export interface AvailableUpdate { manifest: WebUpdate; url: string; releaseUrl: string; }
export type UpdateCheck = { kind: "current" } | { kind: "native-required"; releaseUrl: string } | { kind: "available"; update: AvailableUpdate };
export type ReadJson = (url: string, headers?: Record<string, string>) => Promise<unknown>;
export interface WebUpdateHost {
  ready(): Promise<void>;
  stage(update: AvailableUpdate): Promise<string>;
  schedule(identifier: string): Promise<void>;
  activate(identifier: string): Promise<void>;
}

export function readWebBuild(value: unknown): WebBuild {
  const build = value as Partial<WebBuild> | null;
  if (!build || typeof build.appId !== "string" || !/^[a-zA-Z0-9.-]+$/.test(build.appId) || typeof build.runtime !== "string" || !/^[a-f0-9]{64}$/.test(build.runtime) || typeof build.version !== "string" || !build.version || build.version.length > 200 || typeof build.revision !== "string" || !/^[a-f0-9]{40,64}$/.test(build.revision) && !(build.revision === "" && build.sequence === 0) || !Number.isSafeInteger(build.sequence) || build.sequence! < 0) throw new Error("Cannot read the application version. Install a complete application package and try again.");
  return { appId: build.appId, runtime: build.runtime, version: build.version, revision: build.revision, sequence: build.sequence! };
}

export function readWebUpdate(value: unknown, archiveName: string): WebUpdate {
  const build = readWebBuild(value);
  const update = value as WebUpdate;
  if (update.format !== 1 || !update.archive || update.archive.name !== archiveName || !Number.isSafeInteger(update.archive.size) || update.archive.size <= 0 || update.archive.size > 256 * 1024 * 1024 || !/^[a-f0-9]{64}$/.test(update.archive.sha256)) throw new Error("Cannot read the update package. Keep the installed version and try again after a new release is available.");
  return { ...build, format: 1, archive: update.archive };
}

export async function readJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(30000), cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok || !response.body) throw new Error("Cannot check application updates. Check your internet connection and try again.");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.length;
      if (size > 1024 * 1024) throw new Error("The update information is too large. Keep the installed version and try again later.");
      chunks.push(next.value);
    }
  } finally { await reader.cancel(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function checkForWebUpdate(source: UpdateSource, current: WebBuild, json: ReadJson = readJson): Promise<UpdateCheck> {
  if (!current.revision) return { kind: "current" };
  if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(source.repository)) throw new Error("Set a GitHub repository in owner/project form, for example example/music-editor.");
  const release = await json(`https://api.github.com/repos/${source.repository}/releases/latest`, { Accept: "application/vnd.github+json", "User-Agent": current.appId, "X-GitHub-Api-Version": "2022-11-28" }) as { draft?: boolean; prerelease?: boolean; tag_name?: string; assets?: { name: string; browser_download_url: string; size: number; digest?: string }[] } | null;
  if (!release || release.draft || release.prerelease) return { kind: "current" };
  if (typeof release.tag_name !== "string" || !Array.isArray(release.assets)) throw new Error("Cannot read the GitHub release. Keep the installed version and try again later.");
  const releaseUrl = `https://github.com/${source.repository}/releases/tag/${encodeURIComponent(release.tag_name)}`;
  const prefix = `https://github.com/${source.repository}/releases/download/${encodeURIComponent(release.tag_name)}/`;
  const manifestName = releaseAssetName(source.manifestName, release.tag_name);
  const archiveName = releaseAssetName(source.archiveName, release.tag_name);
  const metadata = release.assets.find(asset => asset.name === manifestName);
  if (!metadata) return { kind: "current" };
  if (metadata.browser_download_url !== prefix + manifestName || metadata.size > 1024 * 1024) throw new Error("The update information has an unexpected address. Keep the installed version and use the project's GitHub releases.");
  const update = readWebUpdate(await json(metadata.browser_download_url), archiveName);
  if (update.appId !== current.appId || update.version !== release.tag_name) throw new Error("This update belongs to another application or release. Keep the installed version and use the project's GitHub releases.");
  if (update.revision === current.revision || update.sequence <= current.sequence) return { kind: "current" };
  if (update.runtime !== current.runtime) return { kind: "native-required", releaseUrl };
  const archive = release.assets.find(asset => asset.name === archiveName);
  if (!archive || archive.browser_download_url !== prefix + archiveName || archive.size !== update.archive.size || archive.digest && archive.digest !== `sha256:${update.archive.sha256}`) throw new Error("The update download does not match its description. Keep the installed version and try again later.");
  return { kind: "available", update: { manifest: update, url: archive.browser_download_url, releaseUrl } };
}

export function createWebUpdater(source: UpdateSource, current: WebBuild | (() => WebBuild), host: WebUpdateHost, json: ReadJson = readJson) {
  let preparing: Promise<{ check: UpdateCheck; identifier?: string }> | undefined;
  let prepared: { check: UpdateCheck; identifier?: string } | undefined;
  async function prepare(): Promise<{ check: UpdateCheck; identifier?: string }> {
    const check = await checkForWebUpdate(source, typeof current === "function" ? current() : current, json);
    return check.kind === "available" ? { check, identifier: await host.stage(check.update) } : { check };
  }
  return {
    ready: () => host.ready(),
    async applyPrepared() {
      const result = prepared;
      if (!result) throw new Error("Check and download the update before applying it.");
      if (result.identifier) await host.activate(result.identifier);
      return result.check;
    },
    async update(immediate = false, beforeActivate?: () => Promise<void>) {
      const pending = preparing ??= prepare();
      let result: Awaited<ReturnType<typeof prepare>>;
      try { result = await pending; } finally { if (preparing === pending) preparing = undefined; }
      prepared = result;
      if (result.identifier) {
        if (immediate) { await beforeActivate?.(); await host.activate(result.identifier); }
        else await host.schedule(result.identifier);
      }
      return result.check;
    }
  };
}
