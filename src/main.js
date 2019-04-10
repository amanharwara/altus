const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    dialog,
    shell,
    Tray,
    nativeImage
} = require('electron');
const url = require('url');
const path = require('path');
const Store = require('electron-store');
const fs = require('fs');
const fetch = require('node-fetch');
const autoLaunch = require('auto-launch');
let Badge;
if (process.platform === 'win32') Badge = require('electron-windows-badge');

//Declare window variables
let mainWindow,
    aboutWindow,
    settingsWindow,
    customCSSWindow,
    themeCustomizerWindow,
    themeManagerWindow,
    trayIcon;

//Use singleInstanceLock for making app single instance
const singleInstanceLock = app.requestSingleInstanceLock();

let themesList;

function createThemesList(css) {
    themesList = new Store({
        name: 'themes',
        defaults: {
            themes: [{
                name: 'Default',
                css: ''
            }, {
                name: 'Dark',
                css: css
            }]
        }
    });
}

function getDarkTheme(createThemesList) {
    fetch('https://raw.githubusercontent.com/ShadyThGod/shadythgod.github.io/master/css/altus-dark-theme.css')
        .then(res => res.text())
        .then(css => createThemesList(css));
};

getDarkTheme(createThemesList);

if (!singleInstanceLock) {
    //Quits the second instance
    app.quit();
} else {
    //Focuses the already-open instance
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    });

    //Create default settings
    var settings = new Store({
        name: 'settings',
        defaults: {
            trayIcon: {
                value: true,
                name: 'Tray Icon',
                description: 'If this setting is enabled, the tray icon will be enabled allowing you to receive messages even after completely minimizing Altus. Disabling this will disable the tray icon.'
            },
            showExitPrompt: {
                value: true,
                name: 'Exit Prompt',
                description: 'If this setting is enabled, the app will prompt you everytime you close the app. Disabling this will disable the prompt.'
            },
            customTitlebar: {
                value: true,
                name: 'Custom Titlebar',
                description: 'If you are having any issues with the custom titlebar, you can disable it using this setting. NOTE: This setting requires you to restart the whole app for changes to apply.'
            },
            systemStartup: {
                value: true,
                name: 'Load Altus on system startup',
                description: 'If this setting is enabled, Altus will start everytime the system starts. NOTE: This setting requires you to restart the whole app for changes to apply.'
            }
        }
    });

    //Create main window, main menu
    app.on('ready', () => {
        mainWindow = new BrowserWindow({
            title: `Altus ${app.getVersion()}`,
            frame: process.platform !== 'darwin' ? !settings.get('customTitlebar.value') : true,
            titleBarStyle: process.platform !== 'darwin' ? 'hidden' : 'default',
            backgroundColor: '#282C34',
            icon: './build/icon.ico',
            webPreferences: {
                webviewTag: true,
                nodeIntegration: true
            }
        });
        mainWindow.maximize(); //Maximizing the main window always
        mainWindow.loadURL(url.format({ //Loads the mainwindow html file
            pathname: path.join(__dirname, 'windows', 'main', 'window.html'),
            protocol: 'file:',
            slashes: true
        }));
        mainWindow.on('close', e => {
            if (app.showExitPrompt) {
                e.preventDefault();
                confirmExit();
            }
        });
        mainWindow.on('closed', () => {
            mainWindow = null;
            app.quit();
        });
        if (Badge) new Badge(mainWindow, {});

        //Setting main menu
        const mainMenu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(mainMenu);

        ipcMain.on('link-open', (e, link) => shell.openExternal(link));
        ipcMain.on('settings-changed', e => initializeGlobalSettings());
        ipcMain.on('new-themes-added', e => mainWindow.webContents.send('new-themes-added', true));
        ipcMain.on('message-indicator', (e, data) => {
            mainWindow.webContents.send('message-indicator', data);
            let number = data.number;
            if (process.platform === 'darwin') {
                if (number !== null && number !== undefined && number !== 0) {
                    app.dock.setBadge(`${number}`);
                } else {
                    app.dock.setBadge('');
                }
            }
        });
        ipcMain.on('zoom', (e, data) => mainWindow.webContents.send('zoom', data));

        function initializeGlobalSettings() {
            if (settings.get('trayIcon.value') === true) {
                let trayIconImage = nativeImage.createFromPath(path.join(__dirname, '/windows/assets/icons/icon.ico'));
                const trayContextMenu = Menu.buildFromTemplate([{
                    label: 'Maximize',
                    click() {
                        if (mainWindow) {
                            mainWindow.show();
                            mainWindow.focus();
                        }
                    }
                }, {
                    label: 'Minimize to Tray',
                    click() {
                        mainWindow.hide();
                    }
                }, {
                    label: 'Exit',
                    click() {
                        app.quit();
                    }
                }]);
                if (process.platform !== "darwin") {
                    trayIcon = new Tray(trayIconImage);
                    trayIcon.setToolTip('Altus');
                    trayIcon.setContextMenu(trayContextMenu);
                } else {
                    app.dock.setMenu(trayContextMenu);
                }
            } else {
                if (trayIcon) {
                    trayIcon.destroy();
                }
                trayIcon = null;
                trayIcon = undefined;
            }

            if (settings.get('showExitPrompt.value') === true) {
                app.showExitPrompt = true;
            } else {
                app.showExitPrompt = false;
            }

            let systemStartupLauncher = new autoLaunch({
                name: "Altus"
            });
            if (settings.get('systemStartup.value') === true) {
                systemStartupLauncher.enable();
            } else {
                systemStartupLauncher.disable();
            }
        }

        initializeGlobalSettings();
    });

    //Quit app if all windows are closed
    app.on('window-all-closed', () => {
        app.quit()
    });
}

