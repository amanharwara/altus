const customTitlebar = require('custom-electron-titlebar');
const {
    Menu
} = require('electron').remote;
const {
    ipcRenderer
} = require('electron');
const Store = require('electron-store');
// Create main window titlebar
let mainTitlebar;

const settings = new Store({
    name: 'settings'
});

if (settings.get('customTitlebar.value') === true && process.platform !== 'darwin') {
    mainTitlebar = new customTitlebar.Titlebar({
            backgroundColor: customTitlebar.Color.fromHex('#21252B'),
            icon: '../assets/icons/icon.ico',
            menu: process.platform === 'darwin' ? Menu.getApplicationMenu() : new Menu(),
            minimizable: false,
            maximizable: false,
            closeable: true
        })
        // Setting title explicitly
    mainTitlebar.updateTitle(`Theme Manager`);
}

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

document.querySelector('#update-dark-theme').addEventListener('click', e => {
    window.fetch('https://raw.githubusercontent.com/ShadyThGod/shadythgod.github.io/master/css/altus-dark-theme.css', {
            cache: 'no-store',
            headers: {
                'cache-control': 'no-store'
            }
        })
        .then(res => res.text())
        .then(css => {
            let currentThemes = themes.get('themes');
            let darkTheme = currentThemes.find(x => x.name === 'Dark');
            let themeIndex = currentThemes.indexOf(darkTheme);
            currentThemes[themeIndex] = {
                name: 'Dark',
                css: css
            };
            themes.set('themes', currentThemes);
            window.close();
            ipcRenderer.send('new-themes-added', true);
        })
        .catch(e => {
            console.log(e);
        });
});

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