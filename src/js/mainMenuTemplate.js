const {
    BrowserWindow,
    app
} = require('electron');
const createWindow = require('./createWindow')

const template = [{
    label: 'File',
    submenu: [{
        label: 'Open DevTools',
        accelerator: 'CommandOrControl+Shift+I',
        click() {
            var window = BrowserWindow.getFocusedWindow();
            window.webContents.openDevTools();
        }
    }, {
        label: 'Force Reload',
        accelerator: 'CommandOrControl+Shift+R',
        click() {
            var window = BrowserWindow.getFocusedWindow();
            window.webContents.reload();
        }
    }, {
        label: 'Quit',
        accelerator: 'CommandOrControl+Q',
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
                accelerator: 'CommandOrControl+Shift+D',
                click() {
                    console.log("Default Theme")
                }
            },
            {
                label: 'Dark/Night Theme',
                accelerator: 'CommandOrControl+Shift+N',
                click() {
                    console.log("Dark Theme")
                }
            }
        ]
    }, {
        label: 'Custom CSS Theme',
        accelerator: 'CommandOrControl+Shift+T',
        click() {
            createWindow('customCSS')
        }
    }, {
        label: 'Theme Customizer',
        accelerator: 'CommandOrControl+Alt+T',
        click() {
            createWindow('themeCustomizer')
        }
    }]
}, {
    label: 'Settings',
    submenu: [{
        label: 'Settings',
        accelerator: 'CommandOrControl+,',
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

module.exports = template;