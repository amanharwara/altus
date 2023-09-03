import { contextBridge, ipcRenderer } from "electron";
import { ElectronTabStoreIpcApi, Tab } from "./stores/tabs/common";

const electronTabStoreIpcApi: ElectronTabStoreIpcApi = {
  getTabs: async () => await ipcRenderer.invoke("get-tabs"),
  getPreviouslyClosedTab: async () =>
    await ipcRenderer.invoke("get-previously-closed-tab"),
  setTabs: async (tabs: Tab[]) => ipcRenderer.invoke("set-tabs", tabs),
  setPreviouslyClosedTab: async (tab: Tab | null) =>
    ipcRenderer.invoke("set-previously-closed-tab", tab),
};

contextBridge.exposeInMainWorld("electronTabStore", electronTabStoreIpcApi);
