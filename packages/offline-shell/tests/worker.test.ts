import { expect, test } from "bun:test";
import { cachedShellWorkerSource, developmentShellWorkerSource, listedShellWorkerSource } from "../src/index";

function fixture(source: string) {
  const handlers = new Map<string, (event: any) => void>();
  const stores = new Map<string, Map<string, Response>>();
  const network = new Map<string, Response>();
  const batches: string[][] = [];
  const calls: string[] = [];
  let claimed = 0;
  let skipped = 0;
  let offline = false;
  let failInstall = false;
  const keyOf = (request: RequestInfo | URL) => typeof request === "string" ? request : request instanceof URL ? request.href : request.url;
  const scope = {
    registration: { scope: "https://example.test/listener/" }, location: { origin: "https://example.test" },
    clients: { claim: async () => { claimed += 1; } }, skipWaiting: async () => { skipped += 1; },
    addEventListener(type: string, listener: (event: any) => void) { handlers.set(type, listener); },
    fetch: async (request: RequestInfo | URL) => {
      const key = keyOf(request);
      calls.push(key);
      if (offline) throw new Error("Offline");
      return (network.get(key) ?? new Response("network")).clone();
    },
    caches: {
      keys: async () => [...stores.keys()],
      delete: async (name: string) => stores.delete(name),
      open: async (name: string) => {
        const store = stores.get(name) ?? new Map<string, Response>();
        stores.set(name, store);
        return {
          addAll: async (requests: Request[]) => {
            batches.push(requests.map(keyOf));
            if (failInstall) throw new Error("Missing shell asset");
            for (const request of requests) store.set(keyOf(request), new Response("cached:" + keyOf(request)));
          },
          match: async (request: RequestInfo) => store.get(keyOf(request))?.clone(),
          put: async (request: RequestInfo, response: Response) => { store.set(keyOf(request), response.clone()); },
        };
      },
    },
  };
  new Function("self", source)(scope);
  async function lifetime(type: string, data?: unknown) {
    const work: Promise<unknown>[] = [];
    handlers.get(type)?.({ data, waitUntil: (pending: Promise<unknown>) => work.push(pending) });
    await Promise.all(work);
  }
  async function fetch(url: string, options: RequestInit & { navigation?: boolean } = {}) {
    const { navigation, ...init } = options;
    const request = new Request(url, init);
    if (navigation) Object.defineProperty(request, "mode", { value: "navigate" });
    let response: Promise<Response> | undefined;
    handlers.get("fetch")?.({ request, respondWith: (pending: Promise<Response>) => { response = pending; } });
    return response ? (await response).text() : null;
  }
  return { scope, handlers, stores, network, batches, calls, lifetime, fetch, claimed: () => claimed, skipped: () => skipped, goOffline: () => { offline = true; }, failInstall: () => { failInstall = true; } };
}
const listedOptions = { namespace: "listener-shell", revision: "r2", files: ["index.html", "main.js"] };

test("generated listed worker has no module closure and caches only its declared shell", async () => {
  const sample = fixture(listedShellWorkerSource(listedOptions));
  await sample.lifetime("install");
  expect(await sample.fetch("https://example.test/listener/?page=saved", { navigation: true })).toContain("index.html");
  expect(await sample.fetch("https://example.test/listener/main.js")).toContain("main.js");
  expect(await sample.fetch("https://example.test/listener/audio.mp3")).toBeNull();
  expect(await sample.fetch("https://other.test/listener/main.js")).toBeNull();
  expect(await sample.fetch("https://example.test/listener/main.js", { method: "POST" })).toBeNull();
  expect(sample.calls).toEqual([]);
  expect(sample.skipped()).toBe(0);
  expect(sample.claimed()).toBe(0);
  expect(sample.handlers.has("message")).toBe(false);
});
test("activation removes only older caches for this application and registration scope", async () => {
  const sample = fixture(listedShellWorkerSource(listedOptions));
  const prefix = `listener-shell-${encodeURIComponent(sample.scope.registration.scope)}-`;
  sample.stores.set(prefix + "r1", new Map());
  sample.stores.set("another-app-r1", new Map());
  sample.stores.set(`listener-shell-${encodeURIComponent("https://example.test/other/")}-r1`, new Map());
  await sample.lifetime("install");
  await sample.lifetime("activate");
  expect(sample.stores.has(prefix + "r1")).toBe(false);
  expect(sample.stores.has(prefix + "r2")).toBe(true);
  expect(sample.stores.size).toBe(3);
  expect(sample.claimed()).toBe(1);
});
test("failed installation never requests immediate activation or claims clients", async () => {
  const sample = fixture(listedShellWorkerSource(listedOptions));
  sample.failInstall();
  await expect(sample.lifetime("install")).rejects.toThrow("Missing shell asset");
  expect(sample.claimed()).toBe(0);
  expect(sample.skipped()).toBe(0);
});
test("Rachana cache policy keeps explicit reload and activation separate", async () => {
  const sample = fixture(cachedShellWorkerSource({ ...listedOptions, activationMessage: "EXPLICIT_ACTIVATE" }));
  await sample.lifetime("install");
  await sample.lifetime("message", { type: "OTHER" });
  expect(sample.skipped()).toBe(0);
  await sample.lifetime("message", { type: "EXPLICIT_ACTIVATE" });
  expect(sample.skipped()).toBe(1);
  expect(await sample.fetch("https://example.test/listener/src/main.ts")).toBeNull();
  expect(await sample.fetch("https://example.test/listener/node_modules/runtime.js")).toBeNull();
  expect(await sample.fetch("https://example.test/listener/@dev/module.js")).toBeNull();
  const url = "https://example.test/listener/main.js";
  sample.network.set(url, new Response("fresh"));
  expect(await sample.fetch(url, { cache: "reload" })).toBe("fresh");
  sample.goOffline();
  expect(await sample.fetch(url)).toBe("fresh");
});
test("development batches its manifest and falls back only after a network failure", async () => {
  const sample = fixture(developmentShellWorkerSource({ namespace: "listener-development", revision: "v1", manifestPath: "@dev/offline.json", activationMessage: "EXPLICIT_ACTIVATE" }));
  sample.network.set("https://example.test/listener/@dev/offline.json", Response.json(["index.html", ...Array.from({ length: 17 }, (_, idx) => `chunk-${idx}.js`)]));
  await sample.lifetime("install");
  expect(sample.batches.map(batch => batch.length)).toEqual([8, 8, 2]);
  expect(await sample.fetch("https://example.test/listener/@dev/offline.json")).toBeNull();
  expect(await sample.fetch("https://example.test/listener/chunk-1.js")).toBe("network");
  sample.goOffline();
  expect(await sample.fetch("https://example.test/listener/chunk-1.js")).toBe("network");
  expect(await sample.fetch("https://example.test/listener/?page=saved", { navigation: true })).toContain("index.html");
  await expect(sample.fetch("https://example.test/listener/chunk-1.js", { cache: "reload" })).rejects.toThrow("Offline");
});
