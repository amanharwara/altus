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
mainTitlebar.updateTitle(`Settings`);

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

    ipcRenderer.send('settings-changed', true);
    BrowserWindow.getFocusedWindow().close();
});

// Export Settings
document.querySelector('#export-button').addEventListener('click', function(e) {
    dialog.showSaveDialog({
        title: 'Export Settings As JSON',
        filters: [{
            name: 'JSON',
            extensions: ['json']
        }]
    }, function(fileName) {
        if (fileName === undefined) {
            console.log("You didn't save the file");
            return;
        }

        let content = JSON.stringify(settings.store);

        // fileName is a string that contains the path and filename created in the save file dialog.
        fs.writeFile(fileName, content, (err) => {
            if (err) {
                alert("An error ocurred creating the file " + err.message)
            }
        });
    });
});

// Import Settings

document.querySelector('#import-button').addEventListener('click', function(e) {
    dialog.showOpenDialog({
        title: 'Import Settings',
        filters: [{
            name: 'JSON',
            extensions: ['json']
        }]
    }, function(filenames) {
        let newSettings = JSON.parse(fs.readFileSync(filenames[0], 'utf-8'));
        settings.store = newSettings;
        ipcRenderer.send('settings-changed', true);
        window.location.reload(true);
    });
});