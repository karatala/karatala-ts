import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { connectStartup, startupMarkup, type StartupActions } from "../src/index";

function fixture(overrides: Partial<StartupActions> = {}) {
  const window = new Window({ url: "http://localhost/" });
  const document = window.document;
  document.body.innerHTML = '<div id="app">Application</div><div id="already-inert"></div>' + startupMarkup({ title: '<Example "app">', logoUrl: './icon.svg" data-extra="bad' });
  const app = document.getElementById("app")!;
  const existing = document.getElementById("already-inert")!;
  app.inert = false; existing.inert = true;
  const root = document.getElementById("startup")!;
  const copied: string[] = [];
  const calls: string[] = [];
  const controller = connectStartup(root as unknown as HTMLElement, { actions: { copy: async text => { copied.push(text); }, reload: () => { calls.push("reload"); }, ...overrides } });
  const button = (action: string) => root.querySelector<HTMLButtonElement>(`[data-startup-action="${action}"]`)!;
  return { window, document, root, app, existing, copied, calls, controller, button };
}

test("static markup is readable without a framework and escapes application data", async () => {
  const view = fixture();
  try {
    expect(view.root.getAttribute("role")).toBe("status");
    expect(view.root.querySelector(".startup-title")?.textContent).toBe('<Example "app">');
    expect(view.root.querySelector("img")?.hasAttribute("data-extra")).toBe(false);
    expect(view.root.querySelector<HTMLElement>("[data-startup-header]")?.hidden).toBe(true);
    expect(view.root.querySelector<HTMLElement>("[data-startup-error]")?.hidden).toBe(true);
    view.controller.setStatus("Preparing files");
    expect(view.root.querySelector("[data-startup-phase]")?.textContent).toBe("Preparing files");
  } finally { view.controller.dispose(); await view.window.happyDOM.abort(); }
});

test("failure can restore a removed loading screen and survives late completion", async () => {
  const view = fixture();
  try {
    view.controller.complete();
    expect(view.root.isConnected).toBe(false);
    expect(view.app.textContent).toBe("Application");
    const message = 'Cannot start. Reload. <script>unsafe()</script>';
    view.controller.showError(message);
    view.controller.complete();
    const field = view.root.querySelector<HTMLTextAreaElement>("textarea")!;
    expect(view.root.isConnected).toBe(true);
    expect(view.root.getAttribute("role")).toBe("dialog");
    expect(field.value).toBe(message);
    expect(view.root.querySelector("script")).toBeNull();
    expect(view.document.activeElement).toBe(field);
    expect(view.app.inert).toBe(true);
    field.dispatchEvent(new view.window.KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }));
    expect(view.document.activeElement).toBe(view.button("copy"));
  } finally { view.controller.dispose(); expect(view.app.inert).toBe(false); expect(view.existing.inert).toBe(true); await view.window.happyDOM.abort(); }
});

test("copy and reload use caller actions, with visible copy confirmation", async () => {
  const view = fixture();
  try {
    view.controller.showError("Reload this application.");
    view.button("copy").click();
    await Promise.resolve();
    expect(view.copied).toEqual(["Reload this application."]);
    expect(view.button("copy").getAttribute("aria-label")).toBe("Copied");
    view.button("reload").click();
    expect(view.calls).toEqual(["reload"]);
  } finally { view.controller.dispose(); await view.window.happyDOM.abort(); }
});

test("denied clipboard access selects the message for manual copying", async () => {
  const view = fixture({ copy: async () => { throw new Error("Access denied"); } });
  try {
    view.controller.showError("Select and copy this message.");
    view.button("copy").click();
    await Promise.resolve();
    const field = view.root.querySelector<HTMLTextAreaElement>("textarea")!;
    expect(view.document.activeElement).toBe(field);
    expect(field.selectionStart).toBe(0);
    expect(field.selectionEnd).toBe(field.value.length);
    expect(view.button("copy").getAttribute("aria-label")).toContain("copy it manually");
  } finally { view.controller.dispose(); await view.window.happyDOM.abort(); }
});

test("pending copy cannot label a different error as copied", async () => {
  let finishCopy = () => {};
  const view = fixture({ copy: () => new Promise<void>(resolve => { finishCopy = resolve; }) });
  try {
    view.controller.showError("First failure");
    view.button("copy").click();
    view.controller.showError("Second failure");
    finishCopy();
    await Promise.resolve();
    expect(view.button("copy").getAttribute("aria-label")).toBe("Copy error");
  } finally { view.controller.dispose(); await view.window.happyDOM.abort(); }
});

test("window actions are independent callbacks and disposal removes active controls", async () => {
  const actions: string[] = [];
  const view = fixture({ window: { minimize: () => actions.push("minimize"), maximize: () => actions.push("maximize"), close: () => actions.push("close") } });
  try {
    expect(view.root.querySelector<HTMLElement>("[data-startup-header]")?.hidden).toBe(false);
    for (const action of ["minimize", "maximize", "close"]) view.button(action).click();
    expect(actions).toEqual(["minimize", "maximize", "close"]);
    const reload = view.button("reload");
    view.controller.dispose();
    reload.click();
    view.controller.showError("Too late");
    expect(view.calls).toEqual([]);
    expect(view.root.isConnected).toBe(false);
  } finally { view.controller.dispose(); await view.window.happyDOM.abort(); }
});
