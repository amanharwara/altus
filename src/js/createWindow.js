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
                    title: `About Altus`
                })
                aboutWindow.loadURL(url.format({ //Loads the about window html file
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
                    title: `Settings`
                })
                settingsWindow.loadURL(url.format({ //Loads the settings window html file
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
                    title: `Custom CSS for WhatsApp`
                })
                customCSSWindow.loadURL(url.format({ //Loads the settings window html file
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
                    title: `Customize Theme`
                })
                themeCustomizerWindow.loadURL(url.format({ //Loads the settings window html file
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
        default:
            break;
    }
}

module.exports = createWindow;