const customTitlebar = require('custom-electron-titlebar');
const {
    Menu
} = require('electron').remote;
// Create main window titlebar
const mainTitlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#21252B'),
    icon: '../assets/icons/icon.ico',
    menu: new Menu(),
    minimizable: false,
    maximizable: false,
    closeable: true
});

// Setting title explicitly
mainTitlebar.updateTitle(`Custom CSS for WhatsApp`);