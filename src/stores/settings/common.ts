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

export const getDefaultSettings = (): Settings => ({
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

export type ElectronSettingsStoreIpcApi = {
  getStore: () => Promise<Settings>;
  setSetting: (
    _key: SettingKey,
    _value: SettingValue[SettingKey]
  ) => Promise<void>;
};
