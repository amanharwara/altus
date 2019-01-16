const {
    Titlebar
} = require('custom-electron-titlebar');

// Create main window titlebar
const mainTitlebar = new Titlebar('#21252B', {
    icon: '../assets/icons/icon.ico',
    menu: null
});

// Setting title explicitly
mainTitlebar.updateTitle(`Settings`);