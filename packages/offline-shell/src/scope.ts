export interface WorkerLifetimeEvent { waitUntil(work: Promise<unknown>): void }
export interface WorkerFetchEvent { request: Request; respondWith(response: Promise<Response>): void }
export interface ShellWorkerScope {
  registration: { scope: string };
  location: { origin: string };
  caches: Pick<CacheStorage, "open" | "keys" | "delete">;
  clients: { claim(): Promise<void> };
  fetch: typeof fetch;
  skipWaiting(): Promise<void>;
  addEventListener(type: "install" | "activate", listener: (event: WorkerLifetimeEvent) => void): void;
  addEventListener(type: "fetch", listener: (event: WorkerFetchEvent) => void): void;
  addEventListener(type: "message", listener: (event: WorkerLifetimeEvent & { data?: { type?: unknown } }) => void): void;
}
export interface ShellWorkerOptions { namespace: string; revision: string; files: string[] }
export interface CachedWorkerOptions extends ShellWorkerOptions { activationMessage: string }
export interface DevelopmentWorkerOptions { namespace: string; revision: string; manifestPath: string; activationMessage: string }
