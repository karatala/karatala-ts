# Independent startup UI

Static loading/error markup and a DOM controller. This package has no Svelte, Bun or native runtime dependency. The application can fail before parsing or mounting Svelte while the error field, Copy, Reload and optional window controls continue to work.

```ts
import { startupMarkup, startupLabels, connectStartup } from "@karatala/ui-bootstrap";
import "@karatala/ui-bootstrap/styles.css";

document.body.insertAdjacentHTML("beforeend", startupMarkup({ title: "Example", logoUrl: "./icon.svg" }));
const startup = connectStartup(document.getElementById("startup")!, {
  labels: startupLabels,
  actions: { copy: text => navigator.clipboard.writeText(text), reload: () => location.reload() },
});
// After successful mount: startup.complete(). On failure: startup.showError(displayMessage).
```

For real first paint, render the markup at build time and inline the package CSS and a separate classic connection bundle before the application module. Do not import the connection through the application/Svelte entry. The package never starts the app, stores data, checks the OS or installs a global error policy. Callers supply actionable error text and optional window callbacks. Native handles and permissions stay with the application.

Methods: setStatus updates the reserved loading area; complete removes the loading root; showError displays a readonly field and recovery actions, including after complete; dispose removes the root/listeners and restores previous background inert state. Error mode is sticky. Copy failure selects the field and changes the accessible action label to manual-copy guidance without moving the layout. No clipboard operation runs before a user action.

The standalone catalog preview is /startup-preview.html, outside the Svelte preview loader. Loading, error and recovery-after-complete cases use memory callbacks. Application build, service-worker and native checks belong to each consumer.

## Source

Derived from karatala/Komprohit at de1c0135c8e6d1f766c54c095eee90d4ee3a3c14: src/app/startup-error.ts and index.html. The pure DOM error field, MDI copy/reload paths and startup presentation are retained with namespaced selectors. Window controls use the existing Rachana MDI geometry and explicit callbacks instead of DesktopStartupHeader's Svelte graph. Markup escaping, lifecycle, labels and modal focus form the reusable boundary. Shared pointer focus release comes from @karatala/dom-input.

Source hashes and adaptations are in ../../docs/ui-provenance.json. GPL v3 and MDI attribution/license text are retained here.
