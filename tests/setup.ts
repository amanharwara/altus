import "@testing-library/jest-dom/vitest";
import { cleanup } from "@solidjs/testing-library";
import { afterEach, beforeEach, vi } from "vitest";
import { getDefaultSettings } from "../src/stores/settings/common";
import { TabStoreDefaults } from "../src/stores/tabs/common";
import { ThemeStoreDefaults } from "../src/stores/themes/common";
import type { ElectronIPCHandlers } from "../src/ipcHandlersType";

// Install before importing any renderer store: these modules hydrate at import time.
export function installBridge() {
  const listeners = new Map<keyof ElectronIPCHandlers, Set<(...args: unknown[]) => void>>();
  const names: (keyof ElectronIPCHandlers)[] = [
    "onOpenSettings", "onEditActiveTab", "onCloseActiveTab", "onOpenTabDevTools",
    "onAddNewTab", "onRestoreTab", "onNextTab", "onPreviousTab", "onFirstTab",
    "onLastTab", "onOpenWhatsappLink", "onReloadCustomTitleBar",
    "onReloadTranslations", "onNewChat", "onOpenThemeManager", "onMessageCount",
  ];
  const handlers = Object.fromEntries(names.map((name) => [name, vi.fn((callback) => {
    const callbacks = listeners.get(name) ?? new Set();
    callbacks.add(callback);
    listeners.set(name, callbacks);
    return () => callbacks.delete(callback);
  })])) as unknown as ElectronIPCHandlers;
  Object.assign(window, {
    electronTabStore: { getStore: vi.fn(async () => TabStoreDefaults()), set: vi.fn(async () => undefined) },
    electronSettingsStore: { getStore: vi.fn(async () => getDefaultSettings()), setSetting: vi.fn(async () => undefined) },
    electronThemeStore: { getStore: vi.fn(async () => ThemeStoreDefaults()), setThemes: vi.fn(async () => undefined) },
    electronIPCHandlers: handlers,
    i18n: { getTranslations: vi.fn(async () => ({ current: {}, fallback: {} })), keyMissing: vi.fn(async () => undefined) },
    showMessageBox: vi.fn(async () => ({ response: 0, checkboxChecked: false })),
    getAppMenu: vi.fn(async () => []),
    clickMenuItem: vi.fn(async () => undefined),
    platform: "linux",
  });
  return {
    emit(name: keyof ElectronIPCHandlers, ...args: unknown[]) {
      listeners.get(name)?.forEach((callback) => callback(...args));
    },
    listenerCount() {
      return [...listeners.values()].reduce((count, callbacks) => count + callbacks.size, 0);
    },
  };
}

beforeEach(() => {
  installBridge();
  // Kobalte restores scroll position when its dialog scroll lock is released.
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
