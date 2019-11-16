// Base Electron modules
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

// Import electron context menu library
const contextMenu = require('electron-context-menu');

// Import createWindow function
const {
    createWindow
} = require('./js/createWindow');

// Used for storing settings
const Store = require('electron-store');

// Used for fetching base dark theme CSS & more
const fetch = require('node-fetch');

// Used to create a message count badge on Windows
let Badge;
if (process.platform == 'win32') Badge = require('electron-windows-badge');

// Declaring the window variables to use later
let mainWindow,
    aboutWindow,
    settingsWindow,
    customThemeWindow,
    themeManagerWindow,
    checkUpdatesWindow;

// Declaring the tray icon variable to use later
let trayIcon;

// Get the dark theme css using fetch & generate the default themes list
getDarkTheme(createThemesList);

/**
 * Get the Dark Theme CSS and pass it to the createThemesList callback
 * @param {createThemesListCallback} createThemesList
 */
function getDarkTheme(createThemesList) {
    fetch('https://raw.githubusercontent.com/ShadyThGod/shadythgod.github.io/master/css/altus-dark-theme.css', {
            cache: 'no-cache'
        })
        .then(res => {
            if (res.ok) {
                return res.text();
            } else {
                throw new Error(res.statusText);
            }
        })
        .then(css => createThemesList(css))
        .catch(e => {
            dialog.showErrorBox('Error: Base Dark Theme Not Loaded (No Internet Connection)', e);
            createThemesList('');
        })
}

// Declaring the themesList variable
let themesList;

/**
 * Create the default themes list
 * @callback createThemesListCallback
 * @param {string} darkThemeCSS CSS for the dark theme
 */
function createThemesList(darkThemeCSS) {
    themesList = new Store({
        name: 'themes',
        defaults: {
            themes: [{
                name: 'Default',
                css: ''
            }, {
                name: 'Dark',
                css: darkThemeCSS
            }]
        }
    });
}

// Declaring the fileMenuTemplate variable & creating the template for the 'File' menu
let fileMenuTemplate;

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

// Checks if app is packaged or not
if (!app.isPackaged) {
    // Allows DevTools if app is not packaged
    fileMenuTemplate.unshift({
        label: 'Open DevTools',
        accelerator: 'CmdOrCtrl+Shift+I',
        click() {
            var window = BrowserWindow.getFocusedWindow();
            window.webContents.openDevTools();
        }
    });
}

