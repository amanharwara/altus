import { languages } from "../../i18n/langauges.config";
import z from "zod";

const SettingsSchema = z.object({
  tabBar: z.object({ value: z.boolean() }),
  tabBarPosition: z.object({ value: z.enum(["top", "bottom"]) }),
  trayIcon: z.object({ value: z.boolean() }),
  tabClosePrompt: z.object({ value: z.boolean() }),
  closeToTray: z.object({ value: z.boolean() }),
  exitPrompt: z.object({ value: z.boolean() }),
  preventEnter: z.object({ value: z.boolean() }),
  notificationBadge: z.object({ value: z.boolean() }),
  launchMinimized: z.object({ value: z.boolean() }),
  autoLaunch: z.object({ value: z.boolean() }),
  autoHideMenuBar: z.object({ value: z.boolean() }),
  showSaveDialog: z.object({ value: z.boolean() }),
  defaultDownloadDir: z.object({ value: z.string() }),
  customTitlebar: z.object({ value: z.boolean() }),
  systemScrollbars: z.object({ value: z.boolean() }),
  rememberWindowSize: z.object({ value: z.boolean() }),
  rememberWindowPosition: z.object({ value: z.boolean() }),
  language: z.object({ value: z.enum(languages) }),
});

export type Settings = z.infer<typeof SettingsSchema>;
export type SettingKey = keyof Settings;
export type SettingValue = {
  [Key in SettingKey]: Settings[Key]["value"];
};

export const DefaultSettingValues = {
  tabBar: true,
  tabBarPosition: "top",
  trayIcon: true,
  tabClosePrompt: true,
  closeToTray: false,
  exitPrompt: false,
  preventEnter: false,
  notificationBadge: true,
  launchMinimized: false,
  autoLaunch: false,
  autoHideMenuBar: false,
  showSaveDialog: true,
  defaultDownloadDir: "",
  customTitlebar: false,
  systemScrollbars: false,
  rememberWindowSize: false,
  rememberWindowPosition: false,
  language: "en",
} as const satisfies { [Key in SettingKey]: Settings[Key]["value"] };

export const getDefaultSettings = (): Settings => ({
  tabBar: { value: DefaultSettingValues.tabBar },
  tabBarPosition: { value: DefaultSettingValues.tabBarPosition },
  trayIcon: { value: DefaultSettingValues.trayIcon },
  tabClosePrompt: { value: DefaultSettingValues.tabClosePrompt },
  closeToTray: { value: DefaultSettingValues.closeToTray },
  exitPrompt: { value: DefaultSettingValues.exitPrompt },
  preventEnter: { value: DefaultSettingValues.preventEnter },
  notificationBadge: { value: DefaultSettingValues.notificationBadge },
  launchMinimized: { value: DefaultSettingValues.launchMinimized },
  autoLaunch: { value: DefaultSettingValues.autoLaunch },
  autoHideMenuBar: { value: DefaultSettingValues.autoHideMenuBar },
  showSaveDialog: { value: DefaultSettingValues.showSaveDialog },
  defaultDownloadDir: { value: DefaultSettingValues.defaultDownloadDir },
  customTitlebar: { value: DefaultSettingValues.customTitlebar },
  systemScrollbars: { value: DefaultSettingValues.systemScrollbars },
  rememberWindowSize: { value: DefaultSettingValues.rememberWindowSize },
  rememberWindowPosition: {
    value: DefaultSettingValues.rememberWindowPosition,
  },
  language: { value: DefaultSettingValues.language },
});

export type ElectronSettingsStoreIpcApi = {
  getStore: () => Promise<Settings>;
  setSetting: (
    _key: SettingKey,
    _value: SettingValue[SettingKey]
  ) => Promise<void>;
};
