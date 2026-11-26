export function createModuleLoader<Module extends object>(importModule: () => Promise<Module>) {
  let loaded: Module | undefined;
  let pending: Promise<Module> | undefined;
  return () => {
    if (loaded) return loaded;
    pending ??= importModule().then(module => { loaded = module; return module; }, error => { pending = undefined; throw error; });
    return pending;
  };
}
