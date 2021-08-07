import type { SettingType, Settings } from "../types";

const defaultSettings: () => Settings = () => {
  return {
    tabBar: {
      value: true,
      name: "Show Tab Bar",
      description: "Controls whether the tab bar is visible or not.",
    },
    tabBarPosition: {
      value: "top",
      name: "Tab Bar Position",
      description: "Controls the position of the tab bar.",
      options: ["top", "bottom"],
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
        "Whether to ask where to save each file before downloading. (NOTE: Requires a restart for changes to apply.)",
    },
    defaultDownloadDir: {
      value: "",
      name: "Default Download Directory",
      description:
        "The directory where you want to save the downloads. (NOTE: Requires an absolute path)",
    },
    customTitlebar: {
      value: false,
      name: "Custom Titlebar",
      description:
        "When enabled, Altus will use a custom titlebar instead of the one provided by the system. (NOTE: Requires a restart for changes to apply.)",
    },
    rememberWindowSize: {
      value: false,
      name: "Remember Window Size",
      description:
        "When enabled, Altus will remember the size of the window from previous use.",
    },
    rememberWindowPosition: {
      value: false,
      name: "Remember Window Position",
      description:
        "When enabled, Altus will remember the position of the window from previous use.",
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
