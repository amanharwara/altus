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

// Import SweetAlert2 for modals
const Swal = require('sweetalert2');

// Import node-fetch
const fetch = require('node-fetch');

const {
    escape
} = require('../otherAssets/escapeText');

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
    mainTitlebar.updateTitle(`Theme Manager`);
} else {
    // CSS style when no custom titlebar
    let style = document.createElement('style');
    style.innerText = `body {
        margin: 0;
        overflow: hidden;
        border:0;
    }
    
    .container {
        padding: 15px 25px;
    }`;

    document.head.appendChild(style);
}

// Load themes
let themes = new Store({
    name: 'themes'
});

themes.get('themes').forEach(theme => {
    // Create the theme element for the DOM
    let themeElement = document.createRange().createContextualFragment(`<div class="theme" id="${theme.name}">
                <div class="name">${theme.name}</div>
                <button type="button" class="remove-theme" ${(theme.name == 'Default') || (theme.name == 'Dark') ? 'data-disabled' : ''} onclick="removeTheme(this)"><span class="lni-close"></span></button>
            </div>`);
    // Append the element to the themes element
    document.querySelector('.themes').append(themeElement);
});

/**
 * Remove a theme
 * @param {object} rtObj 'this' object passed during onclick
 */
function removeTheme(rtObj) {
    let themeEl = rtObj.parentElement;
    let themeName = themeEl.id;
    if (themeName !== 'Default' && themeName !== 'Dark') {
        Swal.fire({
            title: `<h2>Do you really want to delete the theme <i>"${escape(themeName)}"</i> ?</h2>`,
            customClass: {
                title: 'edit-popup-title',
                popup: 'edit-popup',
                confirmButton: 'edit-popup-button edit-popup-confirm-button',
                cancelButton: 'edit-popup-button edit-popup-cancel-button',
                closeButton: 'edit-popup-close-button',
                header: 'edit-popup-header'
            },
            width: '50%',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            buttonsStyling: false,
        }).then(result => {
            if (result.value) {
                // Get themes list
                let themesList = Array.from(themes.get('themes'));
                let name = escape(themeName);
                // Filter themes list to remove current theme
                themesList = themesList.filter(x => x.name !== name);
                // Set the filtered themes list to global themes list
                themes.set('themes', themesList);
                // Remove theme from DOM
                themeEl.remove();
                // IPC message to refresh main window
                ipcRenderer.send('themes-changed', true);
            }
        });
    }
}

/**
 * Update base dark theme
 */
function updateBaseThemes() {
    // Add spin effect to the icon on the button
    document.querySelector('.button .lni-reload').classList.add('lni-spin-effect');
    // Fetch a new version of the dark theme
    fetch('https://raw.githubusercontent.com/vednoc/dark-whatsapp/master/wa.user.css', {
            cache: 'no-cache'
        })
        .then(res => res.text())
        .then(css => {
            // Remove the spin effect from the icon
            document.querySelector('.button .lni-reload').classList.remove('lni-spin-effect');
            // Get the themes list as an array
            let themesList = Array.from(themes.get('themes'));

            css = `
            .app {
                width: 100% !important;
                border-radius: 0 !important;
                border: 0 !important;
            }
            ` + css;

            // Create new object for the updated theme
            let updatedTheme = {
                name: 'Dark',
                css: css.replace(/\@.*\{/gim, '')
            };

            // Find index of the dark theme
            let i = themesList.findIndex(x => x.name == 'Dark');
            // Replace old version of dark theme with new version
            themesList[i] = updatedTheme;

            // Set the new themes list
            themes.set('themes', themesList);
        })
}

// Update Base Themes Button Click
document.querySelector('.button.update').addEventListener('click', () => {
    updateBaseThemes();
});

// Button To Reload The Page
document.querySelector('#reload-page').addEventListener('click', () => {
    // Remove tooltip class so the tooltip doesn't spin
    document.querySelector('.lni-reload').classList.remove('tooltip');
    // Add spin effect to the icon on the button
    document.querySelector('.lni-reload').classList.add('lni-spin-effect');
    window.location.reload();
});