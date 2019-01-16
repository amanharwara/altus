const {
    Titlebar
} = require('custom-electron-titlebar');
const {
    app,
    process
} = require('electron').remote;

// Create main window titlebar
const mainTitlebar = new Titlebar('#21252B', {
    icon: null,
    menu: null,
    minimizable: false,
    maximizable: false
});

document.getElementById('version').innerText = app.getVersion();
document.getElementById('electron-version').innerText = 'v' + process.versions.electron;
document.getElementById('chrome-version').innerText = 'v' + process.versions.chrome;
document.getElementById('node-version').innerText = 'v' + process.versions.node;

// Setting title explicitly
mainTitlebar.updateTitle(`About Altus`);