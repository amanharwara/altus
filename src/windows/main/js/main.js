const {
    Titlebar
} = require('custom-electron-titlebar');
const {
    app
} = require('electron').remote;

// Create main window titlebar
const mainTitlebar = new Titlebar('#21252B', {
    icon: '../../build/icon.ico',
    menuItemHoverColor: '#3d444e',
});

// Setting title explicitly
mainTitlebar.updateTitle(`Altus ${app.getVersion()}`);