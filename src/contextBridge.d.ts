import { type ElectronTabStoreIpcApi } from "./stores/tabs/common";
import { type ElectronThemeStoreIpcApi } from "./stores/themes/common";
import { type ElectronSettingsStoreIpcApi } from "./stores/settings/common";
import { type CloneableMenu } from "./main";

// Types for APIs exposed to the renderer process via contextBridge

declare global {
  interface Window {
    electronTabStore: ElectronTabStoreIpcApi;
    electronThemeStore: ElectronThemeStoreIpcApi;
    electronSettingsStore: ElectronSettingsStoreIpcApi;
    whatsappPreloadPath: string;
    toggleNotifications: (enabled: boolean, partition: string) => Promise<void>;
    toggleMediaPermission: (enabled: boolean, partition: string) => Promise<void>;
    electronIPCHandlers: {
      onOpenSettings: (callback: () => void) => Electron.IpcRenderer;
      onEditActiveTab: (callback: () => void) => Electron.IpcRenderer;
      onCloseActiveTab: (callback: () => void) => Electron.IpcRenderer;
      onOpenTabDevTools: (callback: () => void) => Electron.IpcRenderer;
      onAddNewTab: (callback: () => void) => Electron.IpcRenderer;
      onRestoreTab: (callback: () => void) => Electron.IpcRenderer;
      onNextTab: (callback: () => void) => Electron.IpcRenderer;
      onPreviousTab: (callback: () => void) => Electron.IpcRenderer;
      onFirstTab: (callback: () => void) => Electron.IpcRenderer;
      onLastTab: (callback: () => void) => Electron.IpcRenderer;
      onOpenWhatsappLink: (
        callback: (url: string) => void
      ) => Electron.IpcRenderer;
      onReloadCustomTitleBar: (callback: () => void) => Electron.IpcRenderer;
      onReloadTranslations: (callback: () => void) => Electron.IpcRenderer;
      onNewChat: (callback: () => void) => Electron.IpcRenderer;
      onOpenThemeManager: (callback: () => void) => Electron.IpcRenderer;
      onMessageCount: (
        callback: (detail: { messageCount: number; tabId: string }) => void
      ) => Electron.IpcRenderer;
    };
    windowActions: {
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      restore: () => Promise<void>;
      close: () => Promise<void>;
      isMaximized: () => Promise<boolean>;
      isBlurred: () => Promise<boolean>;
      onBlurred: (callback: () => void) => void;
      onFocused: (callback: () => void) => void;
    };
    showMessageBox: (
      options: Electron.MessageBoxOptions
    ) => Promise<Electron.MessageBoxReturnValue>;
    getAppMenu: () => Promise<CloneableMenu>;
    i18n: {
      getTranslations: () => Promise<{
        current: Record<string, string>;
        fallback: Record<string, string>;
      }>;
      keyMissing: (key: string) => Promise<void>;
    };
    clickMenuItem: (id: string) => Promise<void>;
    platform: NodeJS.Platform;
  }
}
