import { beforeEach, expect, it, vi } from "vitest";
import { ThemeStoreDefaults, type Theme } from "../src/stores/themes/common";

const storage = vi.hoisted(() => ({ themes: [] as Theme[], set: vi.fn() }));
vi.mock("electron-store", () => ({
  default: class {
    get() { return storage.themes; }
    set = storage.set;
  },
}));
beforeEach(() => { vi.resetModules(); });

it("cleans stale built-in CSS and colors without touching user themes", async () => {
  const custom = { id: "mine", name: "Mine", css: "body { color: red }", customCSS: true };
  storage.themes = [
    { id: "default", name: "Default", colors: { bg: "black", fg: "white", ac: "blue" } },
    { id: "dark", name: "Dark", css: "legacy", customCSS: true }, custom,
  ];
  await import("../src/stores/themes/electron");
  expect(storage.set).toHaveBeenCalledExactlyOnceWith("themes", [...ThemeStoreDefaults().themes, custom]);
});

it("leaves clean built-in themes alone on subsequent launches", async () => {
  storage.themes = ThemeStoreDefaults().themes;
  await import("../src/stores/themes/electron");
  expect(storage.set).not.toHaveBeenCalled();
});
