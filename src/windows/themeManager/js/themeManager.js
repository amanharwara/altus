const customTitlebar = require('custom-electron-titlebar');
const {
    Menu
} = require('electron').remote;
const {
    ipcRenderer
} = require('electron');
const Store = require('electron-store');
// Create main window titlebar
const mainTitlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#21252B'),
    icon: '../assets/icons/icon.ico',
    menu: process.platform === 'darwin' ? Menu.getApplicationMenu() : new Menu(),
    minimizable: false,
    maximizable: false,
    closeable: true
});

const themes = new Store({
    name: 'themes'
});

let themesList = themes.get('themes');

for (theme of themesList) {
    let closeThemeIcon;
    if (theme.name == 'Default' || theme.name == 'Dark') {
        closeThemeIcon = '';
    } else {
        closeThemeIcon = `<div class="right floated content">
            <i class="close link icon red removetheme"></i>
        </div>`;
    }
    let HTML = `
    <div class="item" id="${theme.name}">
        ${closeThemeIcon}
        <i class="tint icon"></i>
        <div class="content">
            <div class="header">
                ${theme.name}
            </div>
        </div>
    </div>
    `;
    let range = document.createRange();
    range.selectNode(document.querySelector('.ui.divided.list'));
    let themeElement = range.createContextualFragment(HTML);
    document.querySelector('.ui.divided.list').appendChild(themeElement);
}

document.querySelectorAll('.removetheme').forEach(e => {
    e.addEventListener('click', () => {
        let parentEl = e.parentElement.parentElement;
        parentEl.remove();

        let name = parentEl.id;

        themesList = themesList.filter(x => x.name !== name);
    });
});

document.getElementById('save-button').addEventListener('click', () => {
    themes.set('themes', themesList);
    ipcRenderer.send('new-themes-added', true);
    window.close();
});

document.getElementById('reload-button').addEventListener('click', () => window.location.reload());

// Setting title explicitly
mainTitlebar.updateTitle(`Theme Manager`);