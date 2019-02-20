const customTitlebar = require('custom-electron-titlebar');
const {
    app,
    process,
    Menu,
    MenuItem
} = require('electron').remote;
const {
    ipcRenderer
} = require('electron');

const linksMenu = new Menu();

linksMenu.append(new MenuItem({
    label: 'Links',
    submenu: [{
        label: 'Website',
        click: () => {
            ipcRenderer.send('link-open', 'https://shadythgod.github.io');
        }
    }, {
        label: 'GitHub',
        click: () => {
            ipcRenderer.send('link-open', 'https://www.github.com/shadythgod');
        }
    }, {
        label: 'Repository',
        click: () => {
            ipcRenderer.send('link-open', 'https://www.github.com/shadythgod/altus');
        }
    }, {
        label: 'My Instagram',
        click: () => {
            ipcRenderer.send('link-open', 'https://www.instagram.com/aman_harwara');
        }
    }]
}));

// Create main window titlebar
const mainTitlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#21252B'),
    icon: '../assets/icons/icon.ico',
    menu: linksMenu,
    minimizable: false,
    maximizable: false,
    closeable: true
});

document.querySelector('.altus-version').innerText = app.getVersion();

// Setting title explicitly
mainTitlebar.updateTitle(`About Altus`)