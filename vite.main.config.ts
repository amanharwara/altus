import { defineConfig } from "vite";

export default defineConfig({
  // The main process loads icons and translation catalogs beside its bundle.
  build: { copyPublicDir: true },
});
