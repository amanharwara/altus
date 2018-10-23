const {
    ipcRenderer,
    remote
} = require('electron');
const {
    dialog
} = remote;
const fs = require('fs');

var persistTheme, toggleNotifications, toggleMessagePreview, toggleSound;
persistTheme = localStorage.getItem('persist-theme-preference');
toggleNotifications = localStorage.getItem('toggle-notifications-preference');
toggleSound = localStorage.getItem('toggle-sound-preference');
toggleTray = localStorage.getItem('toggle-tray-preference');

function loadSettings() {
    if (document.querySelector('#persist-theme-preference')) {
        let checked = persistTheme == "true" ? true : false;
        document.querySelector('#persist-theme-preference').checked = checked;
    }
    if (document.querySelector('#toggle-notifications-preference')) {
        let checked = toggleNotifications == "true" ? true : false;
        document.querySelector('#toggle-notifications-preference').checked = checked;
    }
    if (document.querySelector('#toggle-sound-preference')) {
        let checked = toggleSound == "true" ? true : false;
        document.querySelector('#toggle-sound-preference').checked = checked;
    }
    if (document.querySelector('#toggle-tray-preference')) {
        let checked = toggleTray == "true" ? true : false;
        document.querySelector('#toggle-tray-preference').checked = checked;
    }
}

loadSettings();

document.querySelector('#export').addEventListener('click', function(e) {
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

        var content = JSON.stringify({
            persistTheme: persistTheme,
            toggleNotifications: toggleNotifications,
            toggleSound: toggleSound,
            toggleTray: toggleTray
        });

        // fileName is a string that contains the path and filename created in the save file dialog.
        fs.writeFile(fileName, content, (err) => {
            if (err) {
                alert("An error ocurred creating the file " + err.message)
            }
        });
    });
});

document.querySelector('#import').addEventListener('click', function(e) {
    dialog.showOpenDialog({
        title: 'Import Settings',
        filters: [{
            name: 'JSON',
            extensions: ['json']
        }]
    }, function(filenames) {
        var JSONsettings = JSON.parse(fs.readFileSync(filenames[0], 'utf-8'));

        JSONpersistTheme = JSONsettings.persistTheme;
        JSONtoggleNotifications = JSONsettings.toggleNotifications;
        JSONtoggleSound = JSONsettings.toggleSound;
        JSONtoggleTray = JSONsettings.toggleTray;

        if (document.querySelector('#persist-theme-preference')) {
            let checked = JSONpersistTheme == "true" ? true : false;
            document.querySelector('#persist-theme-preference').checked = checked;
        }
        if (document.querySelector('#toggle-notifications-preference')) {
            let checked = JSONtoggleNotifications == "true" ? true : false;
            document.querySelector('#toggle-notifications-preference').checked = checked;
        }
        if (document.querySelector('#toggle-sound-preference')) {
            let checked = JSONtoggleSound == "true" ? true : false;
            document.querySelector('#toggle-sound-preference').checked = checked;
        }
        if (document.querySelector('#toggle-tray-preference')) {
            let checked = JSONtoggleTray == "true" ? true : false;
            document.querySelector('#toggle-tray-preference').checked = checked;
        }
    });
});

document.querySelector('#save').addEventListener('click', function(e) {
    if (document.querySelector('#persist-theme-preference').checked) {
        localStorage.setItem('persist-theme-preference', true);
    } else {
        localStorage.setItem('persist-theme-preference', false);
    }
    if (document.querySelector('#toggle-notifications-preference').checked) {
        localStorage.setItem('toggle-notifications-preference', true);
    } else {
        localStorage.setItem('toggle-notifications-preference', false);
    }
    if (document.querySelector('#toggle-sound-preference').checked) {
        localStorage.setItem('toggle-sound-preference', true);
    } else {
        localStorage.setItem('toggle-sound-preference', false);
    }
    if (document.querySelector('#toggle-tray-preference').checked) {
        localStorage.setItem('toggle-tray-preference', true);
    } else {
        localStorage.setItem('toggle-tray-preference', false);
    }

    ipcRenderer.send('settingsChanged', true);
});