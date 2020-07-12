// Import extra electron modules
const {
    process,
    Menu
} = require("electron").remote;

const {
    ipcRenderer
} = require("electron");

const {
    generateTheme
} = require("../util/generateTheme");

const {
    checkContrastAndFix
} = require('../util/checkContrastAndFix');

const uuid = require('uuid/v4');

// Import custom titlebar module
const customTitlebar = require("custom-electron-titlebar");

// Import electron store module for settings
const Store = require("electron-store");

// Load the main settings into settings variable
let settings = new Store({
    name: "settings",
});

// Load the themes into themes variable
let themes = new Store({
    name: "themes",
});

const Color = require("color");
const {
    default: fetch
} = require("node-fetch");

// Checks if custom titlebar is enabled in settings & the platform isn't a Mac
if (
    Array.from(settings.get("settings")).find((s) => s.id === "customTitlebar")
    .value === true &&
    process.platform !== "darwin"
) {
    // Create main window titlebar
    const mainTitlebar = new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex("#202224"),
        icon: "../otherAssets/icon.ico",
        itemBackgroundColor: customTitlebar.Color.fromHex("#1c2028"),
        menu: process.platform === "darwin" ? Menu.getApplicationMenu() : new Menu(),
        minimizable: false,
        maximizable: false,
        closeable: true,
    });
    // Setting title explicitly
    mainTitlebar.updateTitle(`Theme Creator`);
} else {
    // CSS when no custom titlebar
    let style = document.createElement("style");
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

document.querySelectorAll(".color-input").forEach((colorInput) => {
    colorInput.addEventListener("change", (e) => {
        e.target.closest("div").querySelector(".color-text").value = Color(
                e.target.value
            )
            .hex()
            .toString();
    });
});

document.querySelectorAll(".color-text").forEach((colorInput) => {
    colorInput.addEventListener("change", (e) => {
        e.target.closest("div").querySelector(".color-input").value = Color(
                e.target.value
            )
            .hex()
            .toString();
    });
});

document.querySelector("button").addEventListener("click", async () => {
    let name = document.querySelector("#name").value || "Custom Theme";
    let id = uuid();
    let bg =
        Color(document.querySelector('#next_bg input[type="text"]').value) || Color("#1f232a");
    let fg =
        Color(document.querySelector('#next_fg input[type="text"]').value) || Color("#eeeeee");
    let ac =
        Color(document.querySelector('#next_ac input[type="text"]').value) || Color("#7289da");

    bg = bg.hex().toString();
    fg = checkContrastAndFix(bg, fg).hex().toString();
    ac = ac.hex().toString();

    let fetchStyle = await fetch("https://raw.githubusercontent.com/vednoc/dark-whatsapp/master/wa.user.styl");

    let styleIntoText = await fetchStyle.text();

    let css = await generateTheme({
        bg,
        fg,
        ac
    }, styleIntoText);

    let theme = {
        name,
        id,
        css,
        colors: {
            bg,
            fg,
            ac
        },
    };

    let themesList = Array.from(themes.get("themes"));

    themesList.push(theme);

    themes.set('themes', themesList);

    document.querySelector("#name").value = "";
    document.querySelector('#next_bg input[type="text"]').value = "#1f232a";
    document.querySelector('#next_bg input[type="color"]').value = "#1f232a";
    document.querySelector('#next_fg input[type="text"]').value = "#eeeeee";
    document.querySelector('#next_fg input[type="color"]').value = "#eeeeee";
    document.querySelector('#next_ac input[type="text"]').value = "#7289da";
    document.querySelector('#next_ac input[type="color"]').value = "#7289da";

    ipcRenderer.send('themes-changed', true);
});