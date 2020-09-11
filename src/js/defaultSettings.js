const defaultSettings = [
  {
    value: true,
    name: "Tray Icon",
    description: "Toggle the tray icon",
    id: "trayIcon",
  },
  {
    value: true,
    name: "Tab Bar",
    description: "Toggle the tab bar",
    id: "tabBar",
  },
  {
    value: false,
    name: "Close App To Tray",
    description:
      "When app is closed, minimize it to the tray instead of quitting it.",
    id: "closeToTray",
  },
  {
    value: true,
    name: "Exit Prompt",
    description:
      "If this setting is enabled, the app will prompt you everytime you close the app. Disabling this will disable the prompt.",
    id: "exitPrompt",
  },
  {
    value: true,
    name: "Custom Titlebar",
    description:
      "If you are having any issues with the custom titlebar, you can disable it using this setting. <b>NOTE: This setting requires you to restart the whole app for changes to apply.</b>",
    id: "customTitlebar",
  },
  {
    value: true,
    name: "Prompt When Closing Tab",
    description:
      "When enabled, you will be prompted when you close a tab. This helps if you accidentally click the close button of a tab.",
    id: "tabClosePrompt",
  },
  {
    value: false,
    name: "Remember Last Active Tab",
    description:
      "When enabled, Altus will remember what tab was last active so when you re-open the app it will focus the tab which was last active.",
    id: "rememberActiveTab",
  },
  {
    value: true,
    name: "Show Notification Count In Tray Icon (Windows)",
    description:
      "When enabled, Altus will show the notification count on the tray icon on Windows.",
    id: "notificationCountInTray",
  },
];

module.exports = {
  defaultSettings,
};

