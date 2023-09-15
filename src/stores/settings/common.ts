export type SettingKey =
  | "tabBar"
  | "tabBarPosition"
  | "trayIcon"
  | "tabClosePrompt"
  | "closeToTray"
  | "exitPrompt"
  | "preventEnter"
  | "notificationBadge"
  | "launchMinimized"
  | "autoLaunch"
  | "autoHideMenuBar"
  | "showSaveDialog"
  | "defaultDownloadDir"
  | "customTitlebar"
  | "systemScrollbars"
  | "rememberWindowSize"
  | "rememberWindowPosition"
  | "language";

export type SettingValue = {
  tabBar: boolean;
  tabBarPosition: "top" | "bottom";
  trayIcon: boolean;
  tabClosePrompt: boolean;
  closeToTray: boolean;
  exitPrompt: boolean;
  preventEnter: boolean;
  notificationBadge: boolean;
  launchMinimized: boolean;
  autoLaunch: boolean;
  autoHideMenuBar: boolean;
  showSaveDialog: boolean;
  defaultDownloadDir: string;
  customTitlebar: boolean;
  systemScrollbars: boolean;
  rememberWindowSize: boolean;
  rememberWindowPosition: boolean;
  language: typeof import("../../i18n/langauges.config").languages[number];
};

type StoredSettings = Record<SettingKey, { value: SettingValue[SettingKey] }>;

export const getDefaultSettings = (): StoredSettings => ({
  tabBar: { value: true },
  tabBarPosition: { value: "top" },
  trayIcon: { value: true },
  tabClosePrompt: { value: true },
  closeToTray: { value: false },
  exitPrompt: { value: true },
  preventEnter: { value: false },
  notificationBadge: { value: true },
  launchMinimized: { value: false },
  autoLaunch: { value: false },
  autoHideMenuBar: { value: false },
  showSaveDialog: { value: true },
  defaultDownloadDir: { value: "" },
  customTitlebar: { value: false },
  systemScrollbars: { value: false },
  rememberWindowSize: { value: false },
  rememberWindowPosition: { value: false },
  language: { value: "en" },
});

// @TODO This not the correct schema, it should actually be StoredSettings
export type SettingsStore = {
  settings: StoredSettings;
};

export const SettingsStoreDefaults = (): SettingsStore => ({
  settings: getDefaultSettings(),
});

export type ElectronSettingsStoreIpcApi = {
  getStore: () => Promise<SettingsStore>;
  setSettings: (settings: SettingsStore["settings"]) => Promise<void>;
};