let fileMenuTemplate;

if (!app.isPackaged) {
    fileMenuTemplate = [{
        label: 'Open DevTools',
        accelerator: 'CmdOrCtrl+Shift+I',
        click() {
            var window = BrowserWindow.getFocusedWindow();
            window.webContents.openDevTools();
        }
    }, {
        label: 'Force Reload',
        accelerator: 'CmdOrCtrl+Shift+R',
        click() {
            var window = BrowserWindow.getFocusedWindow();
            window.webContents.reload();
        }
    }, {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click() {
            app.quit();
        }
    }];
} else {
    fileMenuTemplate = [{
        label: 'Force Reload',
        accelerator: 'CmdOrCtrl+Shift+R',
        click() {
            var window = BrowserWindow.getFocusedWindow();
            window.webContents.reload();
        }
    }, {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click() {
            app.quit();
        }
    }];
}


const template = [{
    label: 'File',
    submenu: fileMenuTemplate
}, {
    label: 'Theme',
    submenu: [{
        label: 'Custom CSS Theme',
        accelerator: 'CmdOrCtrl+Shift+T',
        click() {
            createWindow('customCSS')
        }
    }, {
        label: 'Theme Customizer',
        accelerator: 'CmdOrCtrl+Alt+T',
        click() {
            createWindow('themeCustomizer')
        }
    }, {
        label: 'Manage Themes',
        accelerator: 'CmdOrCtrl+T',
        click() {
            createWindow('themeManager')
        }
    }]
}, {
    label: 'Settings',
    submenu: [{
        label: 'Settings',
        accelerator: 'CmdOrCtrl+,',
        click() {
            createWindow('settings')
        }
    }]
}, {
    label: "About",
    submenu: [{
        label: "About",
        click() {
            createWindow('about')
        }
    }, {
        label: "Check For Updates",
        accelerator: 'CmdOrCtrl+Shift+U',
        click() {
            mainWindow.webContents.send('check-for-updates', true);
        }
    }, {
        label: "Links",
        submenu: [{
            label: 'Report Bugs/Issues',
            click: () => {
                shell.openExternal('https://github.com/shadythgod/altus/issues');
            }
        }, {
            label: 'Website',
            click: () => {
                shell.openExternal('https://shadythgod.github.io');
            }
        }, {
            label: 'GitHub',
            click: () => {
                shell.openExternal('https://www.github.com/shadythgod');
            }
        }, {
            label: 'Repository',
            click: () => {
                shell.openExternal('https://www.github.com/shadythgod/altus');
            }
        }]
    }]
}]

