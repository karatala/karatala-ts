import { startupMarkup, connectStartup } from "@karatala/ui-bootstrap";
import "@karatala/ui-bootstrap/styles.css";

const options = new URLSearchParams(location.search);
document.body.insertAdjacentHTML("beforeend", startupMarkup({ title: "Example application", logoUrl: "/sample-icon.svg" }));
const root = document.getElementById("startup")!;
const result = document.createElement("output");
result.id = "demo-result";
result.setAttribute("aria-live", "polite");
root.append(result);
const record = (message: string) => { result.textContent = message; };
const startup = connectStartup(root, { actions: {
  copy: async text => { if (options.get("clipboard") === "denied") throw new Error("Memory clipboard denied"); record(`Copied ${text.length} characters to memory`); },
  reload: () => record("Reload requested"),
  window: options.get("window") === "false" ? undefined : { minimize: () => record("Minimize requested"), maximize: () => record("Maximize requested"), close: () => record("Close requested") },
} });
const state = options.get("state") ?? "loading";
if (state === "complete" || state === "late-error") startup.complete();
if (state === "error" || state === "late-error") startup.showError("Cannot open the example application. Reload the app. If it still fails, connect to the internet and try again.");
if (state === "late-error") record("Error after successful startup: recovery UI restored");
