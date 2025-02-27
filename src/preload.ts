import {
  type MessageBoxOptions,
  contextBridge,
  ipcRenderer,
  type IpcRendererEvent,
} from "electron";
import { ElectronTabStoreIpcApi } from "./stores/tabs/common";
import { ElectronThemeStoreIpcApi } from "./stores/themes/common";
import { ElectronSettingsStoreIpcApi } from "./stores/settings/common";
import type { ElectronIPCHandlers } from "./ipcHandlersType";

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

const initPermissionHandler = async (partition: string) => {
  await ipcRenderer.invoke("init-permission-handler", partition);
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
contextBridge.exposeInMainWorld("initPermissionHandler", initPermissionHandler);
contextBridge.exposeInMainWorld("toggleNotifications", toggleNotifications);
contextBridge.exposeInMainWorld("toggleMediaPermission", toggleMediaPermission);

const ipcHandlers: ElectronIPCHandlers = {
  onOpenSettings: (callback) => {
    ipcRenderer.on("open-settings", callback);
    return () => ipcRenderer.off("open-settings", callback);
  },
  onEditActiveTab: (callback) => {
    ipcRenderer.on("edit-active-tab", callback);
    return () => ipcRenderer.off("edit-active-tab", callback);
  },
  onCloseActiveTab: (callback) => {
    ipcRenderer.on("close-active-tab", callback);
    return () => ipcRenderer.off("close-active-tab", callback);
  },
  onOpenTabDevTools: (callback) => {
    ipcRenderer.on("open-tab-devtools", callback);
    return () => ipcRenderer.off("open-tab-devtools", callback);
  },
  onAddNewTab: (callback) => {
    ipcRenderer.on("add-new-tab", callback);
    return () => ipcRenderer.off("add-new-tab", callback);
  },
  onRestoreTab: (callback) => {
    ipcRenderer.on("restore-tab", callback);
    return () => ipcRenderer.off("restore-tab", callback);
  },
  onNextTab: (callback) => {
    ipcRenderer.on("next-tab", callback);
    return () => ipcRenderer.off("next-tab", callback);
  },
  onPreviousTab: (callback) => {
    ipcRenderer.on("previous-tab", callback);
    return () => ipcRenderer.off("previous-tab", callback);
  },
  onFirstTab: (callback) => {
    ipcRenderer.on("first-tab", callback);
    return () => ipcRenderer.off("first-tab", callback);
  },
  onLastTab: (callback) => {
    ipcRenderer.on("last-tab", callback);
    return () => ipcRenderer.off("last-tab", callback);
  },
  onOpenWhatsappLink: (callback) => {
    const handler = (_: IpcRendererEvent, url: string) => callback(url);
    ipcRenderer.on("open-whatsapp-link", handler);
    return () => ipcRenderer.off("open-whatsapp-link", handler);
  },
  onReloadCustomTitleBar: (callback) => {
    ipcRenderer.on("reload-custom-title-bar", callback);
    return () => ipcRenderer.off("reload-custom-title-bar", callback);
  },
  onReloadTranslations: (callback) => {
    ipcRenderer.on("reload-translations", callback);
    return () => ipcRenderer.off("reload-translations", callback);
  },
  onNewChat: (callback) => {
    ipcRenderer.on("new-chat", callback);
    return () => ipcRenderer.off("new-chat", callback);
  },
  onOpenThemeManager: (callback) => {
    ipcRenderer.on("open-theme-manager", callback);
    return () => ipcRenderer.off("open-theme-manager", callback);
  },
  onMessageCount: (callback) => {
    const handler = (
      _: IpcRendererEvent,
      count: { messageCount: number; tabId: string }
    ) => callback(count);
    ipcRenderer.on("message-count", handler);
    return () => ipcRenderer.off("message-count", handler);
  },
};

contextBridge.exposeInMainWorld("electronIPCHandlers", ipcHandlers);

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
