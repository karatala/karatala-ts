import { startupIcons } from "./icons";

export const startupLabels = {
  loading: "Loading application...", errorTitle: "Application error", errorDetails: "Error details",
  copy: "Copy error", copied: "Copied", copyManually: "Select the error text and copy it manually.",
  reload: "Reload application", minimize: "Minimize", maximize: "Maximize or restore", close: "Close",
};
export type StartupLabels = typeof startupLabels;
export interface StartupMarkup { title: string; logoUrl: string; labels?: StartupLabels }

function escapeHtml(text: string): string {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return text.replace(/[&<>"']/g, character => entities[character]!);
}
function iconButton(action: keyof typeof startupIcons, label: string): string {
  return `<button type="button" data-startup-action="${action}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${startupIcons[action]}"></path></svg></button>`;
}
export function startupMarkup({ title, logoUrl, labels = startupLabels }: StartupMarkup): string {
  return `<div id="startup" data-karatala-startup data-state="loading" role="status" aria-live="polite">
    <header id="startup-header" data-startup-header data-webview-drag-region="deep" hidden>
      <span class="startup-title">${escapeHtml(title)}</span>
      <div class="startup-window-actions" data-webview-drag-region="false">${iconButton("minimize", labels.minimize)}${iconButton("maximize", labels.maximize)}${iconButton("close", labels.close)}</div>
    </header>
    <div class="startup-loading" data-startup-loading><img src="${escapeHtml(logoUrl)}" alt="" width="112" height="112"><span data-startup-phase>${escapeHtml(labels.loading)}</span></div>
    <div class="startup-error-panel" data-startup-error hidden>
      <div class="startup-error-actions">${iconButton("copy", labels.copy)}${iconButton("reload", labels.reload)}</div>
      <textarea data-startup-details readonly rows="12" wrap="off" aria-label="${escapeHtml(labels.errorDetails)}"></textarea>
    </div>
  </div>`;
}
