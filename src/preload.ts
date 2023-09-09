import { type MessageBoxOptions, contextBridge, ipcRenderer } from "electron";
import { ElectronTabStoreIpcApi } from "./stores/tabs/common";
import { ElectronThemeStoreIpcApi } from "./stores/themes/common";
import { ElectronSettingsStoreIpcApi } from "./stores/settings/common";

ipcRenderer.invoke("get-whatsapp-preload-path").then((preloadPath) => {
  contextBridge.exposeInMainWorld("whatsappPreloadPath", preloadPath);
});

const electronTabStoreIpcApi: ElectronTabStoreIpcApi = {
  getStore: async () => await ipcRenderer.invoke("tab-store-get"),
  set: async (key, value) =>
    await ipcRenderer.invoke("tab-store-set", key, value),
};

const electronThemeStoreIpcApi: ElectronThemeStoreIpcApi = {
  getStore: async () => await ipcRenderer.invoke("theme-store-get"),
  setThemes: async (themes) =>
    ipcRenderer.invoke("theme-store-set", "themes", themes),
};

const electronSettingsStoreIpcApi: ElectronSettingsStoreIpcApi = {
  getStore: async () => await ipcRenderer.invoke("settings-store-get"),
  setSettings: async (settings) =>
    ipcRenderer.invoke("settings-store-set", "settings", settings),
};

const toggleNotifications = async (enabled: boolean, partition: string) => {
  await ipcRenderer.invoke("toggle-notifications", enabled, partition);
};

contextBridge.exposeInMainWorld("electronTabStore", electronTabStoreIpcApi);
contextBridge.exposeInMainWorld("electronThemeStore", electronThemeStoreIpcApi);
contextBridge.exposeInMainWorld(
  "electronSettingsStore",
  electronSettingsStoreIpcApi
);
contextBridge.exposeInMainWorld("toggleNotifications", toggleNotifications);

contextBridge.exposeInMainWorld("electronIPCHandlers", {
  onOpenSettings: (callback: Parameters<typeof ipcRenderer.on>[1]) =>
    ipcRenderer.on("open-settings", callback),
  onCloseActiveTab: (callback: Parameters<typeof ipcRenderer.on>[1]) =>
    ipcRenderer.on("close-active-tab", callback),
  onRestoreTab: (callback: Parameters<typeof ipcRenderer.on>[1]) =>
    ipcRenderer.on("restore-tab", callback),
});

contextBridge.exposeInMainWorld(
  "showMessageBox",
  (options: MessageBoxOptions) => {
    return ipcRenderer.invoke("show-message-box", options);
  }
);
