// Import extra electron modules
const {
    process,
    Menu
} = require('electron').remote;
const {
    ipcRenderer
} = require('electron');

// Import custom titlebar module
const customTitlebar = require('custom-electron-titlebar');

// Import electron store module for settings
const Store = require('electron-store');

// Load the main settings into settings variable
let settings = new Store({
    name: 'settings'
});

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
    mainTitlebar.updateTitle(`Custom Theme`);
} else {
    // CSS when no custom titlebar
    let style = document.createElement('style');
    style.innerText = `body {
        border: 0 !important;
    }
    .setting {
        flex-direction: column;
        align-items: start !important;
    }
    
    .setting .inputs, .setting input {
        width: -webkit-fill-available;
    }`;
    document.head.appendChild(style);
}

// Load the themes into themes variable
let themes = new Store({
    name: 'themes'
});

// Submit "Custom CSS" Theme
document.querySelector('#customcssaddbutton').addEventListener('click', () => {
    // Get the CSS from the textarea
    let css = document.querySelector('#customcss').value;

    // Get the name from the textbox
    let name = escape(document.querySelector('#customcssname').value);

    // Get the themes list as array
    let themesList = Array.from(themes.get('themes'));

    // Create object for new theme
    let theme = {
        name,
        css
    };

    // Add theme object to the list
    themesList.push(theme);

    // Set the new themes list
    themes.set('themes', themesList);

    // Reset values of textbox, textarea
    document.querySelector('#customcss').value = '';
    document.querySelector('#customcssname').value = '';

    // Send IPC message to refresh main window
    ipcRenderer.send('themes-changed', true);
});

/**
 * Generate custom theme CSS
 * @param {string} baseTheme Base Dark Theme CSS as text
 * @param {string} mainBG Main background color
 * @param {string} secBG Secondary background color
 * @param {string} mainText Main text color
 * @param {string} secText Secondary text color
 * @param {string} accentColor Accent color
 * @param {string} iconColor Icon color
 * @param {string} shadowColor Shadow color
 * @param {string} emojiOpacity Emoji Opacity
 */
const generateCustomCSS = (baseTheme, mainBG, secBG, terBG, mainText, secText, accentColor, shadowColor, emojiOpacity) => {
    let css;

    // Replace variable values in CSS with new values
    css = baseTheme.replace("#1f232a", mainBG) //Main background color
        .replace("#252a33", secBG) //Secondary background color
        .replace("#2c313a", terBG) //Tertiary background color
        .replace("#a1a1a1", mainText) //Main text color
        .replace("#e9e9e9", secText) //Secondary text color
        .replace("#7289da", accentColor) //Accent color
        .replace("rgba(0, 0, 0, 0.145)", shadowColor) //Shadow color
        .replace("0.8", emojiOpacity) //Emoji Opacity

    return css;
}

