import { type ElectronTabStoreIpcApi } from "./stores/tabs/common";
import { type ElectronThemeStoreIpcApi } from "./stores/themes/common";

// Types for APIs exposed to the renderer process via contextBridge

declare global {
  interface Window {
    electronTabStore: ElectronTabStoreIpcApi;
    electronThemeStore: ElectronThemeStoreIpcApi;
    whatsappPreloadPath: string;
    toggleNotifications: (enabled: boolean, partition: string) => Promise<void>;
  }
}
