// Import BrowserWindow module
const {
    BrowserWindow
} = require('electron');

// Import Store module
const Store = require('electron-store');

// Load main settings
let settings = new Store({
    name: 'settings'
});

module.exports = {
    /**
     * Create Window Function
     * @param {string} id ID for specific window
     * @param {string} title Title for specific window
     * @param {number} width Width of the specific window
     * @param {number} height Height of the specific window
     * @param {booelan} resizable Is the window resizable?
     * @param {object} mainWindowObject Main Window Object
     * @param {boolean} min Is the window minimizable?
     * @param {boolean} max Is the window maximizable?
     * @param {number} minWidth The minimum width of specific window
     * @param {number} minHeight The minimum height of specific window
     * @param {number} maxWidth The maximum width of specifc window
     * @param {number} maxHeight The maximum height of specific window
     * @returns {BrowserWindow} BrowserWindow object with options configured for specific window
     */
    createWindow: function(id, title, width, height, resizable, mainWindowObject, min, max, minWidth, minHeight, maxWidth, maxHeight) {
        return new BrowserWindow({
            title: title,
            frame: process.platform !== 'darwin' ? !Array.from(settings.get('settings')).find(s => s.id === 'customTitlebar').value : true,
            titleBarStyle: process.platform !== 'darwin' ? 'hidden' : 'default',
            width: width,
            height: height,
            resizable: resizable,
            maximizable: max,
            minimizable: min,
            minWidth: minWidth,
            minHeight: minHeight,
            maxWidth: maxWidth,
            maxHeight: maxHeight,
            parent: mainWindowObject,
            modal: true,
            transparent: true,
            show: false,
            webPreferences: {
                nodeIntegration: true
            }
        });
    }
}