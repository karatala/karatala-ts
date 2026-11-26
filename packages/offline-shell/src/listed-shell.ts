import type { ShellWorkerOptions, ShellWorkerScope } from "./scope";

// Derived from Shravanam public/service-worker.js. Keep the whole function self-contained for serialization.
export function installListedShell(scope: ShellWorkerScope, options: ShellWorkerOptions): void {
  const cachePrefix = `${options.namespace}-${encodeURIComponent(scope.registration.scope)}-`;
  const cacheName = `${cachePrefix}${options.revision}`;
  const shellUrl = new URL("index.html", scope.registration.scope).href;
  const shellUrls = new Set(options.files.map(filename => new URL(filename, scope.registration.scope).href));
  scope.addEventListener("install", event => {
    event.waitUntil(scope.caches.open(cacheName).then(cache => cache.addAll([...shellUrls].map(url => new Request(url, { cache: "reload" })))));
  });
  scope.addEventListener("activate", event => {
    event.waitUntil(scope.caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(cachePrefix) && key !== cacheName).map(key => scope.caches.delete(key)))).then(() => scope.clients.claim()));
  });
  scope.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;
    const url = new URL(event.request.url);
    const isHome = event.request.mode === "navigate" && (url.pathname === new URL(scope.registration.scope).pathname || url.pathname === new URL(shellUrl).pathname) && url.origin === scope.location.origin;
    const key = isHome ? shellUrl : url.href;
    if (!shellUrls.has(key)) return;
    event.respondWith(scope.caches.open(cacheName).then(async cache => (await cache.match(key)) ?? scope.fetch(event.request)));
  });
}
