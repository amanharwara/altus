const customTitlebar = require('custom-electron-titlebar');
const {
    app,
    process,
    Menu,
    MenuItem
} = require('electron').remote;
const {
    ipcRenderer
} = require('electron');

// Create main window titlebar
const mainTitlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#21252B'),
    icon: '../assets/icons/icon.ico',
    menu: process.platform === 'darwin' ? Menu.getApplicationMenu() : new Menu(),
    minimizable: false,
    maximizable: false,
    closeable: true
});

document.querySelector('.altus-version').innerText = app.getVersion();

// Setting title explicitly
mainTitlebar.updateTitle(`About Altus`)