// Create the main menu template
const mainMenuTemplate = [{
    label: 'File',
    submenu: fileMenuTemplate
}, {
    label: "Edit",
    submenu: [{
            label: "Undo",
            accelerator: "CmdOrCtrl+Z",
            selector: "undo:"
        },
        {
            label: "Redo",
            accelerator: "Shift+CmdOrCtrl+Z",
            selector: "redo:"
        },
        {
            type: "separator"
        },
        {
            label: "Cut",
            accelerator: "CmdOrCtrl+X",
            selector: "cut:"
        },
        {
            label: "Copy",
            accelerator: "CmdOrCtrl+C",
            selector: "copy:"
        },
        {
            label: "Paste",
            accelerator: "CmdOrCtrl+V",
            selector: "paste:"
        },
        {
            label: "Select All",
            accelerator: "CmdOrCtrl+A",
            selector: "selectAll:"
        }
    ]
}, {
    label: 'Zoom',
    submenu: [{
        label: 'Zoom In',
        accelerator: 'CmdOrCtrl+numadd',
        click() {
            mainWindow.webContents.send('zoom-in');
        }
    }, {
        label: 'Zoom Out',
        accelerator: 'CmdOrCtrl+numsub',
        click() {
            mainWindow.webContents.send('zoom-out');
        }
    }, {
        label: 'Reset Zoom',
        accelerator: 'CmdOrCtrl+num0',
        click() {
            mainWindow.webContents.send('reset-zoom');
        }
    }]
}, {
    label: 'Theme',
    submenu: [{
        label: 'Custom Theme',
        accelerator: 'CmdOrCtrl+Shift+T',
        click() {
            // Checks if custom theme window exists
            if (typeof customThemeWindow === 'object') {
                // Shows the custom theme window instead of creating new one
                customThemeWindow.show();
            } else {
                // Creates new Browser Window object using createWindow function
                customThemeWindow = createWindow({
                    id: 'customTheme',
                    title: 'Custom Theme',
                    width: 400,
                    height: 480,
                    resizable: true,
                    mainWindowObject: mainWindow,
                    min: true,
                    max: false,
                    minWidth: 630,
                    minHeight: 480,
                    maxWidth: '',
                    maxHeight: ''
                });
                // Loads Custom Theme Window HTML
                customThemeWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'windows', 'customTheme', 'customTheme.html'),
                    protocol: 'file:',
                    slashes: true
                }));
                customThemeWindow.once('ready-to-show', () => {
                    // Shows the custom theme window
                    customThemeWindow.show();
                });
                // Close window event (Hides window when closed, instead of deleting it)
                customThemeWindow.on('close', e => {
                    e.preventDefault();
                    customThemeWindow.hide();
                });
            }
        }
    }, {
        label: 'Manage Themes',
        accelerator: 'CmdOrCtrl+T',
        click() {
            // Checks if theme manager window exists
            if (typeof themeManagerWindow === 'object') {
                // Shows theme manager window instead of creating new object
                themeManagerWindow.show();
            } else {
                // Creates new Browser Window object using createWindow function
                themeManagerWindow = createWindow({
                    id: 'themeManager',
                    title: 'Manage Themes',
                    width: 414,
                    height: 478,
                    resizable: true,
                    mainWindowObject: mainWindow,
                    min: true,
                    max: false,
                    minWidth: 300,
                    minHeight: 380,
                    maxWidth: '',
                    maxHeight: ''
                });
                // Loads Theme Manager Window HTML
                themeManagerWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'windows', 'themeManager', 'themeManager.html'),
                    protocol: 'file:',
                    slashes: true
                }));
                themeManagerWindow.once('ready-to-show', () => {
                    // Shows Theme Manager window
                    themeManagerWindow.show();
                });
                // Close window event (Hides window when closed, instead of deleting it)
                themeManagerWindow.on('close', e => {
                    e.preventDefault();
                    themeManagerWindow.hide();
                });
            }
        }
    }]
}, {
    label: 'Settings',
    submenu: [{
        label: 'Settings',
        accelerator: 'CmdOrCtrl+,',
        click() {
            // Checks settings window exists
            if (typeof settingsWindow === 'object') {
                // Shows settings window instead of creating new object
                settingsWindow.show();
            } else {
                // Creates new Browser Window object using createWindow function
                settingsWindow = createWindow({
                    id: 'settings',
                    title: 'Settings',
                    width: 450,
                    height: 450,
                    resizable: true,
                    mainWindowObject: mainWindow,
                    min: true,
                    max: false,
                    minWidth: 450,
                    minHeight: 450,
                    maxWidth: '',
                    maxHeight: ''
                });
                // Loads settings Window HTML
                settingsWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'windows', 'settings', 'settings.html'),
                    protocol: 'file:',
                    slashes: true
                }));
                settingsWindow.once('ready-to-show', () => {
                    // Shows settings window
                    settingsWindow.show();
                });
                // Close window event (Hides window when closed, instead of deleting it)
                settingsWindow.on('close', e => {
                    e.preventDefault();
                    settingsWindow.hide();
                });
            }
        }
    }]
}, {
    label: "About",
    submenu: [{
        label: "About",
        click() {
            // Checks if about window exists
            if (typeof aboutWindow === 'object') {
                // Shows about window instead of creating new object
                aboutWindow.show();
            } else {
                // Creates new Browser Window object using createWindow function
                aboutWindow = createWindow({
                    id: 'aboutWindow',
                    title: 'About',
                    width: 435,
                    height: 300,
                    resizable: false,
                    mainWindowObject: mainWindow,
                    min: true,
                    max: false,
                    minWidth: '',
                    minHeight: '',
                    maxWidth: '',
                    maxHeight: ''
                });
                // Loads Theme Manager Window HTML
                aboutWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'windows', 'about', 'about.html'),
                    protocol: 'file:',
                    slashes: true
                }));
                aboutWindow.once('ready-to-show', () => {
                    // Shows About window
                    aboutWindow.show();
                });
                // Close window event (Hides window when closed, instead of deleting it)
                aboutWindow.on('close', e => {
                    e.preventDefault();
                    aboutWindow.hide();
                });
            }
        }
    }, {
        label: "Check For Updates",
        accelerator: 'CmdOrCtrl+Shift+U',
        click() {
            // Check is window exists already
            if (typeof checkUpdatesWindow === 'object') {
                // Show window instead of creating new object
                checkUpdatesWindow.show();
            } else {
                // Create new browser window object for the window
                checkUpdatesWindow = createWindow({
                    id: 'checkUpdates',
                    title: 'Check Updates',
                    width: 435,
                    height: 340,
                    resizable: true,
                    mainWindowObject: mainWindow,
                    min: false,
                    max: false,
                    minWidth: 435,
                    minHeight: 340,
                    maxWidth: '',
                    maxHeight: ''
                });
                checkUpdatesWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'windows', 'checkUpdates', 'checkUpdates.html'),
                    protocol: 'file:',
                    slashes: true
                }));
                checkUpdatesWindow.once('ready-to-show', () => {
                    // Shows About window
                    checkUpdatesWindow.show();
                });
                // Close window event (Hides window when closed, instead of deleting it)
                checkUpdatesWindow.on('close', e => {
                    e.preventDefault();
                    checkUpdatesWindow.hide();
                });
            }
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
        }, {
            label: 'Discord Chat',
            click: () => {
                shell.openExternal('https://discord.gg/mGxNGP6');
            }
        }]
    }]
}];

