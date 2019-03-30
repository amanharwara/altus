const customTitlebar = require('custom-electron-titlebar');
const {
    BrowserWindow,
    dialog,
    Menu
} = require('electron').remote;
const {
    ipcRenderer
} = require('electron');
const Store = require('electron-store');
const fs = require('fs');

const settings = new Store({
    name: 'settings'
});

if (settings.get('customTitlebar.value') === true && process.platform !== 'darwin') {
    // Create main window titlebar
    const mainTitlebar = new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#21252B'),
        icon: '../assets/icons/icon.ico',
        menu: process.platform === 'darwin' ? Menu.getApplicationMenu() : new Menu(),
        minimizable: false,
        maximizable: false,
        closeable: true
    });

    // Setting title explicitly
    mainTitlebar.updateTitle(`Settings`);
}

// Load Settings
for (setting of settings) {
    let HTML = `
    <div class="ui item setting">
    <div class="content right floated">
        <div class="ui button setting-button ${setting[1].value === true ? "green" : "red"}" id="${setting[0]}Button" >${setting[1].value === true ? "Enabled": "Disabled"}</div>
    </div>
    <div class="content setting-name">
        <div class="header">
            ${setting[1].name}
        </div>
        <div class="description">
            ${setting[1].description}
        </div>
    </div>
</div>`;
    let range = document.createRange();
    range.selectNode(document.querySelector('.ui.divided.list'));
    let settingElement = range.createContextualFragment(HTML);
    document.querySelector('.ui.divided.list').appendChild(settingElement);
}

//Button functions
document.querySelector('#cancel-button').addEventListener('click', () => {
    BrowserWindow.getFocusedWindow().close();
});

// Setting Toggle Button
document.querySelectorAll('.setting-button').forEach(function(e) {
    e.addEventListener('click', function() {
        let value = e.innerText;
        if (value == "Enabled") {
            e.innerText = "Disabled";
            e.classList.toggle('green', false);
            e.classList.toggle('red', true);
        } else if (value == "Disabled") {
            e.innerText = "Enabled";
            e.classList.toggle('green', true);
            e.classList.toggle('red', false);
        }
    });
});

// Save Settings
document.querySelector('#save-button').addEventListener('click', () => {
    settings.set('trayIcon.value', document.querySelector('#trayIconButton').innerText == "Enabled" ? true : false);

    settings.set('showExitPrompt.value', document.querySelector('#showExitPromptButton').innerText == "Enabled" ? true : false);

    settings.set('customTitlebar.value', document.querySelector('#customTitlebarButton').innerText == "Enabled" ? true : false);

    ipcRenderer.send('settings-changed', true);
    BrowserWindow.getFocusedWindow().close();
});