function createWindow(id) {
    switch (id) {
        // Creates about window
        case 'about':
            if (typeof aboutWindow === 'object') {
                aboutWindow.show()
            } else {
                aboutWindow = new BrowserWindow({
                    title: `About Altus`,
                    frame: !settings.get('customTitlebar.value'),
                    backgroundColor: '#282C34',
                    titleBarStyle: 'hidden',
                    width: 500,
                    height: 320,
                    resizable: false,
                    parent: mainWindow,
                    modal: process.platform === 'darwin' ? false : true,
                    webPreferences: {
                        nodeIntegration: true
                    }
                })
                aboutWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'windows', 'about', 'window.html'),
                    protocol: 'file:',
                    slashes: true
                }));
                aboutWindow.show();
                aboutWindow.on('close', e => {
                    e.preventDefault();
                    aboutWindow.hide();
                });
            }
            break;
        case 'settings':
            if (typeof settingsWindow === 'object') {
                settingsWindow.show()
            } else {
                settingsWindow = new BrowserWindow({
                    title: `Settings`,
                    frame: process.platform !== 'darwin' ? !settings.get('customTitlebar.value') : true,
                    backgroundColor: '#282C34',
                    titleBarStyle: process.platform !== 'darwin' ? 'hidden' : 'default',
                    width: 450,
                    height: 400,
                    resizable: false,
                    maximizable: false,
                    minimizable: false,
                    parent: mainWindow,
                    modal: process.platform === 'darwin' ? false : true,
                    webPreferences: {
                        nodeIntegration: true
                    }
                })
                settingsWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'windows', 'settings', 'window.html'),
                    protocol: 'file:',
                    slashes: true
                }));
                settingsWindow.show();
                settingsWindow.on('close', e => {
                    e.preventDefault();
                    settingsWindow.hide();
                });
            }
            break;
        case 'customCSS':
            if (typeof customCSSWindow === 'object') {
                customCSSWindow.show()
            } else {
                customCSSWindow = new BrowserWindow({
                    title: `Custom CSS for WhatsApp`,
                    frame: process.platform !== 'darwin' ? !settings.get('customTitlebar.value') : true,
                    backgroundColor: '#282C34',
                    titleBarStyle: process.platform !== 'darwin' ? 'hidden' : 'default',
                    parent: mainWindow,
                    modal: process.platform === 'darwin' ? false : true,
                    resizable: true,
                    width: 600,
                    minWidth: 515,
                    height: 535,
                    minHeight: 535,
                    maxHeight: 535,
                    webPreferences: {
                        nodeIntegration: true
                    }
                })
                customCSSWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'windows', 'customCSS', 'window.html'),
                    protocol: 'file:',
                    slashes: true
                }));
                customCSSWindow.show();
                customCSSWindow.on('close', e => {
                    e.preventDefault();
                    customCSSWindow.hide();
                });
            }
            break;
        case 'themeCustomizer':
            if (typeof themeCustomizerWindow === 'object') {
                themeCustomizerWindow.show()
            } else {
                themeCustomizerWindow = new BrowserWindow({
                    title: `Customize Theme`,
                    frame: process.platform !== 'darwin' ? !settings.get('customTitlebar.value') : true,
                    backgroundColor: '#282C34',
                    titleBarStyle: process.platform !== 'darwin' ? 'hidden' : 'default',
                    parent: mainWindow,
                    modal: process.platform === 'darwin' ? false : true,
                    resizable: true,
                    width: 600,
                    minWidth: 600,
                    height: 545,
                    minHeight: 420,
                    webPreferences: {
                        nodeIntegration: true
                    }
                })
                themeCustomizerWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'windows', 'themeCustomizer', 'window.html'),
                    protocol: 'file:',
                    slashes: true
                }));
                themeCustomizerWindow.show();
                themeCustomizerWindow.on('close', e => {
                    e.preventDefault();
                    themeCustomizerWindow.hide();
                });
            }
            break;
        case 'themeManager':
            if (typeof themeManagerWindow === 'object') {
                themeManagerWindow.show()
            } else {
                themeManagerWindow = new BrowserWindow({
                    title: `Manage Themes`,
                    frame: process.platform !== 'darwin' ? !settings.get('customTitlebar.value') : true,
                    backgroundColor: '#282C34',
                    titleBarStyle: process.platform !== 'darwin' ? 'hidden' : 'default',
                    parent: mainWindow,
                    modal: process.platform === 'darwin' ? false : true,
                    resizable: false,
                    width: 500,
                    height: 420,
                    webPreferences: {
                        nodeIntegration: true
                    }
                })
                themeManagerWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'windows', 'themeManager', 'window.html'),
                    protocol: 'file:',
                    slashes: true
                }));
                themeManagerWindow.show();
                themeManagerWindow.on('close', e => {
                    e.preventDefault();
                    themeManagerWindow.hide();
                });
            }
            break;
        default:
            break;
    }
}

function confirmExit() {
    dialog.showMessageBox({
        type: 'question',
        buttons: ["OK", "Cancel"],
        title: "Exit",
        message: "Are you sure you want to exit?"
    }, function(res) {
        if (res == 0) {
            app.showExitPrompt = false;
            app.quit();
            return;
        }
    });
}