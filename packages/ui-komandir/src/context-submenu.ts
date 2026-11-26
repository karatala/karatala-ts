import type { Snippet } from "svelte";

export const contextSubmenu = Symbol("context-submenu");

export interface SubmenuItem {
  anchor: HTMLButtonElement;
  label: string;
  children: Snippet;
}

export interface ContextSubmenuHost {
  id: string;
  active: HTMLButtonElement | undefined;
  show(item: SubmenuItem, focus: boolean): void;
  leave(): void;
}
