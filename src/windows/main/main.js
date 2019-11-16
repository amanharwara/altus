// Import custom titlebar module
const customTitlebar = require('custom-electron-titlebar');

// Import extra electron modules
const {
    process
} = require('electron').remote;
const {
    ipcRenderer
} = require('electron');

// Import electron store module for settings
const Store = require('electron-store');

// Import UUIDv4 for creating unique IDs
const uuid = require('uuid/v4');

// Import SweetAlert2 for modals
const Swal = require('sweetalert2');

// Load the main settings into settings variable
let settings = new Store({
    name: 'settings'
});

// Load the themes
let themes = new Store({
    name: 'themes'
});

// Load the tabs 
let tabStore = new Store({
    name: 'tabs',
    defaults: {
        tabs: []
    }
});

// Load tabbyjs for tabs
const Tabby = require('tabbyjs');

// Checks if custom titlebar is enabled in settings & the platform isn't a Mac
if (Array.from(settings.get('settings')).find(s => s.id === 'customTitlebar').value === true && process.platform !== 'darwin') {
    // Create main window titlebar
    const mainTitlebar = new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#202224'),
        icon: '../otherAssets/icon.ico',
        itemBackgroundColor: customTitlebar.Color.fromHex('#1c2028'),
    });
    // Setting title explicitly
    mainTitlebar.updateTitle(`Altus`);
}

// Initialize tabs using Tabby
let tabs = new Tabby('[data-tabs]');

tabs.toggle('#addtab');

// Create variable themesList
let themesList = [];

// Go through all the items in the themes list
themes.get('themes').forEach(i => {
    themesList.push({
        "value": i.name,
        "text": i.name
    });
});

// Custom select box for themes on the "Add Tab" screen
let themeSelect = new Selectr('#theme-select', {
    searchable: true,
    defaultSelected: true,
    placeholder: 'Select Theme',
    customClass: 'theme-select',
    data: themesList
});

// Click event for the "Add Tab" button
document.querySelector('#add-tab-button').addEventListener('click', e => {
    // Create a tab object to use later
    let tab = {
        name: null,
        notifications: null,
        sound: null,
        theme: null,
        id: null
    };

    // Get the name (If no name is put by the user, it assigns the name "New Tab")
    tab.name = (document.querySelector('#tab-name-textbox').value !== "" && document.querySelector('#tab-name-textbox').value !== null) ? document.querySelector('#tab-name-textbox').value : 'New Tab';

    // Get notifications setting
    tab.notifications = document.querySelector('#notification-toggle').checked;

    // Get sound setting
    tab.sound = document.querySelector('#sound-toggle').checked;

    // Get the theme
    tab.theme = themeSelect.getValue();

    // Assign unique ID to tab
    tab.id = uuid();

    // Get the original tabs list
    let tabsList = Array.from(tabStore.get('tabs'));

    // Push the new tab to the list 
    tabsList.push(tab);

    // Set the new list to the store
    tabStore.set('tabs', tabsList);

    // Adds new tab to the DOM
    addTabToDOM(tab.id, tab.name);

    // Clears the value of all the inputs after tab is added
    document.querySelector('#tab-name-textbox').value = '';
    document.querySelector('#notification-toggle').checked = false;
    document.querySelector('#sound-toggle').checked = false;
    themeSelect.setValue('Default');
});


/**
 * Setup existing tabs at the start
 */
function setupExistingTabs() {
    // Checks whether the existing tabs list is empty or not
    if (Array.from(tabStore.get('tabs')).length !== 0 && Array.from(tabStore.get('tabs')).length !== null) {
        // Adds every existing tab to the DOM
        tabStore.get('tabs').forEach(tab => {
            addTabToDOM(tab.id, tab.name);
        });
    }
}
setupExistingTabs();

/**
 * Add tab to DOM
 * @param {string} tabId ID of the tab
 * @param {string} tabName Name of the tab
 */
