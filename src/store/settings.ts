import type { SettingType, Settings } from "../types";

const defaultSettings: () => Settings = () => {
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
    closeToTray: {
      value: false,
      name: "Close to Tray",
      description:
        "When enabled, Altus will be minimized to the tray instead of being closed completely.",
    },
    exitPrompt: {
      value: false,
      name: "Show Exit Prompt",
      description: "When enabled, you will be prompted when you close the app.",
    },
    preventEnter: {
      value: false,
      name: "Prevent sending message on Enter",
      description:
        "When enabled, pressing Enter while typing will not send the message and add a new line instead.",
    },
    notificationBadge: {
      value: true,
      name: "Show Notification Badge",
      description:
        "When enabled, Altus will show the notification badge on the dock and tray.",
    },
    launchMinimized: {
      value: false,
      name: "Start Minimized",
      description: "When enabled, Altus will start minimized.",
    },
    autoLaunch: {
      value: false,
      name: "Launch at system startup",
      description:
        "When enabled, Altus will launch whenever you start your system.",
    },
    autoHideMenuBar: {
      value: false,
      name: "Auto-hide Menu Bar",
      description:
        "Whether the window menu bar should hide itself automatically. Once set the menu bar will only show when you press the Alt key.",
    },
    showSaveDialog: {
      value: true,
      name: "Show Save Dialog",
      description:
        "Whether to ask where to save each file before downloading. (NOTE: Requires restarting the app for changes to apply.)",
    },
  };
};

const migrateSettings: (any) => Settings = (settings) => {
  let newSettings: Settings = {};
  settings.forEach((setting) => {
    newSettings[setting.id] = {
      value: setting.value,
      name: setting.name,
      description: setting.description,
    };
  });
  return newSettings;
};

const validateSettings: (settings: Settings) => Settings = (settings) => {
  let validatedSettings = settings;
  let defaults = defaultSettings();
  Object.keys(validatedSettings).forEach((key) => {
    if (!defaults[key]) {
      delete validatedSettings[key];
    }
  });
  Object.keys(defaults).forEach((key) => {
    if (!validatedSettings[key]) {
      validatedSettings[key] = defaults[key];
    }
  });
  return validatedSettings;
};

export { defaultSettings, migrateSettings, validateSettings };
