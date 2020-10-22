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
      "If you are having any issues with the custom titlebar, you can disable it using this setting. <b>NOTE: Requires restart of the application to apply.</b>",
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
    name: "Show Notification Badge",
    description:
      "When enabled, Altus will show the notification badge on the dock and tray.  <b>NOTE: Requires restart of the application to apply.</b>",
    id: "notificationBadge",
  },
  {
    value: false,
    name: "Prevents Default Enter Submit Message",
    description:
      "When enabled, Altus will prevent the default Enter for submitting the message, instead, add a new line. (Control + Enter) became the replacement for submitting.",
    id: "preventEnter",
  },
];

module.exports = {
  defaultSettings,
};
