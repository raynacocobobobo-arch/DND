import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.HERMESTODO_PREVIEW === "true" ? "/DND/hermestodo/" : "/",
  root: "client",
  plugins: [react()],
  build: {
    outDir: resolve(import.meta.dirname, "dist/client"),
    emptyOutDir: true
  }
});
