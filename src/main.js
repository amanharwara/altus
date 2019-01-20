const {
    app,
    BrowserWindow,
    Menu
} = require('electron');
const url = require('url');
const path = require('path');
const mainMenuTemplate = require('./js/mainMenuTemplate');
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
            persistTheme: true,
            notifications: true,
            sound: true,
            trayIcon: true,
            showExitPrompt: true
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
        const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
        Menu.setApplicationMenu(mainMenu);
    });
}

//Quit app if all windows are closed
app.on('window-all-closed', () => {
    app.quit()
});