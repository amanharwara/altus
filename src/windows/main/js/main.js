const customTitlebar = require('custom-electron-titlebar');
const {
    app,
    process
} = require('electron').remote;
const {
    ipcRenderer
} = require('electron');

// Create main window titlebar
const mainTitlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#21252B'),
    icon: '../assets/icons/icon.ico',
    itemBackgroundColor: customTitlebar.Color.fromHex('#3d444e'),
});

ipcRenderer.on('settings-changed', e => window.location.reload(true));

// Setting title explicitly
mainTitlebar.updateTitle(`Altus ${app.getVersion()}`);