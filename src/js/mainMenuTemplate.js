const {
    BrowserWindow,
    app
} = require('electron');
const createWindow = require('./createWindow')

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

module.exports = template;