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
     * @param {object} options Window options
     * @param {string} options.id ID for specific window
     * @param {string} options.title Title for specific window
     * @param {number} options.width Width of the specific window
     * @param {number} options.height Height of the specific window
     * @param {booelan} options.resizable Is the window resizable?
     * @param {object} options.mainWindowObject Main Window Object
     * @param {boolean} options.min Is the window minimizable?
     * @param {boolean} options.max Is the window maximizable?
     * @param {number} options.minWidth The minimum width of specific window
     * @param {number} options.minHeight The minimum height of specific window
     * @param {number} options.maxWidth The maximum width of specifc window
     * @param {number} options.maxHeight The maximum height of specific window
     * @returns {BrowserWindow} BrowserWindow object with options configured for specific window
     */
    createWindow: function(options) {
        return new BrowserWindow({
            title: (options.title) !== undefined ? options.title : 'New Window',
            frame: process.platform !== 'darwin' ? !Array.from(settings.get('settings')).find(s => s.id === 'customTitlebar').value : true,
            titleBarStyle: process.platform !== 'darwin' ? 'hidden' : 'default',
            width: (options.width) !== undefined ? options.width : 800,
            height: (options.height) !== undefined ? options.height : 600,
            resizable: (options.resizable) !== undefined ? options.resizable : true,
            maximizable: (options.max) !== undefined ? options.max : true,
            minimizable: (options.min) !== undefined ? options.min : true,
            minWidth: (options.minWidth) !== undefined ? options.minWidth : 800,
            minHeight: (options.minHeight) !== undefined ? options.minHeight : 600,
            maxWidth: (options.maxWidth) !== undefined ? options.maxWidth : '',
            maxHeight: (options.maxHeight) !== undefined ? options.maxHeight : '',
            parent: (options.mainWindowObject) !== undefined ? options.mainWindowObject : null,
            modal: true,
            transparent: true,
            show: false,
            webPreferences: {
                nodeIntegration: true
            },
            icon: './windows/otherAssets/icon.ico'
        });
    }
}