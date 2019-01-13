const {
    BrowserWindow
} = require('electron');

const template = [{
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
        label: 'Custom Theme',
        accelerator: 'CommandOrControl+Shift+T',
        click() {
            console.log("Custom Theme Window")
        }
    }]
}, {
    label: 'Settings',
    submenu: [{
        label: 'Preferences',
        accelerator: 'CommandOrControl+P',
        click() {
            console.log("Preferences Window")
        }
    }]
}, {
    label: "About",
    submenu: [{
        label: "About",
        click() {
            console.log("About Window")
        }
    }]
}]

module.exports = template;