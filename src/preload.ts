import { contextBridge, ipcRenderer } from "electron";
import { ElectronTabStoreIpcApi, Tab } from "./stores/tabs/common";
import { ElectronThemeStoreIpcApi } from "./stores/themes/common";

ipcRenderer.invoke("get-whatsapp-preload-path").then((preloadPath) => {
  contextBridge.exposeInMainWorld("whatsappPreloadPath", preloadPath);
});

const electronTabStoreIpcApi: ElectronTabStoreIpcApi = {
  getStore: async () => await ipcRenderer.invoke("tab-store-get"),
  setTabs: async (tabs: Tab[]) =>
    ipcRenderer.invoke("tab-store-set", "tabs", tabs),
  setPreviouslyClosedTab: async (tab: Tab | null) =>
    ipcRenderer.invoke("tab-store-set", "previouslyClosedTab", tab),
  setSelectedTabId: async (id: string | undefined) =>
    ipcRenderer.invoke("tab-store-set", "selectedTabId", id),
};

const electronThemeStoreIpcApi: ElectronThemeStoreIpcApi = {
  getStore: async () => await ipcRenderer.invoke("theme-store-get"),
  setThemes: async (themes) =>
    ipcRenderer.invoke("theme-store-set", "themes", themes),
};

contextBridge.exposeInMainWorld("electronTabStore", electronTabStoreIpcApi);
contextBridge.exposeInMainWorld("electronThemeStore", electronThemeStoreIpcApi);