function addTabToDOM(tabId, tabName) {
    // Create tab element
    let tabElement = document.createRange().createContextualFragment(`<li><a data-tab-id="${tabId}" href="#tab-content-${tabId}"><span class="tabName">${tabName}</span> <span class="lni-cog"></span><span class="lni-close"></span></a></li>`);

    // Create tab content element
    let tabContentElement = document.createRange().createContextualFragment(`<div id="tab-content-${tabId}"><webview id="whatsapp-${tabId}" preload="./whatsapp.js" src="https://web.whatsapp.com/" useragent="${window.navigator.userAgent.replace(/(altus|Electron)([^\s]+\s)/g, '')}" partition="persist:${tabId}"></webview></div>`);

    // Prepend tab element to tab list
    document.querySelector('#tabs-list-').prepend(tabElement);

    // Add tab content div
    document.querySelector('#selectr-src').parentNode.insertBefore(tabContentElement, document.querySelector('#selectr-src'));

    // Setup tabs after adding new one
    tabs.setup();

    // Toggle the new tab
    tabs.toggle(`#tab-content-${tabId}`);

    // Adds event listener for close tab button
    document.querySelector(`[data-tab-id*="${tabId}"]`).querySelector('.lni-close').addEventListener('click', () => {
        // Check if "Tab Close Prompt" setting is enabled
        if (settings.get('settings').find(s => s.id === 'tabClosePrompt').value === true) {
            Swal.fire({
                    title: `<h2>Do you really want to close the tab <i>"${tabName}"</i> ?</h2>`,
                    customClass: {
                        title: 'prompt-title',
                        popup: 'edit-popup',
                        confirmButton: 'edit-popup-button prompt-confirm-button prompt-button',
                        cancelButton: 'edit-popup-button prompt-cancel-button prompt-button',
                        closeButton: 'edit-popup-close-button',
                        header: 'edit-popup-header'
                    },
                    width: '50%',
                    showCancelButton: true,
                    confirmButtonText: 'Close',
                    buttonsStyling: false,
                })
                .then(result => {
                    if (result.value) {
                        // Remove the tab after prompt
                        removeTab(document.querySelector(`[data-tab-id*="${tabId}"]`).querySelector('.lni-close'));
                    }
                })
        } else {
            // Remove the tab directly
            removeTab(document.querySelector(`[data-tab-id*="${tabId}"]`).querySelector('.lni-close'));
        }
    });

    // Gets the tab's current settings
    let tabSettings = tabStore.get('tabs').find(x => x.id === tabId);

    // Sets the tab theme
    let themeName = tabSettings.theme;
    // Gets the CSS of theme if it exists otherwise gets Default CSS
    let currentThemeCSS = (themes.get('themes').find(x => x.name === themeName)) ? themes.get('themes').find(x => x.name === themeName).css : themes.get('themes').find(x => x.name === 'Default').css;
    setTabTheme(document.querySelector(`#whatsapp-${tabId}`), currentThemeCSS, true);

    // Toggles notifications according to setting
    toggleNotifications(document.querySelector(`#whatsapp-${tabId}`), tabSettings.notifications, true);

    // Toggles sound according to setting
    toggleSound(document.querySelector(`#whatsapp-${tabId}`), tabSettings.sound, true);

    // Adds event listener for tab settings button
    document.querySelector(`[data-tab-id*="${tabId}"]`).querySelector('.lni-cog').addEventListener('click', () => {
        let tabSettings = tabStore.get('tabs').find(x => x.id === tabId);
        Swal.fire({
            title: `<h2>Edit <i>${tabSettings.name}</i></h2>`,
            customClass: {
                title: 'edit-popup-title',
                popup: 'edit-popup',
                confirmButton: 'edit-popup-button edit-popup-confirm-button',
                cancelButton: 'edit-popup-button edit-popup-cancel-button',
                closeButton: 'edit-popup-close-button',
                header: 'edit-popup-header'
            },
            html: `<div class="inputs">
                    <div class="input-field">
                        <div class="label">Name:</div>
                        <div class="input-flex"><input class="textbox" placeholder="Name of instance" id="${tabId}-name-textbox" type="text"></div>
                    </div>
                    <div class="toggle-field">
                        <div class="label"
                        title="Changing this setting will cause the page to be refreshed">Notifications:</div>
                        <div class="input-checkbox">
                            <input title="Changing this setting will cause the page to be refreshed" type="checkbox" id="${tabId}-notification-toggle" class="checkbox">
                        </div>
                    </div>
                    <div class="toggle-field">
                        <div class="label">Sound:</div>
                        <div class="input-checkbox">
                            <input type="checkbox" id="${tabId}-sound-toggle" class="checkbox">
                        </div>
                    </div>
                    <div class="input-field">
                        <div class="label" data-selection-value="" id="${tabId}-theme-value">Theme:</div>
                        <select id="${tabId}-theme-select">
                        </select>
                    </div>
                </div>`,
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            buttonsStyling: false,
            padding: '1rem 1.5rem',
            width: 'auto',
            onRender: () => {
                let tabEditSelectr = new Selectr(document.getElementById(`${tabId}-theme-select`), {
                    searchable: true,
                    placeholder: 'Select Theme',
                    customClass: 'theme-select',
                    data: themesList
                });
                tabEditSelectr.setValue(tabSettings.theme);
                document.getElementById(`${tabId}-theme-value`).setAttribute('data-selection-value', tabEditSelectr.getValue());
                tabEditSelectr.on('selectr.change', option => {
                    document.getElementById(`${tabId}-theme-value`).setAttribute('data-selection-value', option.value);
                });
                document.getElementById(`${tabId}-name-textbox`).value = tabSettings.name;
                document.getElementById(`${tabId}-notification-toggle`).checked = tabSettings.notifications;
                document.getElementById(`${tabId}-sound-toggle`).checked = tabSettings.sound;
            },
        }).then(result => {
            if (result.value) {
                // Get all the new values
                let name = document.getElementById(`${tabId}-name-textbox`).value;
                let notifications = document.getElementById(`${tabId}-notification-toggle`).checked;
                let sound = document.getElementById(`${tabId}-sound-toggle`).checked;
                let theme = document.getElementById(`${tabId}-theme-value`).getAttribute('data-selection-value');

                // Create object from new values
                let tab = {
                    id: tabId,
                    name,
                    notifications,
                    sound,
                    theme
                }

                // Get the tabs list in array form
                let tabsList = Array.from(tabStore.get('tabs'));

                // Find the original tab object in array
                let tabInList = tabsList.find(x => x.id === tab.id);

                // Get the index of the original tab
                let indexOfTab = tabsList.indexOf(tabInList);

                // Replace original tab with new tab
                tabsList[indexOfTab] = tab;

                // Set new tabs list
                tabStore.set('tabs', tabsList);

                if (name !== tabInList.name) {
                    // Change the name of the tab
                    changeTabName(tabId, name);
                }

                if (sound !== tabInList.sound) {
                    // Toggle sound
                    toggleSound(document.querySelector(`#whatsapp-${tabId}`), sound, false);
                }

                if (theme !== tabInList.theme) {
                    // Set Theme of tab
                    setTabTheme(document.querySelector(`#whatsapp-${tabId}`), themes.get('themes').find(x => x.name === theme).css, false);
                }

                if (notifications !== tabInList.notifications) {
                    location.reload();
                }
            }
        });
    });
}

