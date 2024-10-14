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
  setSetting: async (key, value) =>
    ipcRenderer.invoke("settings-store-set", key, value),
};

const toggleNotifications = async (enabled: boolean, partition: string) => {
  await ipcRenderer.invoke("toggle-notifications", enabled, partition);
};

const toggleMediaPermission = async (enabled: boolean, partition: string) => {
  await ipcRenderer.invoke("toggle-media-permission", enabled, partition);
};

contextBridge.exposeInMainWorld("electronTabStore", electronTabStoreIpcApi);
contextBridge.exposeInMainWorld("electronThemeStore", electronThemeStoreIpcApi);
contextBridge.exposeInMainWorld(
  "electronSettingsStore",
  electronSettingsStoreIpcApi
);
contextBridge.exposeInMainWorld("toggleNotifications", toggleNotifications);
contextBridge.exposeInMainWorld("toggleMediaPermission", toggleMediaPermission);

contextBridge.exposeInMainWorld("electronIPCHandlers", {
  onOpenSettings: (callback: () => void) =>
    ipcRenderer.on("open-settings", callback),
  onEditActiveTab: (callback: () => void) =>
    ipcRenderer.on("edit-active-tab", callback),
  onCloseActiveTab: (callback: () => void) =>
    ipcRenderer.on("close-active-tab", callback),
  onOpenTabDevTools: (callback: () => void) =>
    ipcRenderer.on("open-tab-devtools", callback),
  onAddNewTab: (callback: () => void) =>
    ipcRenderer.on("add-new-tab", callback),
  onRestoreTab: (callback: () => void) =>
    ipcRenderer.on("restore-tab", callback),
  onNextTab: (callback: () => void) => ipcRenderer.on("next-tab", callback),
  onPreviousTab: (callback: () => void) =>
    ipcRenderer.on("previous-tab", callback),
  onFirstTab: (callback: () => void) => ipcRenderer.on("first-tab", callback),
  onLastTab: (callback: () => void) => ipcRenderer.on("last-tab", callback),
  onOpenWhatsappLink: (callback: (url: string) => void) =>
    ipcRenderer.on("open-whatsapp-link", (_, url) => callback(url)),
  onReloadCustomTitleBar: (callback: () => void) =>
    ipcRenderer.on("reload-custom-title-bar", callback),
  onReloadTranslations: (callback: () => void) =>
    ipcRenderer.on("reload-translations", callback),
  onNewChat: (callback: () => void) => ipcRenderer.on("new-chat", callback),
  onOpenThemeManager: (callback: () => void) =>
    ipcRenderer.on("open-theme-manager", callback),
  onMessageCount: (
    callback: (detail: { messageCount: number; tabId: string }) => void
  ) => ipcRenderer.on("message-count", (_, count) => callback(count)),
});

contextBridge.exposeInMainWorld(
  "showMessageBox",
  (options: MessageBoxOptions) => {
    return ipcRenderer.invoke("show-message-box", options);
  }
);

contextBridge.exposeInMainWorld("getAppMenu", () =>
  ipcRenderer.invoke("get-app-menu")
);

contextBridge.exposeInMainWorld("i18n", {
  getTranslations: () => ipcRenderer.invoke("get-translations"),
  keyMissing: (key: string) => ipcRenderer.invoke("key-missing", key),
});

contextBridge.exposeInMainWorld("clickMenuItem", (id: string) =>
  ipcRenderer.invoke("menu-item-click", id)
);

contextBridge.exposeInMainWorld("platform", process.platform);

contextBridge.exposeInMainWorld("windowActions", {
  minimize: () => ipcRenderer.invoke("minimize-window"),
  maximize: () => ipcRenderer.invoke("maximize-window"),
  restore: () => ipcRenderer.invoke("restore-window"),
  close: () => ipcRenderer.invoke("close-window"),
  isMaximized: () => ipcRenderer.invoke("is-maximized"),
  isBlurred: () => ipcRenderer.invoke("is-blurred"),
  onBlurred: (callback: () => void) =>
    ipcRenderer.on("window-blurred", callback),
  onFocused: (callback: () => void) =>
    ipcRenderer.on("window-focused", callback),
});
