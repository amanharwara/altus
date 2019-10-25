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

// Load the themes into themes variable
let themes = new Store({
    name: 'themes'
});

// Import Huebee for color pickers
const Huebee = require('huebee');

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
}

/* // To close the other collapsible when one is opened
document.querySelector('.customizer .toggle').addEventListener('click', () => {
    if (document.querySelector('.customizer .toggle').checked === true) {
        document.querySelector('.customcss .toggle').checked = false;
    } else {
        document.querySelector('.customcss .toggle').checked = true;
    }
});

// To close the other collapsible when one is opened
document.querySelector('.customcss .toggle').addEventListener('click', () => {
    if (document.querySelector('.customcss .toggle').checked === true) {
        document.querySelector('.customizer .toggle').checked = false;
    } else {
        document.querySelector('.customizer .toggle').checked = true;
    }
}); */

// Submit "Custom CSS" Theme
document.querySelector('#customcssaddbutton').addEventListener('click', () => {
    // Get the CSS from the textarea
    let css = document.querySelector('#customcss').value;

    // Get the name from the textbox
    let name = document.querySelector('#customcssname').value;

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

let colorInputs = document.querySelectorAll('.color-input');
colorInputs.forEach(i => {
    let hueb = new Huebee(i, {
        setText: true,
        setBGColor: true,
        hues: 12,
        saturations: 3,
        shades: 7,
        customColors: ['#272C35', '#1F232A', '#D1D1D1', '#E9E9E9', '#7289DA', '#E1E1E1'],
        className: 'colorpicker'
    });
    switch (i.id) {
        case 'main-bg':
            hueb.setColor('#272C35')
            break;

        case 'sec-bg':
            hueb.setColor('#1F232A')
            break;

        case 'main-text':
            hueb.setColor('#D1D1D1')
            break;

        case 'sec-text':
            hueb.setColor('#E9E9E9')
            break;

        case 'accent-color':
            hueb.setColor('#7289DA')
            break;

        case 'icon-color':
            hueb.setColor('#E1E1E1')
            break;

        case 'shadow-color':
            hueb.setColor('rgba(0, 0, 0, 0.10)')
            break;

        default:
            break;
    }
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
const generateCustomCSS = (baseTheme, mainBG, secBG, mainText, secText, accentColor, iconColor, shadowColor, emojiOpacity) => {
    let css;

    // Replace variable values in CSS with new values
    css = baseTheme.replace("#272C35", mainBG) //Main background color
        .replace("#1F232A", secBG) //Secondary background color
        .replace("#D1D1D1", mainText) //Main text color
        .replace("#E9E9E9", secText) //Secondary text color
        .replace("#7289DA", accentColor) //Accent color
        .replace("#E1E1E1", iconColor) //Icon color
        .replace("rgba(0, 0, 0, 0.10)", shadowColor) //Shadow color
        .replace("0.75", emojiOpacity); //Emoji Opacity

    return css;
}

document.querySelector('#customizeraddbutton').addEventListener('click', () => {
    // Fetch base dark theme
    window.fetch('https://raw.githubusercontent.com/ShadyThGod/shadythgod.github.io/master/css/altus-dark-theme.css')
        // Convert to pure text
        .then(res => res.text())
        .then(baseTheme => {
            // Get new values from DOM
            let mainBG = document.querySelector('#main-bg').value;
            let secBG = document.querySelector('#sec-bg').value;
            let mainText = document.querySelector('#main-text').value;
            let secText = document.querySelector('#sec-text').value;
            let accentColor = document.querySelector('#accent-color').value;
            let iconColor = document.querySelector('#icon-color').value;
            let shadowColor = document.querySelector('#shadow-color').value;
            let emojiOpacity = document.querySelector('#emoji-opacity').value;
            let name = document.querySelector('#customizer-theme-name').value;

            // Generate new custom theme css
            let css = generateCustomCSS(baseTheme, mainBG, secBG, mainText, secText, accentColor, iconColor, shadowColor, emojiOpacity);

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
            document.querySelector('#main-bg').value = '#272C35';
            document.querySelector('#sec-bg').value = '#1F232A';
            document.querySelector('#main-text').value = '#D1D1D1';
            document.querySelector('#sec-text').value = '#E9E9E9';
            document.querySelector('#accent-color').value = '#7289DA';
            document.querySelector('#icon-color').value = '#E1E1E1';
            document.querySelector('#shadow-color').value = 'rgba(0, 0, 0, 0.10)';
            document.querySelector('#emoji-opacity').value = '0.75';
            document.querySelector('#customizer-theme-name').value = '';
        })
});