import { releasePointerFocus } from "@karatala/dom-input";
import { startupLabels, type StartupLabels } from "./markup";
export { startupMarkup, startupLabels, type StartupLabels, type StartupMarkup } from "./markup";

export interface StartupActions {
  copy(text: string): Promise<void>;
  reload(): void;
  window?: { minimize(): unknown; maximize(): unknown; close(): unknown };
}
export interface StartupController {
  setStatus(message: string): void;
  showError(message: string): void;
  complete(): void;
  dispose(): void;
}

export function connectStartup(root: HTMLElement, { labels = startupLabels, actions }: { labels?: StartupLabels; actions: StartupActions }): StartupController {
  const document = root.ownerDocument;
  const view = document.defaultView!;
  const parent = root.parentElement!;
  const header = root.querySelector<HTMLElement>("[data-startup-header]")!;
  const loading = root.querySelector<HTMLElement>("[data-startup-loading]")!;
  const phase = root.querySelector<HTMLElement>("[data-startup-phase]")!;
  const errorPanel = root.querySelector<HTMLElement>("[data-startup-error]")!;
  const details = root.querySelector<HTMLTextAreaElement>("[data-startup-details]")!;
  const buttons = [...root.querySelectorAll<HTMLButtonElement>("button[data-startup-action]")];
  const copyButton = root.querySelector<HTMLButtonElement>('[data-startup-action="copy"]')!;
  const previousInert = new Map<HTMLElement, boolean>();
  let state: "loading" | "complete" | "error" | "disposed" = "loading";

  function labelButton(button: HTMLButtonElement, label: string) { button.setAttribute("aria-label", label); button.title = label; }
  phase.textContent = labels.loading;
  details.setAttribute("aria-label", labels.errorDetails);
  header.hidden = !actions.window;
  root.dataset.window = String(!!actions.window);
  for (const button of buttons) {
    labelButton(button, labels[button.dataset.startupAction as "copy" | "reload" | "minimize" | "maximize" | "close"]);
    button.addEventListener("pointerup", releasePointerFocus);
  }
  function restoreBackground() {
    for (const [element, inert] of previousInert) element.inert = inert;
    previousInert.clear();
    view.removeEventListener("keydown", keyDown, true);
  }
  function keyDown(event: KeyboardEvent) {
    if (state !== "error" || event.key !== "Tab") return;
    const controls = [...root.querySelectorAll<HTMLElement>("button, textarea")].filter(element => !element.closest("[hidden]") && !element.matches(":disabled"));
    const first = controls[0] ?? details;
    const last = controls.at(-1) ?? details;
    if (!root.contains(document.activeElement) || event.shiftKey && document.activeElement === first || !event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  }
  async function copy() {
    const text = details.value;
    try {
      await actions.copy(text);
      if (state === "error" && details.value === text) labelButton(copyButton, labels.copied);
    } catch {
      if (state !== "error" || details.value !== text) return;
      details.focus(); details.select();
      labelButton(copyButton, labels.copyManually);
    }
  }
  function click(event: MouseEvent) {
    if (state === "disposed" || state === "complete" || !(event.target instanceof view.Element)) return;
    const action = event.target.closest<HTMLButtonElement>("button[data-startup-action]")?.dataset.startupAction;
    if (action === "copy") void copy();
    else if (action === "reload") actions.reload();
    else if (action === "minimize" || action === "maximize" || action === "close") void actions.window?.[action]();
  }
  root.addEventListener("click", click);
  return {
    setStatus(message) { if (state === "loading") phase.textContent = message; },
    showError(message) {
      if (state === "disposed") return;
      state = "error";
      if (!root.isConnected) parent.append(root);
      root.dataset.state = "error";
      root.setAttribute("role", "dialog");
      root.setAttribute("aria-modal", "true");
      root.setAttribute("aria-label", labels.errorTitle);
      root.removeAttribute("aria-live");
      loading.hidden = true;
      errorPanel.hidden = false;
      details.value = message;
      labelButton(copyButton, labels.copy);
      for (const element of parent.children) if (element !== root && element instanceof view.HTMLElement && !previousInert.has(element)) { previousInert.set(element, element.inert); element.inert = true; }
      view.addEventListener("keydown", keyDown, true);
      details.focus();
    },
    complete() { if (state !== "loading") return; state = "complete"; restoreBackground(); root.remove(); },
    dispose() {
      if (state === "disposed") return;
      state = "disposed";
      restoreBackground();
      root.removeEventListener("click", click);
      for (const button of buttons) button.removeEventListener("pointerup", releasePointerFocus);
      root.remove();
    },
  };
}
