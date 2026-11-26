import type { DevelopmentWorkerOptions, ShellWorkerScope } from "./scope";

// Derived from Rachana public/service-worker-dev.js. This is a development-only network-first policy.
export function installDevelopmentShell(scope: ShellWorkerScope, options: DevelopmentWorkerOptions): void {
  const cacheName = `${options.namespace}-${encodeURIComponent(scope.registration.scope)}-${options.revision}`;
  const shellUrl = new URL("index.html", scope.registration.scope).href;
  const manifestUrl = new URL(options.manifestPath, scope.registration.scope);
  scope.addEventListener("message", event => {
    if (event.data?.type === options.activationMessage) event.waitUntil(scope.skipWaiting());
  });
  scope.addEventListener("install", event => {
    event.waitUntil((async () => {
      const response = await scope.fetch(manifestUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Could not read the development offline file list.");
      const files = await response.json() as string[];
      const cache = await scope.caches.open(cacheName);
      for (let idx = 0; idx < files.length; idx += 8) await cache.addAll(files.slice(idx, idx + 8).map(filename => new Request(new URL(filename, scope.registration.scope), { cache: "reload" })));
    })());
  });
  scope.addEventListener("activate", event => { event.waitUntil(scope.clients.claim()); });
  scope.addEventListener("fetch", event => {
    const url = new URL(event.request.url);
    if (event.request.method !== "GET" || url.origin !== scope.location.origin || !url.href.startsWith(scope.registration.scope) || url.pathname === manifestUrl.pathname) return;
    const navigation = event.request.mode === "navigate" && (url.pathname === new URL(scope.registration.scope).pathname || url.pathname === new URL(shellUrl).pathname);
    event.respondWith((async () => {
      const cache = await scope.caches.open(cacheName);
      const key = navigation ? shellUrl : event.request;
      try {
        const response = await scope.fetch(event.request);
        if (!response.ok) return response;
        try { await cache.put(key, response.clone()); }
        catch (error) { console.warn("Could not save the latest development file for offline use.", error); }
        return response;
      } catch (error) {
        if (event.request.cache === "reload") throw error;
        const cached = await cache.match(key);
        if (cached) return cached;
        throw error;
      }
    })());
  });
}
