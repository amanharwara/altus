/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    clearMocks: true,
    // Module-reset tests must share the same Solid owner/runtime as the test
    // renderer. Keep Solid external and resolve its client build in workers.
    server: { deps: { external: [/solid-js/] } },
    execArgv: ["--conditions=browser", "--conditions=development"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/icons/**", "src/whatsapp.preload.ts", "src/components/WebView.tsx"],
    },
  },
});
