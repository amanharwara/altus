const customTitlebar = require('custom-electron-titlebar');
const {
    Menu
} = require('electron').remote;
const ClipboardJS = require('clipboard');
let cssClipboard = new ClipboardJS('#copy-css-button');
const Store = require('electron-store');
const {
    ipcRenderer
} = require('electron');

const settings = new Store({
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
    mainTitlebar.updateTitle(`Theme Customizer`);
}

document.querySelectorAll('.color-input').forEach((e, i) => {
    switch (i) {
        case 0:
            new KellyColorPicker({
                place: `colorpicker${i}`,
                size: 150,
                input: `input${i}`,
                alphaSlider: true,
                color: '#272C35'
            });
            break;
        case 1:
            new KellyColorPicker({
                place: `colorpicker${i}`,
                size: 150,
                input: `input${i}`,
                alphaSlider: true,
                color: '#1F232A'
            });
            break;
        case 2:
            new KellyColorPicker({
                place: `colorpicker${i}`,
                size: 150,
                input: `input${i}`,
                alphaSlider: true,
                color: '#D1D1D1'
            });
            break;
        case 3:
            new KellyColorPicker({
                place: `colorpicker${i}`,
                size: 150,
                input: `input${i}`,
                alphaSlider: true,
                color: '#E9E9E9'
            });
            break;
        case 4:
            new KellyColorPicker({
                place: `colorpicker${i}`,
                size: 150,
                input: `input${i}`,
                alphaSlider: true,
                color: '#7289DA'
            });
            break;
        case 5:
            new KellyColorPicker({
                place: `colorpicker${i}`,
                size: 150,
                input: `input${i}`,
                alphaSlider: true,
                color: '#E1E1E1'
            });
            break;
        case 6:
            new KellyColorPicker({
                place: `colorpicker${i}`,
                size: 150,
                input: `input${i}`,
                alphaSlider: true,
                color: 'rgba(0, 0, 0, 0.10)'
            });
            break;
    }
});

document.querySelectorAll('.toggle-picker').forEach(e => {
    e.addEventListener('click', () => {
        let picker = e.parentElement.querySelector('.colorpicker-class');
        if (picker.style.display == 'none' || picker.style.display == '') {
            picker.style.display = 'block'
        } else if (picker.style.display == 'block') {
            picker.style.display = 'none'
        }
    });
});

document.getElementById('generate-css-button').addEventListener('click', () => {
    window.fetch('https://raw.githubusercontent.com/ShadyThGod/shadythgod.github.io/master/css/altus-dark-theme.css')
        .then(res => res.text())
        .then(css => generateCSS(css))
        .then(() => focusCSS())

    function generateCSS(css) {

        let darkVariable = document.querySelector('#input0').value; //Main Background Color
        let darkerVariable = document.querySelector('#input1').value; //Secondary Background Color
        let lightVariable = document.querySelector('#input2').value; //Main Text Color
        let lighterVariable = document.querySelector('#input3').value; //Secondary Background Color
        let accentVariable = document.querySelector('#input4').value; //Accent Color
        let iconVariable = document.querySelector('#input5').value; //Icon Color
        let shadowVariable = document.querySelector('#input6').value; //Shadow Color
        let emojiOpacity = document.querySelector('#inputOpacity').value; //Emoji Opacity

        css = css.replace("#272C35", darkVariable)
            .replace("#1F232A", darkerVariable)
            .replace("#D1D1D1", lightVariable)
            .replace("#E9E9E9", lighterVariable)
            .replace("#7289DA", accentVariable)
            .replace("#E1E1E1", iconVariable)
            .replace("rgba(0, 0, 0, 0.10)", shadowVariable)
            .replace("0.75", emojiOpacity);

        document.querySelector('#generatedcssarea').innerHTML = css;
    }

    function focusCSS() {
        document.querySelector('#generatedcssarea').scrollIntoView({
            behavior: 'smooth'
        });
    }
});

cssClipboard.on('success', () => {
    let copyButton = document.querySelector('#copy-css-button');
    copyButton.innerHTML = '<i class="copy icon"></i> Copied!';
    copyButton.disabled = true;
    setTimeout(() => {
        copyButton.innerHTML = '<i class="copy icon"></i> Copy CSS';
        copyButton.disabled = false;
    }, 500);
});

document.getElementById('add-css-button').addEventListener('click', () => {
    if (document.querySelector('#generatedcssarea').value !== '' && document.querySelector('#generatedcssarea').value !== undefined && document.querySelector('#generatedcssarea').value !== null) {
        ipcRenderer.send('add-theme-from-customizer', document.querySelector('#generatedcssarea').value);
    } else {
        alert("Please Generate The CSS First Using The \"Generate CSS\" Button.")
    }
});