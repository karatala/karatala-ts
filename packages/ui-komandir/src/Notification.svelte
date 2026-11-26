<script lang="ts">
  import Portal from "./Portal.svelte";
  import { useKomandirUiHost } from "./host";
  const { message } = useKomandirUiHost();
  import Icon from "./Icon.svelte";
  import IconButton from "./IconButton.svelte";
  import Button from "./Button.svelte";

  let { text, role = "alert", pending = false, link, action, onRetry, onClose }: { text: string; role?: "alert" | "status"; pending?: boolean; link?: { href: string; label: string; onOpen?(): void }; action?: { label: string; run(): void }; onRetry?(): void; onClose(): void } = $props();
</script>

<Portal to="body">
  <aside class="ui-notification" {role}>
    <p>{text}</p>
    <div class="notification-actions">
      {#if action}
        <Button disabled={pending} onclick={event => { action?.run(); if (event.detail) event.currentTarget.blur(); }}>{action.label}</Button>
      {/if}
      {#if link}
        <a class="ui-button" href={link.href} target="_blank" rel="noopener" onclick={event => { link?.onOpen?.(); if (event.detail) event.currentTarget.blur(); }}>{link.label}</a>
      {/if}
      {#if onRetry}
        <IconButton ghost label={message("Retry")} disabled={pending} aria-busy={pending} onclick={event => { onRetry?.(); if (event.detail) event.currentTarget.blur(); }}>
          <Icon name="navigation.reload" class={pending ? "notification-spinner" : ""} />
        </IconButton>
      {/if}
      <IconButton ghost class="ui-close-button" label={message("Dismiss notification")} onclick={event => { onClose(); if (event.detail) event.currentTarget.blur(); }}>
        <Icon name="sharedControls.remove" />
      </IconButton>
    </div>
  </aside>
</Portal>

<style>
  .ui-notification { position: fixed; top: 48px; right: 16px; z-index: 2400; display: flex; align-items: flex-start; gap: 8px; box-sizing: border-box; width: min(440px, calc(100vw - 32px)); max-height: calc(100dvh - 64px); padding: 10px; border-radius: var(--ui-corner-radius, 6px); color: var(--theme-workbench-foreground); background: color-mix(in srgb, var(--delete) 20%, var(--theme-workbench-surface)); box-shadow: var(--ui-popup-shadow); font-size: var(--ui-font-normal); line-height: 1.5; animation: notification-enter 150ms ease-out; }
  .ui-notification p { flex: 1; min-width: 0; max-height: 30dvh; margin: 0; overflow: auto; overflow-wrap: anywhere; }
  .ui-notification[role="status"] { background: var(--theme-workbench-surface); }
  .notification-actions { display: flex; gap: 3px; }
  .notification-actions a { flex: none; align-self: flex-start; white-space: nowrap; text-decoration: none; }
  .notification-actions :global(.notification-spinner) { animation: notification-spin 800ms linear infinite; }
  @keyframes notification-enter { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes notification-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .ui-notification, .notification-actions :global(.notification-spinner) { animation: none; } }
</style>
