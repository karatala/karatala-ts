import { mount } from "svelte";
import App from "./App.svelte";
import "./styles.css";
import "./preview-document.css";
const target = document.getElementById("root");
if (!target) throw new Error("The component catalog could not start. Reload the page.");
mount(App, { target });
