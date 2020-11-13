const { process, Menu, app } = require("electron").remote;
const { ipcRenderer } = require("electron");
const { checkContrastAndFix } = require("../util/checkContrastAndFix");
const uuid = require("uuid/v4");
const customTitlebar = require("custom-electron-titlebar");
const Store = require("electron-store");
const usercss_meta = require("usercss-meta");
const stylus = require("stylus");
const fs = require("fs-extra");
const path = require("path");

// Load the main settings into settings variable
let settings = new Store({
  name: "settings",
});

// Load the themes into themes variable
let themes = new Store({
  name: "themes",
});

const Color = require("color");
const { default: fetch } = require("node-fetch");
const parse = require("usercss-meta/lib/parse");

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
    menu:
      process.platform === "darwin" ? Menu.getApplicationMenu() : new Menu(),
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
    Color(document.querySelector('#next_bg input[type="text"]').value) ||
    Color("#1f232a");
  let fg =
    Color(document.querySelector('#next_fg input[type="text"]').value) ||
    Color("#eeeeee");
  let ac =
    Color(document.querySelector('#next_ac input[type="text"]').value) ||
    Color("#7289da");

  bg = bg.hex().toString();
  fg = fg.hex().toString();
  ac = ac.hex().toString();

  let fetchStyle = await fetch(
    "https://raw.githubusercontent.com/vednoc/dark-whatsapp/master/wa.user.styl"
  );
  let fetchMetadata = await fetch(
    "https://raw.githubusercontent.com/vednoc/dark-whatsapp/master/metadata.styl"
  );

  let styleIntoText = await fetchStyle.text();
  console.log("got style:", styleIntoText);

  let metaIntoText = await fetchMetadata.text();
  console.log("got meta:", metaIntoText);

  metaIntoText = customizeMetadata(metaIntoText, { _bg: bg, _fg: fg, _ac: ac });
  console.log("customized meta", metaIntoText);

  fs.writeFileSync(
    path.join(app.getPath("userData"), "metadata.styl"),
    metaIntoText
  );
  fs.writeFileSync(
    path.join(app.getPath("userData"), "userstyle.styl"),
    styleIntoText
  );
  console.log("written to file");

  let css = customizeTheme(styleIntoText, metaIntoText, { bg, fg, ac });
  if (!css) return;
  css = css
    .slice(0, -3)
    .substring(css.indexOf("@moz"))
    .replace(/@-moz.*\{/, "");
  console.log("got css", css);

  let theme = {
    name,
    id,
    css,
    colors: {
      bg,
      fg,
      ac,
    },
  };
  console.log("got theme", theme);

  let themesList = Array.from(themes.get("themes"));
  console.log("got theme list", themesList);

  themesList.push(theme);
  console.log("pushed to theme list", themesList);

  themes.set("themes", themesList);
  console.log("set themes", themes.get("themes"));

  document.querySelector("#name").value = "";
  document.querySelector('#next_bg input[type="text"]').value = "#1f232a";
  document.querySelector('#next_bg input[type="color"]').value = "#1f232a";
  document.querySelector('#next_fg input[type="text"]').value = "#eeeeee";
  document.querySelector('#next_fg input[type="color"]').value = "#eeeeee";
  document.querySelector('#next_ac input[type="text"]').value = "#7289da";
  document.querySelector('#next_ac input[type="color"]').value = "#7289da";

  ipcRenderer.send("themes-changed", true);
  console.log("sent ipc renderer");
});

/**
 * Customize the theme
 * @param {string} theme
 * @param {string} metadata
 * @param {Object} options
 */
function customizeTheme(theme, metadata, options) {
  let customized;

  let opts = {
    bg: options && options.bg ? options.bg : "#1f232a",
    fg: options && options.fg ? options.fg : "#eee",
    ac: options && options.ac ? options.ac : "#7289da",
  };

  stylus(theme)
    .import(path.join(app.getPath("userData"), "metadata.styl"))
    .render((err, css) => {
      if (err) {
        console.error(err);
        return;
      } else {
        console.log(css);
        customized = css;
      }
    });

  return customized;
}

function customizeMetadata(current, opts) {
  console.log("meta custom start");
  let metadata;

  metadata = current.replace("theme = 'old'", "theme = 'custom'");
  console.log("replaced 1");

  for (let key of Object.keys(opts)) {
    let regex = new RegExp(`${key} = (.*)`);
    metadata = metadata.replace(regex, `${key} = ${opts[key]}`);
  }

  return metadata;
}
