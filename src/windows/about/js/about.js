const customTitlebar = require('custom-electron-titlebar');
const {
    app,
    process,
    Menu
} = require('electron').remote;
const {
    ipcRenderer
} = require('electron');

// Create main window titlebar
const mainTitlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#21252B'),
    icon: '../assets/icons/icon.ico',
    menu: new Menu(),
    minimizable: false,
    maximizable: false,
    closeable: true
});

document.getElementById('version').innerText = app.getVersion();
document.getElementById('electron-version').innerText = 'v' + process.versions.electron;
document.getElementById('chrome-version').innerText = 'v' + process.versions.chrome;
document.getElementById('node-version').innerText = 'v' + process.versions.node;

window.onclick = e => {
    e.preventDefault();
    if (e.target.tagName == "A") ipcRenderer.send('link-open', e.target.href)
};

// Setting title explicitly
mainTitlebar.updateTitle(`About Altus`)