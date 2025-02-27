import { type ElectronTabStoreIpcApi } from "./stores/tabs/common";
import { type ElectronThemeStoreIpcApi } from "./stores/themes/common";
import { type ElectronSettingsStoreIpcApi } from "./stores/settings/common";
import { type CloneableMenu } from "./main";
import { type ElectronIPCHandlers } from "./ipcHandlersType";

// Types for APIs exposed to the renderer process via contextBridge

declare global {
  interface Window {
    electronTabStore: ElectronTabStoreIpcApi;
    electronThemeStore: ElectronThemeStoreIpcApi;
    electronSettingsStore: ElectronSettingsStoreIpcApi;
    whatsappPreloadPath: string;
    initPermissionHandler: (partition: string) => Promise<void>;
    toggleNotifications: (enabled: boolean, partition: string) => Promise<void>;
    toggleMediaPermission: (
      enabled: boolean,
      partition: string
    ) => Promise<void>;
    electronIPCHandlers: ElectronIPCHandlers;
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
