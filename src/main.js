const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    shell
} = require('electron');
const url = require('url');
const path = require('path');
const Store = require('electron-store');

//Declare window variables
let mainWindow,
    aboutWindow,
    settingsWindow,
    customCSSWindow,
    themeCustomizerWindow;

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
    var mainSettings = new Store({
        name: 'settings',
        defaults: {
            persistTheme: {
                value: true,
                name: 'Persist Theme',
                description: 'If this setting is enabled, the app will automatically load the theme which was previously applied.'
            },
            notifications: {
                value: true,
                name: 'Notifications',
                description: 'If this setting is enabled, the app will show notifications whenever a new message arrives. Disabling this will disable all the notifications.'
            },
            sound: {
                value: true,
                name: 'Sound',
                description: 'If this setting is enabled, all sounds will be enabled in WhatsApp. Disabling this will disable all the sounds in WhatsApp.'
            },
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

        //Setting main menu
        const mainMenu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(mainMenu);

        ipcMain.on('link-open', (e, link) => shell.openExternal(link));
        ipcMain.on('settings-changed', e => mainWindow.webContents.send('settings-changed', true));
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
        label: 'Change Theme',
        submenu: [{
                label: 'Default Theme',
                accelerator: 'CmdOrCtrl+Shift+D',
                click() {
                    console.log("Default Theme")
                }
            },
            {
                label: 'Dark/Night Theme',
                accelerator: 'CmdOrCtrl+Shift+N',
                click() {
                    console.log("Dark Theme")
                }
            }
        ]
    }, {
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
                    height: 599,
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
                    height: 547,
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
        default:
            break;
    }
}