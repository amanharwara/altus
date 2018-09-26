// Loading all the libraries
const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

const { app, BrowserWindow, Menu, ipcMain, shell, Notification, globalShortcut } = electron;

//Defining the window variables
let mainWindow;
let themeWindow;
let prefWindow;

//App.on ready function
app.on('ready', function() {
    mainWindow = new BrowserWindow({
        title: 'Altus',
        icon: "./build/icon.ico"
    }); //Creates the main window
    mainWindow.maximize(); //Maximizing the main window always
    mainWindow.loadURL(url.format({ //Loads the mainwindow html file
        pathname: path.join(__dirname, 'windows', 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    const mainMenu = Menu.buildFromTemplate(mainMenuTemp); //Applies the main menu template
    Menu.setApplicationMenu(mainMenu); //Sets the main menu
    mainWindow.on('close', function() { //Quits app when main window is closed
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
        mainWindow.webContents.openDevTools();
    });

    init();

    ipcMain.on('notification-process-1', function(e, i) {
        mainWindow.webContents.send('notification-process-1', i);
    });

    function init() {
        var theme, persistTheme, toggleNotifications, toggleMessagePreview, toggleSound;
        ipcMain.on('preferences', function(e, pref) {
            theme = pref.theme || { name: 'default-theme', css: '' };

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

            if (typeof pref.toggleMessagePreview !== "undefined") {
                toggleMessagePreview = pref.toggleMessagePreview;
            } else {
                toggleMessagePreview = true;
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
        });

        function setTheme() {
            if (theme.name == 'default-theme') {
                mainWindow.webContents.send('theme:change', { name: 'default-theme' });
            } else if (theme.name == 'dark-theme') {
                mainWindow.webContents.send('theme:change', { name: 'dark-theme' });
            } else {
                mainWindow.webContents.send('theme:change', { name: theme.name, css: theme.css });
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

function createAboutWindow() {
    if (typeof aboutWindow == 'object') {
        aboutWindow.show();
    } else {
        aboutWindow = new BrowserWindow({
            parent: mainWindow,
            icon: "./build/icon.ico",
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
    aboutWindow.on('close', function() {
        aboutWindow = null;
        aboutWindow = undefined;
    });
    aboutWindow.setResizable(false);
}

function createThemeWindow() { //Creates the theme window
    if (typeof themeWindow == 'object') { //Checks if theme window is already set
        themeWindow.show(); //Shows the theme window
    } else {
        themeWindow = new BrowserWindow({ //Creates new instance of themewindow if not already opened
            parent: mainWindow,
            modal: true,
            icon: "./build/icon.ico",
            title: "Custom Theme"
        });
        themeWindow.loadURL(url.format({ //loads the theme window html file
            pathname: path.join(__dirname, 'windows', 'themeWindow.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    themeWindow.on('close', function() { //Deletes all instances of themeWindow when it is closed.
        themeWindow = null;
        themeWindow = undefined;
    });
    themeWindow.setResizable(false); //Makes theme window non-resizable
}

function createPrefWindow() { //Creates the preferences window
    if (typeof prefWindow == 'object') { //Checks if theme window is already set
        prefWindow.show(); //Shows the theme window
    } else {
        prefWindow = new BrowserWindow({ //Creates new instance of themewindow if not already opened
            parent: mainWindow,
            modal: true,
            icon: "./build/icon.ico",
            title: "Preferences"
        });
        prefWindow.loadURL(url.format({ //loads the theme window html file
            pathname: path.join(__dirname, 'windows', 'prefWindow.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    prefWindow.on('close', function() { //Deletes all instances of themeWindow when it is closed.
        prefWindow = null;
        prefWindow = undefined;
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
                    mainWindow.webContents.send('theme:change', { name: 'default-theme' });
                }
            },
            {
                label: 'Dark/Night Theme',
                accelerator: 'CommandOrControl+Shift+N',
                click() {
                    mainWindow.webContents.send('theme:change', { name: 'dark-theme' });
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
    }
}];

if (process.platform == 'darwin') { //Fixes main menu issue for Mac
    mainMenuTemp.unshift({});
}