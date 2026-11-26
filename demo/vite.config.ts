import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
export default defineConfig({ plugins: [svelte()], resolve: { dedupe: ["svelte"] }, server: { host: "127.0.0.1", port: 3212, strictPort: true, open: false } });
