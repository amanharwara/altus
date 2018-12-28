// Loading all the libraries
const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    shell,
    Notification,
    globalShortcut,
    Tray,
    dialog
} = electron;

//Defining the window variables
let mainWindow;
let themeWindow;
let prefWindow;
let trayIcon;

//Make application single-instance only
const singleInstanceLock = app.requestSingleInstanceLock();

if (!singleInstanceLock) {
    app.quit()
} else {
    app.on('second-instance', (e, cmd, pwd) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    });

    //App.on ready function
    app.on('ready', function() {
        mainWindow = new BrowserWindow({
            title: 'Altus',
            icon: "./img/icon.png"
        }); //Creates the main window
        mainWindow.maximize(); //Maximizing the main window always
        mainWindow.loadURL(url.format({ //Loads the mainwindow html file
            pathname: path.join(__dirname, 'windows', 'mainWindow.html'),
            protocol: 'file:',
            slashes: true
        }));
        const mainMenu = Menu.buildFromTemplate(mainMenuTemp); //Applies the main menu template
        Menu.setApplicationMenu(mainMenu); //Sets the main menu
        mainWindow.on('closed', function() { //Quits app when main window is closed
            mainWindow = null
            app.quit();
        });

        ipcMain.on('theme:change', function(e, data) { //Runs when the user wants to change the theme
            mainWindow.webContents.send('theme:change', data);
            themeWindow.close(); //Closes the theme window if open
        });

        ipcMain.on('linkOpen', function(e, data) {
            shell.openExternal(data);
        });

        ipcMain.on('settingsChanged', function(e, f) {
            mainWindow.webContents.send('settingsChanged', true);
            prefWindow.close();
        });

        globalShortcut.register('CmdOrCtrl+Shift+F12', function() {
            var focusedWindow = BrowserWindow.getFocusedWindow();
            focusedWindow.webContents.openDevTools();
        });

        globalShortcut.register('CmdOrCtrl+Shift+R', function() {
            var focusedWindow = BrowserWindow.getFocusedWindow();
            focusedWindow.webContents.reload();
        });

        init();

        ipcMain.on('notification-process-1', function(e, i) {
            mainWindow.webContents.send('notification-process-1', i);
        });

        function init() {
            var theme, persistTheme, toggleNotifications, toggleSound, toggleTray;
            ipcMain.on('preferences', function(e, pref) {
                theme = pref.theme || {
                    name: 'default-theme',
                    css: ''
                };

                if (typeof pref.toggleTray !== "undefined") {
                    toggleTray = pref.toggleTray;
                } else {
                    toggleTray = true;
                }

                if (typeof pref.persistTheme !== "undefined") {
                    persistTheme = pref.persistTheme;
                } else {
                    persistTheme = true;
                }

                if (typeof pref.toggleNotifications !== "undefined") {
                    toggleNotifications = pref.toggleNotifications;
                } else {
                    toggleNotifications = true;
                }

                if (typeof pref.toggleSound !== "undefined") {
                    toggleSound = pref.toggleSound;
                } else {
                    toggleSound = true;
                }

                if (theme.name == undefined || theme.css == undefined) {
                    theme.name = 'default-theme';
                    theme.css = '';
                }
                if (persistTheme == undefined) {
                    persistTheme = true;
                }
                if (persistTheme) setTheme();
                setSound(toggleSound);

                if (toggleTray) {
                    setTray();
                } else {
                    if (trayIcon) {
                        trayIcon.destroy();
                    }
                    trayIcon = null;
                    trayIcon = undefined;
                }
            });

            function setTray() {
                //Tray icon
                var trayIconPath = path.join(__dirname, 'img/icon.png');
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
                        dialog.showMessageBox({
                            type: 'question',
                            buttons: ["OK", "Cancel"],
                            title: "Exit",
                            message: "Are you sure you want to exit?"
                        }, function(res) {
                            if (res == 0) {
                                app.quit();
                                return;
                            }
                        });
                    }
                }]);
                if (process.platform !== "darwin") {
                    trayIcon = new Tray(trayIconPath);
                    trayIcon.setToolTip('Altus');
                    trayIcon.setContextMenu(trayContextMenu);
                } else {
                    app.dock.setMenu(trayContextMenu);
                }
            }

            function setTheme() {
                if (theme.name == 'default-theme') {
                    mainWindow.webContents.send('theme:change', {
                        name: 'default-theme'
                    });
                } else if (theme.name == 'dark-theme') {
                    mainWindow.webContents.send('theme:change', {
                        name: 'dark-theme'
                    });
                } else {
                    mainWindow.webContents.send('theme:change', {
                        name: theme.name,
                        css: theme.css
                    });
                }
            }

            function setSound(toggleSound) {
                mainWindow.webContents.send('muteSound', toggleSound);
            }

            mainWindow.webContents.on('did-finish-load', function() {
                mainWindow.webContents.send('sendPreferencesBool', true);
            });
        }
    });
}

