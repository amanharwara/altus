import type { SettingType } from "../types";

const defaultSettings: () => {
  [k: string]: SettingType;
} = () => {
  return {
    tabBar: {
      value: true,
      name: "Tab Bar",
      description: "Controls whether the tab bar is visible or not.",
    },
    trayIcon: {
      value: true,
      name: "Tray Icon",
      description: "Controls whether the tray icon is visible or not.",
    },
    tabClosePrompt: {
      value: false,
      name: "Prompt When Closing Tab",
      description: "When enabled, you will be prompted when you close a tab.",
    },
  };
};

const migrateSettings = (settings) => {
  let newSettings = {};
  settings.forEach((setting) => {
    newSettings[setting.id] = {
      value: setting.value,
      name: setting.name,
      description: setting.description,
    };
  });
  return newSettings;
};

export { defaultSettings, migrateSettings };
