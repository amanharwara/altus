import { beforeEach, expect, it, vi } from "vitest";

const electron = vi.hoisted(() => ({
  contextBridge: { exposeInMainWorld: vi.fn() },
  ipcRenderer: { invoke: vi.fn(async () => "preload-path"), on: vi.fn(), off: vi.fn() },
}));
vi.mock("electron", () => electron);

beforeEach(async () => {
  vi.resetModules();
  await import("../src/preload");
});

function exposed(name: string): unknown {
  const call = electron.contextBridge.exposeInMainWorld.mock.calls.find(([key]) => key === name);
  if (!call) throw new Error(`Missing bridge API: ${name}`);
  return call[1];
}

it("exposes the preload path and forwards store requests with the correct arguments", async () => {
  expect(exposed("whatsappPreloadPath")).toBe("preload-path");
  const tabs = exposed("electronTabStore") as Window["electronTabStore"];
  await tabs.getStore();
  expect(electron.ipcRenderer.invoke).toHaveBeenLastCalledWith("tab-store-get");
  await tabs.set("selectedTabId", "second");
  expect(electron.ipcRenderer.invoke).toHaveBeenLastCalledWith("tab-store-set", "selectedTabId", "second");
  const settings = exposed("electronSettingsStore") as Window["electronSettingsStore"];
  await settings.setSetting("trayIcon", false);
  expect(electron.ipcRenderer.invoke).toHaveBeenLastCalledWith("settings-store-set", "trayIcon", false);
  const themes = exposed("electronThemeStore") as Window["electronThemeStore"];
  await themes.setThemes([]);
  expect(electron.ipcRenderer.invoke).toHaveBeenLastCalledWith("theme-store-set", "themes", []);
});

it.each([
  ["onOpenSettings", "open-settings"], ["onEditActiveTab", "edit-active-tab"],
  ["onCloseActiveTab", "close-active-tab"], ["onOpenTabDevTools", "open-tab-devtools"],
  ["onAddNewTab", "add-new-tab"], ["onRestoreTab", "restore-tab"],
  ["onNextTab", "next-tab"], ["onPreviousTab", "previous-tab"],
  ["onFirstTab", "first-tab"], ["onLastTab", "last-tab"],
  ["onReloadCustomTitleBar", "reload-custom-title-bar"],
  ["onReloadTranslations", "reload-translations"], ["onNewChat", "new-chat"],
  ["onOpenThemeManager", "open-theme-manager"],
] as const)("%s removes the exact registered listener", (name, channel) => {
  const handlers = exposed("electronIPCHandlers") as Window["electronIPCHandlers"];
  const callback = vi.fn();
  const cleanup = handlers[name](callback);
  expect(electron.ipcRenderer.on).toHaveBeenLastCalledWith(channel, callback);
  cleanup();
  expect(electron.ipcRenderer.off).toHaveBeenLastCalledWith(channel, callback);
});

it.each([
  ["onOpenWhatsappLink", "open-whatsapp-link", "https://example.test"],
  ["onMessageCount", "message-count", { tabId: "first", messageCount: 3 }],
  ["onNotificationClick", "notification-click", "tab-1"],
] as const)("%s strips the Electron event and cleans up its wrapper", (name, channel, payload) => {
  const handlers = exposed("electronIPCHandlers") as Window["electronIPCHandlers"];
  const callback = vi.fn();
  const cleanup = handlers[name](callback);
  const registration = electron.ipcRenderer.on.mock.calls.at(-1);
  if (!registration) throw new Error("Listener was not registered");
  const [, listener] = registration;
  listener({ sender: "private" }, payload);
  expect(callback).toHaveBeenCalledExactlyOnceWith(payload);
  cleanup();
  expect(electron.ipcRenderer.off).toHaveBeenLastCalledWith(channel, listener);
});
