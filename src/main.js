const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    dialog,
    shell,
    Tray
} = require('electron');
const url = require('url');
const path = require('path');
const Store = require('electron-store');
const fs = require('fs');

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
            }
        }
    });

    let themesList = new Store({
        name: 'themes',
        defaults: {
            themes: [{
                name: 'Default',
                css: ''
            }, {
                name: 'Dark',
                css: getDarkTheme()
            }]
        }
    });

    //Create main window, main menu
    app.on('ready', () => {
        mainWindow = new BrowserWindow({
            title: `Altus ${app.getVersion()}`,
            frame: false,
            titleBarStyle: 'hidden',
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

        //Setting main menu
        const mainMenu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(mainMenu);

        ipcMain.on('link-open', (e, link) => shell.openExternal(link));
        ipcMain.on('settings-changed', e => initializeGlobalSettings());
        ipcMain.on('new-themes-added', e => mainWindow.webContents.send('new-themes-added', true));

        function initializeGlobalSettings() {
            if (settings.get('trayIcon.value') === true) {
                let trayIconPath = path.join(__dirname, '/windows/assets/icons/icon.ico');
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
                    trayIcon = new Tray(trayIconPath);
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
        }

        initializeGlobalSettings();
    });

    //Quit app if all windows are closed
    app.on('window-all-closed', () => {
        app.quit()
    });
}

const template = [{
    label: 'File',
    submenu: [{
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
    }]
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
                    frame: false,
                    backgroundColor: '#282C34',
                    titleBarStyle: 'hidden',
                    width: 320,
                    height: 400,
                    resizable: false,
                    parent: mainWindow,
                    modal: true,
                    webPreferences: {
                        nodeIntegration: true
                    }
                })
                aboutWindow.loadURL(path.resolve('./windows/about/window.html'));
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
                    frame: false,
                    backgroundColor: '#282C34',
                    titleBarStyle: 'hidden',
                    width: 650,
                    height: 526,
                    resizable: false,
                    maximizable: false,
                    minimizable: false,
                    parent: mainWindow,
                    modal: true,
                    webPreferences: {
                        nodeIntegration: true
                    }
                })
                settingsWindow.loadURL(path.resolve('./windows/settings/window.html'));
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
                    frame: false,
                    backgroundColor: '#282C34',
                    titleBarStyle: 'hidden',
                    parent: mainWindow,
                    modal: true,
                    resizable: false,
                    width: 600,
                    height: 547,
                    webPreferences: {
                        nodeIntegration: true
                    }
                })
                customCSSWindow.loadURL(path.resolve('./windows/customCSS/window.html'));
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
                    frame: false,
                    backgroundColor: '#282C34',
                    titleBarStyle: 'hidden',
                    parent: mainWindow,
                    modal: true,
                    resizable: false,
                    width: 600,
                    height: 545,
                    webPreferences: {
                        nodeIntegration: true
                    }
                })
                themeCustomizerWindow.loadURL(path.resolve('./windows/themeCustomizer/window.html'));
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
                    frame: false,
                    backgroundColor: '#282C34',
                    titleBarStyle: 'hidden',
                    parent: mainWindow,
                    modal: true,
                    resizable: false,
                    width: 500,
                    height: 420,
                    webPreferences: {
                        nodeIntegration: true
                    }
                })
                themeManagerWindow.loadURL(path.resolve('./windows/themeManager/window.html'));
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

function getDarkTheme() {
    let darkTheme;

    darkTheme = fs.readFileSync('./windows/assets/css/darktheme.css', 'utf-8');

    return darkTheme;
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