function createAboutWindow() {
    if (typeof aboutWindow == 'object') {
        aboutWindow.show();
    } else {
        aboutWindow = new BrowserWindow({
            parent: mainWindow,
            icon: "./img/icon.png",
            title: "About",
            width: 500,
            height: 300,
            resizable: false,
            frame: false
        });
        aboutWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'windows', 'aboutWindow.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    aboutWindow.on('close', function(e) {
        e.preventDefault();
        aboutWindow.hide();
    });
    aboutWindow.setResizable(false);
}

function createThemeWindow() { //Creates the theme window
    if (typeof themeWindow == 'object') { //Checks if theme window is already set
        themeWindow.show(); //Shows the theme window
    } else {
        themeWindow = new BrowserWindow({ //Creates new instance of themewindow if not already opened
            parent: mainWindow,
            icon: "./img/icon.png",
            title: "Custom Theme"
        });
        themeWindow.loadURL(url.format({ //loads the theme window html file
            pathname: path.join(__dirname, 'windows', 'themeWindow.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    themeWindow.on('close', function(e) { //Deletes all instances of themeWindow when it is closed.
        e.preventDefault();
        themeWindow.hide();
    });
    themeWindow.setResizable(false); //Makes theme window non-resizable
}

function createPrefWindow() { //Creates the preferences window
    if (typeof prefWindow == 'object') { //Checks if theme window is already set
        prefWindow.show(); //Shows the theme window
    } else {
        prefWindow = new BrowserWindow({ //Creates new instance of themewindow if not already opened
            parent: mainWindow,
            icon: "./img/icon.png",
            title: "Preferences"
        });
        prefWindow.loadURL(url.format({ //loads the theme window html file
            pathname: path.join(__dirname, 'windows', 'prefWindow.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    prefWindow.on('close', function(e) { //Deletes all instances of themeWindow when it is closed.
        e.preventDefault();
        prefWindow.hide();
    });
    prefWindow.setResizable(false); //Makes theme window non-resizable
}

const mainMenuTemp = [{ //The main menu template
    label: 'File',
    submenu: [{
        label: 'Quit',
        accelerator: 'CommandOrControl+Q',
        click() {
            app.quit();
        }
    }]
}, {
    label: 'View',
    submenu: [{
        label: 'Change Theme',
        submenu: [{
                label: 'Default Theme',
                accelerator: 'CommandOrControl+Shift+D',
                click() {
                    mainWindow.webContents.send('theme:change', {
                        name: 'default-theme'
                    });
                }
            },
            {
                label: 'Dark/Night Theme',
                accelerator: 'CommandOrControl+Shift+N',
                click() {
                    mainWindow.webContents.send('theme:change', {
                        name: 'dark-theme'
                    });
                }
            }
        ]
    }, {
        label: 'Custom Theme',
        accelerator: 'CommandOrControl+Shift+T',
        click() {
            createThemeWindow()
        }
    }]
}, {
    label: 'Settings',
    submenu: [{
        label: 'Preferences',
        accelerator: 'CommandOrControl+P',
        click() {
            createPrefWindow()
        }
    }]
}, {
    label: "About",
    click() {
        createAboutWindow()
    },
    submenu: [{
        label: "About",
        click() {
            createAboutWindow()
        }
    }]
}];

if (process.platform == 'darwin') { //Fixes main menu issue for Mac
    mainMenuTemp.unshift({});
}