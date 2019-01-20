const {
    BrowserWindow
} = require('electron');
const url = require('url');
const path = require('path');

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
                    titleBarStyle: 'hidden',
                    width: 320,
                    height: 400,
                    resizable: false,
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
                    titleBarStyle: 'hidden',
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
                    titleBarStyle: 'hidden',
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
                    titleBarStyle: 'hidden',
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

module.exports = createWindow;