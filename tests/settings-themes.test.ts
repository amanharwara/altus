import { beforeEach, expect, it, vi } from "vitest";
import { getDefaultSettings } from "../src/stores/settings/common";
import { getDefaultTab } from "../src/stores/tabs/common";
import { ThemeStoreDefaults } from "../src/stores/themes/common";

beforeEach(() => vi.resetModules());

it("default factories do not share mutable settings, tabs or themes", () => {
  const settings = getDefaultSettings();
  settings.trayIcon.value = false;
  expect(getDefaultSettings().trayIcon.value).toBe(true);
  const themes = ThemeStoreDefaults();
  themes.themes[0].name = "Changed";
  expect(ThemeStoreDefaults().themes[0].name).toBe("Default");
  const first = getDefaultTab();
  const second = getDefaultTab();
  expect(first.id).not.toBe(second.id);
  first.config.sound = false;
  expect(second.config.sound).toBe(true);
});

it("hydrates settings and synchronizes edits without overwriting other values", async () => {
  const saved = getDefaultSettings();
  saved.language.value = "es";
  vi.mocked(window.electronSettingsStore.getStore).mockResolvedValue(saved);
  const { getSettingValue, setSettingValue } = await import("../src/stores/settings/solid");
  expect(getSettingValue("language")).toBe("es");
  setSettingValue("tabBarPosition", "bottom");
  expect(getSettingValue("tabBarPosition")).toBe("bottom");
  expect(getSettingValue("language")).toBe("es");
  expect(window.electronSettingsStore.setSetting).toHaveBeenCalledExactlyOnceWith("tabBarPosition", "bottom");
});

it("hydrates, adds, updates, upserts and removes themes while preserving built-ins", async () => {
  const custom = { id: "custom", name: "Custom", css: "body { color: red }" };
  vi.mocked(window.electronThemeStore.getStore).mockResolvedValue({ themes: [...ThemeStoreDefaults().themes, custom] });
  const store = await import("../src/stores/themes/solid");
  expect(store.themeStore.themes).toHaveLength(3);
  store.updateTheme({ ...custom, name: "Updated" });
  expect(store.themeStore.themes[2].name).toBe("Updated");
  store.upsertTheme({ ...custom, name: "Replaced" });
  expect(store.themeStore.themes).toHaveLength(3);
  const another = { id: "another", name: "Another" };
  store.upsertTheme(another);
  store.addTheme({ id: "third", name: "Third" });
  expect(store.themeStore.themes).toHaveLength(5);
  store.removeTheme(custom);
  expect(store.themeStore.themes.map(t => t.id)).toEqual(["default", "dark", "another", "third"]);
  expect(window.electronThemeStore.setThemes).toHaveBeenLastCalledWith(expect.arrayContaining([another]));
});