/**
 * Remove tab
 * @param {Element} closeTabElement "Close Tab" button element
 */
function removeTab(closeTabElement) {

    // Get the tabs list
    let tabsList = Array.from(tabStore.get('tabs'));

    // Get the next sibling of current tab
    let nextSibling = closeTabElement.parentElement.parentElement.nextElementSibling.querySelector('a');

    // Toggles to the next sibling tab
    tabs.toggle(nextSibling);

    // Get Tab ID
    let tabID = closeTabElement.parentElement.getAttribute('data-tab-id');

    // Remove the tab from the tab list
    closeTabElement.parentElement.parentElement.remove();

    // Remove the tab content
    document.querySelector(`#tab-content-${tabID}`).remove();

    // Removes the tab from the list
    tabsList = tabsList.filter(tab => tab.id !== tabID);

    // Sets the new tab list
    tabStore.set('tabs', tabsList);
}

/**
 * Change the name of the tab
 * @param {string} tabId 
 */
function changeTabName(tabId, name) {
    document.querySelector(`[data-tab-id*="${tabId}"] .tabName`).innerHTML = name;
}

/**
 * Set theme of a tab
 * @param {Element} whatsAppElement The whatsapp webview element for the specific tab
 * @param {string} themeCSS The CSS which is supposed to be applied
 * @param {boolean} firstStart Whether the function is being run at the start of the app
 */
