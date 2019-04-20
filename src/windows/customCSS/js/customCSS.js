const customTitlebar = require('custom-electron-titlebar');
const {
    Menu
} = require('electron').remote;
const Store = require('electron-store');
const {
    ipcRenderer
} = require('electron');

let settings = new Store({
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
    mainTitlebar.updateTitle(`Custom CSS for WhatsApp`);
}

let themes = new Store({
    name: 'themes'
});

document.getElementById('add-theme-button').addEventListener('click', () => {
    let themeName = document.getElementById('themenameinput').value;
    let themeCSS = document.getElementById('customcssarea').value;

    if (themeName == '' || themeCSS == '') {
        if (themeName == '') {
            document.getElementById('themenameinput').parentElement.classList.add('error');
        }
        if (themeCSS == '') {
            document.getElementById('customcssarea').parentElement.classList.add('error');
        }
    }

    if (themeName.length > 0 && themeCSS.length > 0) {
        let newTheme = {
            name: themeName,
            css: themeCSS
        }

        let themesList = themes.get('themes');
        themesList.push(newTheme);

        themes.set('themes', themesList);

        ipcRenderer.send('new-themes-added', true);

        window.close();
    }
});

ipcRenderer.on('add-theme-from-customizer', (e, css) => {
    document.getElementById('customcssarea').value = css;
    document.getElementById('themenameinput').focus();
});

document.getElementById('themenameinput').addEventListener('focus', () => {
    document.getElementById('themenameinput').parentElement.classList.remove('error');
});
document.getElementById('customcssarea').addEventListener('focus', () => {
    document.getElementById('customcssarea').parentElement.classList.remove('error');
});