// Using singleInstanceLock for making app single instance
const singleInstanceLock = app.requestSingleInstanceLock();

// Checks for single instance lock
if (!singleInstanceLock) {
    // Quits the second instance
    app.quit();
} else {
    // Focus current instance
    app.on('second-instance', () => {
        // Checks if mainWindow object exists
        if (mainWindow) {
            // Checks if main window is minimized
            if (mainWindow.isMinimized()) {
                // Restores the main window
                mainWindow.restore();
            }
            // Focuses the main window
            mainWindow.focus();
        }
    });

    // Sets the default settings
    let settings = new Store({
        name: 'settings',
        defaults: {
            settings: [{
                value: true,
                name: 'Tray Icon',
                description: 'Toggle the tray icon',
                id: 'trayIcon'
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
                value: true,
                name: 'Prompt When Closing Tab',
                description: 'When enabled, you will be prompted when you close a tab. This helps if you accidentally click the close button of a tab.',
                id: 'tabClosePrompt'
            }]
        }
    });

    app.on('ready', () => {
        // Create the main window object
        mainWindow = new BrowserWindow({
            // Set main window title
            title: `Altus ${app.getVersion()}`,
            // Enable frame if on macOS or if custom titlebar setting is disabled
            frame: process.platform !== 'darwin' ? !Array.from(settings.get('settings')).find(s => s.id === 'customTitlebar').value : true,
            // Show default title bar on macOS and hide it on others
            titleBarStyle: process.platform !== 'darwin' ? 'hidden' : 'default',
            // Set main window background color
            backgroundColor: '#282C34',
            // Set main window icon
            icon: './build/icon.ico',
            webPreferences: {
                // Enable <webview> tag for embedding WhatsApp
                webviewTag: true,
                // Enable nodeIntegration so window can use node functions
                nodeIntegration: true
            },
            // Hides main window until it is ready to show
            show: false,
            // Minimum width
            minWidth: 818,
            // Minimum height
            minHeight: 636
        });

        // Maximizes the main window
        mainWindow.maximize();

        // Shows window once ready
        mainWindow.once('ready-to-show', () => {
            mainWindow.show();
        });

        // Load the main window HTML file
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'windows', 'main', 'main.html'),
            protocol: 'file:',
            slashes: true
        }));

        // Main Window Close Event
        mainWindow.on('close', e => {
            // Checks if "app.showExitPrompt" variable is true
            if (app.showExitPrompt) {
                // Stops app from closing in usual manner
                e.preventDefault();
                // Uses a new function to confirm and then closes the app
                confirmExit();
            }
        });

        // Main Window Closed Event
        mainWindow.on('closed', () => {
            // Gets rid of the main window object from memory
            mainWindow = null;
            // Quits app
            app.quit();
        });

        // Creates a new message count badge for the main window if the Badge variable is enabled
        if (Badge) new Badge(mainWindow, {
            font: '4px Calibri'
        })

        // Building main menu from template
        const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

        // Setting the main menu
        Menu.setApplicationMenu(mainMenu);

        /**
         * Set global settings
         */
        function setGlobalSettings() {
            if (settings.get('settings').find(s => s.id === 'trayIcon').value === true) {
                // If tray icon setting is enabled

                // Get tray icon image
                let trayIconImage = nativeImage.createFromPath(path.join(__dirname, '/windows/otherAssets/icon.ico'));

                // Create context menu for tray icon
                let trayContextMenu = Menu.buildFromTemplate([{
                    label: 'Maximize',
                    click() {
                        if (mainWindow) {
                            // Show the main window
                            mainWindow.show();
                            // Focus the main window
                            mainWindow.focus();
                        };
                    }
                }, {
                    label: 'Minimize to Tray',
                    click() {
                        // Hide the main window i.e. minimize to tray
                        mainWindow.hide();
                    }
                }, {
                    label: 'Exit',
                    click() {
                        // Quit the app
                        app.quit()
                    }
                }]);

                // Checks if the tray icon already exists or not
                if (typeof trayIcon !== "object") {
                    if (process.platform !== 'darwin' && process.platform !== 'linux') {
                        // Create tray icon on Windows
                        trayIcon = new Tray(trayIconImage);
                        // Set tray icon tooltip
                        trayIcon.setToolTip('Altus');
                        // Set tray icon context menu
                        trayIcon.setContextMenu(trayContextMenu);
                    } else if (process.platform === 'darwin') {
                        // Set dock menu on MacOS
                        app.dock.setMenu(trayContextMenu);
                    }
                }
            } else {
                // If tray icon setting is disabled
                if (trayIcon) {
                    // Destroy tray icon programmatically
                    trayIcon.destroy();
                }
                // Nullify tray icon variable
                trayIcon = null;
                trayIcon = undefined;
            }

            if (settings.get('settings').find(s => s.id === 'exitPrompt').value === true) {
                app.showExitPrompt = true;
            } else {
                app.showExitPrompt = false;
            }
        }

        // Set global settings for the first start
        setGlobalSettings();

        // IPC Functions

        // Send 'zoom-in' message to mainWindow
        ipcMain.on('zoom-in', e => mainWindow.webContents.send('zoom-in'));
        // Send 'zoom-out' message to mainWindow
        ipcMain.on('zoom-out', e => mainWindow.webContents.send('zoom-out'));
        // Send 'reset-zoom' message to mainWindow
        ipcMain.on('reset-zoom', e => mainWindow.webContents.send('reset-zoom'));

        // Opens links in external browser
        ipcMain.on('link-open', (e, link) => shell.openExternal(link));

        // Refresh main window when a theme is added or removed
        ipcMain.on('themes-changed', e => mainWindow.webContents.send('themes-changed', true));

        // Set global settings whenever they are changed
        ipcMain.on('settings-changed', e => setGlobalSettings());

        // Message Indicator
        ipcMain.on('message-indicator', (e, i) => {
            if (process.platform === 'darwin') {
                if (i > 0 && i !== null && i !== undefined) {
                    app.dock.setBadge('·');
                } else {
                    app.dock.setBadge('');
                }
            }
            if (process.platform === 'win32') {
                mainWindow.webContents.send('message-indicator', i);
            }
        });
    });

    // When web contents are created
    app.on('web-contents-created', (e, c) => {
        // Initialize the context menu
        contextMenu({
            prepend: (d, p, bW) => [{
                // Allows user to search the selected text on Google in external browser
                label: 'Search Google for "{selection}"',
                visible: p.selectionText.trim().length > 0,
                click: () => {
                    shell.openExternal(`https://google.com/search?q=${encodeURIComponent(p.selectionText)}`);
                }
            }],
            window: c,
            showCopyImage: false,
            showSaveImageAs: true,
        })
    });

    // Quits app if all windows are closed
    app.on('window-all-closed', () => {
        app.quit();
    });
}

/**
 * Confirm exiting using a dialog
 */
function confirmExit() {
    dialog.showMessageBox({
        type: 'question',
        buttons: ["OK", "Cancel"],
        title: "Exit",
        message: "Are you sure you want to exit?"
    }).then(res => {
        if (res.response == 0) {
            app.showExitPrompt = false;
            app.quit();
            return;
        }
    });
}