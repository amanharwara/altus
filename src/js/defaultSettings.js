const defaultSettings = [{
    value: true,
    name: 'Tray Icon',
    description: 'Toggle the tray icon',
    id: 'trayIcon'
}, {
    value: true,
    name: 'Tab Bar',
    description: 'Toggle the tab bar',
    id: 'tabBar'
}, {
    value: false,
    name: "Close App To Tray",
    description: "When app is closed, minimize it to the tray instead of quitting it.",
    id: 'closeToTray'
}, {
    value: true,
    name: 'Exit Prompt',
    description: 'If this setting is enabled, the app will prompt you everytime you close the app. Disabling this will disable the prompt.',
    id: 'exitPrompt'
}, {
    value: true,
    name: 'Custom Titlebar',
    description: 'If you are having any issues with the custom titlebar, you can disable it using this setting. <b>NOTE: This setting requires you to restart the whole app for changes to apply.</b>',
    id: 'customTitlebar'
}, {
    value: false,
    name: 'Prompt When Closing Tab',
    description: 'When enabled, you will be prompted when you close a tab. This helps if you accidentally click the close button of a tab.',
    id: 'tabClosePrompt'
}];

module.exports = {
    defaultSettings
};