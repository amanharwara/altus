import { contextBridge, ipcRenderer } from "electron";
import { ElectronTabStoreIpcApi, Tab } from "./stores/tabs/common";

const electronTabStoreIpcApi: ElectronTabStoreIpcApi = {
  getStore: async () => await ipcRenderer.invoke("tab-store-get"),
  setTabs: async (tabs: Tab[]) =>
    ipcRenderer.invoke("tab-store-set", "tabs", tabs),
  setPreviouslyClosedTab: async (tab: Tab | null) =>
    ipcRenderer.invoke("tab-store-set", "previouslyClosedTab", tab),
  setSelectedTabId: async (id: string | undefined) =>
    ipcRenderer.invoke("tab-store-set", "selectedTabId", id),
};

contextBridge.exposeInMainWorld("electronTabStore", electronTabStoreIpcApi);
