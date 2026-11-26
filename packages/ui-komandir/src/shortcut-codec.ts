export interface KeyboardShortcut {
  code?: string;
  alt?: boolean;
  ctrl?: boolean;
  key: string;
  meta?: boolean;
  shift?: boolean;
}
interface ShortcutEvent {
  code?: string;
  altKey: boolean;
  ctrlKey: boolean;
  key: string;
  metaKey: boolean;
  shiftKey: boolean;
}
export type ShortcutCommandId = string;
export type ShortcutBindings = Record<string, KeyboardShortcut[]>;
function normalizeShortcutKey(key: string): string {
  return key.length === 1 ? key.toLocaleLowerCase() : key;
}
export function shortcutFromEvent(event: ShortcutEvent): KeyboardShortcut | null {
  if (["Alt", "Control", "Meta", "Shift"].includes(event.key)) {
    return null;
  }
  const code = event.ctrlKey && event.altKey && event.code && /^Key[A-Z]$/.test(event.code) ? event.code : undefined;
  return { ...(event.altKey ? { alt: true } : {}), ...(event.ctrlKey ? { ctrl: true } : {}), ...(code ? { code } : {}), key: code ? code.slice(3).toLocaleLowerCase() : normalizeShortcutKey(event.key), ...(event.metaKey ? { meta: true } : {}), ...(event.shiftKey ? { shift: true } : {}) };
}

export function shortcutSignature(shortcut: KeyboardShortcut): string {
  return `${shortcut.ctrl ? "1" : "0"}${shortcut.alt ? "1" : "0"}${shortcut.shift ? "1" : "0"}${shortcut.meta ? "1" : "0"}:${normalizeShortcutKey(shortcut.key)}:${shortcut.code ?? ""}`;
}

export function formatShortcut(shortcut: KeyboardShortcut): string {
  const keyLabels: Record<string, string> = { " ": "Space", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right", ArrowUp: "Up" };
  const parts: string[] = [];
  if (shortcut.ctrl) {
    parts.push("Ctrl");
  }
  if (shortcut.alt) {
    parts.push("Alt");
  }
  if (shortcut.shift) {
    parts.push("Shift");
  }
  if (shortcut.meta) {
    parts.push("Meta");
  }
  parts.push(keyLabels[shortcut.key] ?? shortcut.key.toLocaleUpperCase());
  return parts.join("+");
}
