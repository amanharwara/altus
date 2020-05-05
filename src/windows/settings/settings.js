// Import custom titlebar module
const customTitlebar = require('custom-electron-titlebar');

// Import extra electron modules
const {
    app,
    process,
    Menu,
    dialog
} = require('electron').remote;
const {
    ipcRenderer
} = require('electron');

// Import electron store module for settings
const Store = require('electron-store');

// Import default settings
const {
    defaultSettings
} = require("../../js/defaultSettings");

const fs = require('fs');

// Load the main settings into settings variable
let settings = new Store({
    name: 'settings'
});

// Checks if custom titlebar is enabled in settings & the platform isn't a Mac
if (Array.from(settings.get('settings')).find(s => s.id === 'customTitlebar').value === true && process.platform !== 'darwin') {
    // Create main window titlebar
    const mainTitlebar = new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#202224'),
        icon: '../otherAssets/icon.ico',
        itemBackgroundColor: customTitlebar.Color.fromHex('#1c2028'),
        menu: process.platform === 'darwin' ? Menu.getApplicationMenu() : new Menu(),
        minimizable: false,
        maximizable: false,
        closeable: true
    });
    // Setting title explicitly
    mainTitlebar.updateTitle(`Settings`);
} else {
    // CSS style when no custom titlebar
    let style = document.createElement('style');
    style.innerText = `body {
        padding: 0rem 1rem;
        border: 0 !important;
    }`;
    document.head.appendChild(style);
}

// Loop through all the settings (except tray icon on Linux as it is not supported)
Array.from(process.platform === 'linux' ? settings.get('settings').filter(s => s.id !== 'trayIcon' && s.id !== 'closeToTray') : settings.get('settings')).forEach(setting => {
    // Create setting element for DOM
    let settingElement = document.createRange()
        .createContextualFragment(`<div class="setting" data-setting="${setting.id}" data-value="${setting.value ? 'enabled' : 'disabled'}">
        <div class="information">
            <div class="setting-title">${setting.name}</div>
            <div class="setting-description">${setting.description}</div>
        </div>
        <div class="input-checkbox" id="${setting.id}-toggle">
            <input type="checkbox" id="${setting.id}-checkbox" class="checkbox" ${setting.value === true ? "checked" : ""}>
            <div class="toggle-bg"></div>
        </div>
    </div>`);

    // Append setting element to DOM
    document.querySelector('#settings-container').appendChild(settingElement);
});

// Save settings button
document.querySelector('.save.button').addEventListener('click', e => {
    // Create new array to store new settings
    let newSettings = [];

    // Replace save icon with spinner while saving
    document.querySelector('.save.button').innerHTML = '<span class="lni-spinner-solid lni-spin-effect"></span>';

    // Loop through current settings
    Array.from(process.platform === 'linux' ? settings.get('settings').filter(s => s.id !== 'trayIcon') : settings.get('settings')).forEach(setting => {
        // Find the DOM element of the setting
        let settingDOMElement = document.querySelector(`#${setting.id}-checkbox`);

        // Get new value of the setting
        let newValue = settingDOMElement.checked;

        // Set the new value to the current setting object
        setting.value = newValue === true ? true : false;

        // Push the current setting object to the newSettings array
        newSettings.push(setting);
    });

    // Get rid of spinner
    setTimeout(() => {
        document.querySelector('.save.button').innerHTML = 'Save';
    }, 250);

    // Set new settings globally
    settings.set('settings', newSettings);

    // Send IPC message to index.js because settings are changed
    ipcRenderer.send('settings-changed', true);
});

// Reset settings
document.querySelector('.reset.button').addEventListener('click', () => {
    if (confirm("Do you want to reset the settings?")) {
        settings.store = {
            settings: defaultSettings
        };
        ipcRenderer.send('settings-changed', true);
        window.location.reload();
    }
});

// Import settings
document.querySelector('.import.button').addEventListener('click', () => {
    dialog.showOpenDialog({
            title: "Import Settings",
            filters: [{
                name: "JSON",
                extensions: ["json"]
            }],
            properties: ['openFile']
        })
        .then(result => {
            if (!result.canceled) {
                fs.readFile(result.filePaths[0], (err, data) => {
                    if (!err) {
                        const imported = JSON.parse(data.toString());
                        settings.store = imported;
                        ipcRenderer.send('settings-changed', true);
                        window.location.reload();
                    }
                })
            }
        })
        .catch(err => {
            if (err) throw err;
            console.log(err);
        });
});

// Export settings
document.querySelector('.export.button').addEventListener('click', () => {
    dialog.showSaveDialog({
            title: "Export Settings",
            filters: [{
                name: "JSON",
                extensions: ["json"]
            }]
        })
        .then(result => {
            const {
                filePath,
                canceled
            } = result;
            if (!canceled) {
                const data = new Uint8Array(Buffer.from(JSON.stringify(settings.store, null, '\t')));
                fs.writeFile(filePath, data, (err) => {
                    if (err) throw err;
                });
            }
        })
        .catch(err => {
            if (err) throw err;
            console.log(err);
        });
});