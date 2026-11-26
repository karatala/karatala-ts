import type { CachedWorkerOptions, ShellWorkerScope } from "./scope";

// Derived from Rachana public/service-worker.js; its explicit reload behavior stays distinct from the listed shell.
export function installCachedShell(scope: ShellWorkerScope, options: CachedWorkerOptions): void {
  const cachePrefix = `${options.namespace}-${encodeURIComponent(scope.registration.scope)}-`;
  const cacheName = `${cachePrefix}${options.revision}`;
  const shellUrl = new URL("index.html", scope.registration.scope).href;
  scope.addEventListener("message", event => {
    if (event.data?.type === options.activationMessage) event.waitUntil(scope.skipWaiting());
  });
  scope.addEventListener("install", event => {
    event.waitUntil(scope.caches.open(cacheName).then(cache => cache.addAll(options.files.map(filename => new Request(new URL(filename, scope.registration.scope), { cache: "reload" })))));
  });
  scope.addEventListener("activate", event => {
    event.waitUntil(scope.caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(cachePrefix) && key !== cacheName).map(key => scope.caches.delete(key)))).then(() => scope.clients.claim()));
  });
  scope.addEventListener("fetch", event => {
    const requestUrl = new URL(event.request.url);
    if (event.request.method !== "GET" || requestUrl.origin !== scope.location.origin || !requestUrl.href.startsWith(scope.registration.scope)) return;
    const relativePath = requestUrl.pathname.slice(new URL(scope.registration.scope).pathname.length);
    if (relativePath.startsWith("src/") || relativePath.startsWith("node_modules/") || relativePath.startsWith("@")) return;
    const navigation = event.request.mode === "navigate" && (relativePath === "" || relativePath === "index.html");
    event.respondWith(scope.caches.open(cacheName).then(async cache => {
      const key = navigation ? shellUrl : event.request;
      if (event.request.cache === "reload") {
        const response = await scope.fetch(event.request);
        if (response.ok) await cache.put(key, response.clone());
        return response;
      }
      return (await cache.match(key)) ?? scope.fetch(event.request);
    }));
  });
}