function setTabTheme(whatsAppElement, themeCSS, firstStart) {
    let whatsapp = whatsAppElement;

    if (firstStart) {
        whatsapp.addEventListener('dom-ready', () => {
            whatsapp.executeJavaScript(`
                        var styleElem = document.querySelector('#whatsapp-style-${whatsapp.id}');
                        if (styleElem) {
                            styleElem.innerHTML = \`${themeCSS}\`;
                        } else if (!styleElem) {
                            var styleElement = document.createElement('style');
                            styleElement.id = 'whatsapp-style-${whatsapp.id}';
                            styleElement.innerHTML = \`${themeCSS}\`;
                            document.head.appendChild(styleElement);
                        }`);
        });
    } else {
        whatsapp.executeJavaScript(`
                        var styleElem = document.querySelector('#whatsapp-style-${whatsapp.id}');
                        if (styleElem) {
                            styleElem.innerHTML = \`${themeCSS}\`;
                        } else if (!styleElem) {
                            var styleElement = document.createElement('style');
                            styleElement.id = 'whatsapp-style-${whatsapp.id}';
                            styleElement.innerHTML = \`${themeCSS}\`;
                            document.head.appendChild(styleElement);
                        }`);
    }
}

/**
 * Toggle notifications of a tab (Requires tab to be refreshed)
 * @param {Element} whatsAppElement The whatsapp webview element for the specific tab
 * @param {boolean} setting Enable = true | Disable = false
 * @param {boolean} firstStart Whether the function is being run at the start of the app
 */
function toggleNotifications(whatsAppElement, setting, firstStart) {
    let whatsapp = whatsAppElement;
    if (firstStart) {
        whatsapp.addEventListener('dom-ready', () => {
            if (!setting) {
                whatsapp.executeJavaScript(`window.Notification = ''`);
            }
        });
    } else {
        if (!setting) {
            whatsapp.executeJavaScript(`window.Notification = ''`);
        }
    }
}

/**
 * Toggle sound of a tab
 * @param {Element} whatsAppElement The whatsapp webview element for the specific tab
 * @param {boolean} setting Enable = true | Disable = false
 * @param {boolean} firstStart Whether the function is being run at the start of the app
 */
function toggleSound(whatsAppElement, setting, firstStart) {
    let whatsapp = whatsAppElement;
    if (firstStart) {
        whatsapp.addEventListener('dom-ready', () => {
            if (setting) {
                whatsapp.getWebContents().audioMuted = false;
            } else {
                whatsapp.getWebContents().audioMuted = true;
            }
        });
    } else {
        if (setting) {
            whatsapp.getWebContents().audioMuted = false;
        } else {
            whatsapp.getWebContents().audioMuted = true;
        }
    }
}

// IPC event when a theme is added or removed
ipcRenderer.on('themes-changed', e => {
    window.location.reload();
});

// IPC event of message indicator
ipcRenderer.on('message-indicator', (e, i) => {
    if (i > 0 && i !== undefined && i !== null) {
        ipcRenderer.sendSync('update-badge', '·');
    } else {
        ipcRenderer.sendSync('update-badge', '');
    }
});

// IPC for zoom in
ipcRenderer.on('zoom-in', () => {
    zoom('in', getActiveTab().whatsapp);
});
// IPC for zoom out
ipcRenderer.on('zoom-out', () => {
    zoom('out', getActiveTab().whatsapp);
});
// IPC for reset zoom
ipcRenderer.on('reset-zoom', () => {
    zoom('reset', getActiveTab().whatsapp);
});

/**
 * Zoom In/Out or Reset Zoom of WhatsApp element
 * @param {('in'|'out'|'reset')} type
 * @param {Element} whatsAppElement WhatsApp Element (Should be 'webview' element)
 */
function zoom(type, whatsAppElement) {
    let currentZoomFactor = whatsAppElement.getWebContents().zoomFactor;
    switch (type) {
        case 'in':
            whatsAppElement.getWebContents().zoomFactor = currentZoomFactor + 0.1;
            break;

        case 'out':
            whatsAppElement.getWebContents().zoomFactor = currentZoomFactor - 0.1;
            break;

        case 'reset':
            whatsAppElement.getWebContents().zoomFactor = 1;
            break;

        default:
            whatsAppElement.getWebContents().zoomFactor = 1;
            break;
    }
}

/**
 * Get active tab and whatsapp element in an object
 * @returns {Object.<Element, {tab: Element, whatsapp: Element}>} Active Tab and WhatsApp Element
 */
function getActiveTab() {
    let activeTab = document.querySelector('[id^="tab-content"]:not([hidden])');
    let activeWhatsApp = activeTab.querySelector('webview');

    return {
        tab: activeTab,
        whatsapp: activeWhatsApp
    }
}