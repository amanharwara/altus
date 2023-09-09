import { type ElectronTabStoreIpcApi } from "./stores/tabs/common";
import { type ElectronThemeStoreIpcApi } from "./stores/themes/common";
import { type ElectronSettingsStoreIpcApi } from "./stores/settings/common";

// Types for APIs exposed to the renderer process via contextBridge

declare global {
  interface Window {
    electronTabStore: ElectronTabStoreIpcApi;
    electronThemeStore: ElectronThemeStoreIpcApi;
    electronSettingsStore: ElectronSettingsStoreIpcApi;
    whatsappPreloadPath: string;
    toggleNotifications: (enabled: boolean, partition: string) => Promise<void>;
    electronIPCHandlers: {
      onOpenSettings: (callback: () => void) => Electron.IpcRenderer;
      onCloseActiveTab: (callback: () => void) => Electron.IpcRenderer;
      onAddNewTab: (callback: () => void) => Electron.IpcRenderer;
      onRestoreTab: (callback: () => void) => Electron.IpcRenderer;
    };
    showMessageBox: (
      options: Electron.MessageBoxOptions
    ) => Promise<Electron.MessageBoxReturnValue>;
  }
}