document.querySelector('#customizeraddbutton').addEventListener('click', () => {
    // Fetch base dark theme
    window.fetch('https://raw.githubusercontent.com/vednoc/dark-whatsapp/master/wa.user.css')
        // Convert to pure text
        .then(res => res.text())
        .then(baseTheme => {
            // Get new values from DOM
            let mainBG = document.querySelector('#main-bg .color-input').value;
            let secBG = document.querySelector('#sec-bg .color-input').value;
            let terBG = document.querySelector('#ter-bg .color-input').value;
            let mainText = document.querySelector('#main-text .color-input').value;
            let secText = document.querySelector('#sec-text .color-input').value;
            let accentColor = document.querySelector('#accent-color .color-input').value;
            let shadowColor = document.querySelector('#shadow-color .color-input').value;
            let emojiOpacity = document.querySelector('#emoji-opacity').value;
            let name = document.querySelector('#customizer-theme-name').value || 'New Theme';

            // Generate new custom theme css
            let css = generateCustomCSS(baseTheme.replace(/\@.*\{/gim, '').replace("#2f343d", 'var(--darken)').replace("#383d46", 'var(--darken)'), mainBG, secBG, terBG, mainText, secText, accentColor, shadowColor, emojiOpacity);

            // Get themes list as array
            let themesList = Array.from(themes.get('themes'));

            // Create object for new theme
            let theme = {
                name,
                css
            }

            // Push new theme object to themes list
            themesList.push(theme);

            // Set new themes list globally
            themes.set('themes', themesList);

            // Refresh main page as new theme is added
            ipcRenderer.send('themes-changed', true);

            // Reset values after adding theme
            document.querySelector('#main-bg .color-input').value = '#1f232a';
            document.querySelector('#sec-bg .color-input').value = '#252a33';
            document.querySelector('#ter-bg .color-input').value = '#2c313a';
            document.querySelector('#main-text .color-input').value = '#a1a1a1';
            document.querySelector('#sec-text .color-input').value = '#e9e9e9';
            document.querySelector('#accent-color .color-input').value = '#7289da';
            document.querySelector('#shadow-color .color-input').value = 'rgba(0, 0, 0, 0.10)';
            document.querySelector('#emoji-opacity').value = '0.75';
            document.querySelector('#customizer-theme-name').value = '';

            // Emitting on-change events so the color pickers reset as well
            fireChangeEvent(document.querySelector('#main-bg .color-input'));
            fireChangeEvent(document.querySelector('#main-text .color-input'));
            fireChangeEvent(document.querySelector('#sec-bg .color-input'));
            fireChangeEvent(document.querySelector('#sec-text .color-input'));
            fireChangeEvent(document.querySelector('#accent-color .color-input'));
            fireChangeEvent(document.querySelector('#icon-color .color-input'));
            fireChangeEvent(document.querySelector('#shadow-color .color-input'));
        })
});

/**
 * Fire "change" event programmatically manually
 * @param {Element} element Input Element
 */
function fireChangeEvent(element) {
    if ("createEvent" in document) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, true);
        element.dispatchEvent(evt);
    } else
        element.fireEvent("onchange");
}

// Set up color pickers using Pickr

const Pickr = require('@simonwep/pickr');

document.querySelectorAll('.color-button').forEach(i => {
    // Initialize default color variable
    let defaultColor;

    // Get color input ID
    let inputID = i.parentElement.id;

    // Select default color for specific color input
    switch (inputID) {
        case 'main-bg':
            defaultColor = '#1f232a';
            break;
        case 'sec-bg':
            defaultColor = '#252a33';
            break;
        case 'ter-bg':
            defaultColor = '#2c313a';
            break;
        case 'main-text':
            defaultColor = '#D1D1D1';
            break;
        case 'sec-text':
            defaultColor = '#E9E9E9';
            break;
        case 'accent-color':
            defaultColor = '#7289DA';
            break;
        case 'icon-color':
            defaultColor = '#E1E1E1';
            break;
        case 'shadow-color':
            defaultColor = 'rgba(0,0,0,0.10)';
            break;
        default:
            break;
    }

    // Initialize color pickers
    let picker = new Pickr({
        el: i,
        theme: 'monolith',
        swatches: [
            '#272C35', '#1F232A', '#D1D1D1', '#E9E9E9', '#7289DA', '#E1E1E1', 'rgba(0,0,0,0.10)'
        ],
        components: {
            preview: true,
            opacity: true,
            hue: true,
            interaction: {
                input: true,
                save: true
            }
        },
        default: defaultColor,
    });

    // Initialize text box values
    picker.on('init', p => {
        document.querySelector(`#${inputID} .color-input`).value = p.getColor().toHEXA().toString();
    });

    // Change text box values when new color picked
    picker.on('save', (color, p) => {
        document.querySelector(`#${inputID} .color-input`).value = color.toHEXA().toString();
    });

    // Change picker color when textbox changes
    document.querySelector(`#${inputID} .color-input`).addEventListener('change', () => {
        picker.setColor(document.querySelector(`#${inputID} .color-input`).value);
    });
});