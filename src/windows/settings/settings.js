// Import custom titlebar module
const customTitlebar = require('custom-electron-titlebar');

// Import extra electron modules
const {
    app,
    process,
    Menu
} = require('electron').remote;
const {
    ipcRenderer
} = require('electron');

// Import electron store module for settings
const Store = require('electron-store');

// Load the main settings into settings variable
let settings = new Store({
    name: 'settings'
});

// Checks if custom titlebar is enabled in settings & the platform isn't a Mac
if (Array.from(settings.get('settings')).find(s => s.id === 'customTitlebar').value === true && process.platform !== 'darwin') {
    // Create main window titlebar
    const mainTitlebar = new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#1a1821'),
        icon: '../otherAssets/icon.ico',
        itemBackgroundColor: customTitlebar.Color.fromHex('#1c2028'),
        menu: process.platform === 'darwin' ? Menu.getApplicationMenu() : new Menu(),
        minimizable: false,
        maximizable: false,
        closeable: true
    });
    // Setting title explicitly
    mainTitlebar.updateTitle(`Settings`);
}

// Loop through all the settings (except tray icon on Linux as it is not supported)
Array.from(process.platform === 'linux' ? settings.get('settings').filter(s => s.id !== 'trayIcon') : settings.get('settings')).forEach(setting => {
    // Create setting element for DOM
    let settingElement = document.createRange().createContextualFragment(`<div class="setting" data-setting="${setting.id}" data-value="${setting.value ? 'enabled' : 'disabled'}"><div class="information"><div class="setting-title">${setting.name}</div><div class="setting-description">${setting.description}</div></div><div id="${setting.id}-toggle" class="setting-toggle ${setting.value ? 'setting-toggle-enabled' : 'setting-toggle-disabled'}">${setting.value ? '<span class="lni-check-mark-circle"></span> Enabled' : '<span class="lni-cross-circle"></span> Disabled'}</div></div>`);

    // Append setting element to DOM
    document.querySelector('#settings-container').appendChild(settingElement);

    // Click listener for toggle button
    document.querySelector(`#${setting.id}-toggle`).addEventListener('click', () => {
        if (document.querySelector(`#${setting.id}-toggle`).classList.contains('setting-toggle-enabled')) {
            document.querySelector(`#${setting.id}-toggle`).classList.remove('setting-toggle-enabled');
            document.querySelector(`#${setting.id}-toggle`).classList.add('setting-toggle-disabled');
            document.querySelector(`#${setting.id}-toggle`).innerHTML = '<span class="lni-cross-circle"></span> Disabled';
            document.querySelector(`#${setting.id}-toggle`).parentElement.setAttribute('data-value', 'disabled');
        } else {
            document.querySelector(`#${setting.id}-toggle`).classList.add('setting-toggle-enabled');
            document.querySelector(`#${setting.id}-toggle`).classList.remove('setting-toggle-disabled');
            document.querySelector(`#${setting.id}-toggle`).innerHTML = '<span class="lni-check-mark-circle"></span> Enabled';
            document.querySelector(`#${setting.id}-toggle`).parentElement.setAttribute('data-value', 'enabled');
        }
    });
});

// Save settings button
document.querySelector('.save.button').addEventListener('click', e => {
    // Create new array to store new settings
    let newSettings = [];

    // Replace save icon with spinner while saving
    document.querySelector('.save.button').innerHTML = '<span class="lni-spinner-solid lni-spin-effect"></span>';

    // Loop through current settings
    Array.from(settings.get('settings')).forEach(setting => {
        // Find the DOM element of the setting
        let settingDOMElement = document.querySelector(`[data-setting="${setting.id}"]`);

        // Get new value of the setting
        let newValue = settingDOMElement.getAttribute('data-value');

        // Set the new value to the current setting object
        setting.value = newValue === 'enabled' ? true : false;

        // Push the current setting object to the newSettings array
        newSettings.push(setting);
    });

    // Get rid of spinner
    setTimeout(() => {
        document.querySelector('.save.button').innerHTML = '<span class="lni-save"></span>';
    }, 250);

    // Set new settings globally
    settings.set('settings', newSettings);

    // Send IPC message to index.js because settings are changed
    ipcRenderer.send('settings-changed', true);
});