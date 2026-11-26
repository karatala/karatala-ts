import { installListedShell } from "./listed-shell";
import { installCachedShell } from "./cached-shell";
import { installDevelopmentShell } from "./development-shell";
import type { ShellWorkerOptions, CachedWorkerOptions, DevelopmentWorkerOptions } from "./scope";
export type { ShellWorkerOptions, CachedWorkerOptions, DevelopmentWorkerOptions, ShellWorkerScope } from "./scope";

export function listedShellWorkerSource(options: ShellWorkerOptions): string {
  return `(${installListedShell.toString()})(self, ${JSON.stringify(options)});\n`;
}
export function cachedShellWorkerSource(options: CachedWorkerOptions): string {
  return `(${installCachedShell.toString()})(self, ${JSON.stringify(options)});\n`;
}
export function developmentShellWorkerSource(options: DevelopmentWorkerOptions): string {
  return `(${installDevelopmentShell.toString()})(self, ${JSON.stringify(options)});\n`;
}
