import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronTabStore", {
  getTabs: async () => await ipcRenderer.invoke("get-tabs"),
  getPreviouslyClosedTab: async () =>
    await ipcRenderer.invoke("get-previously-closed-tab"),
});
