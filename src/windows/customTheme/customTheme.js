const { Menu, app } = require("electron").remote;
const { ipcRenderer } = require("electron");
const uuid = require("uuid/v4");
const customTitlebar = require("custom-electron-titlebar");
const Store = require("electron-store");
const fs = require("fs-extra");
const path = require("path");
const { customizeMetadata, customizeTheme } = require("../util/theme");
const Color = require("color");
const fetch = require("node-fetch");

// Load the main settings into settings variable
let settings = new Store({
  name: "settings",
});

// Load the themes into themes variable
let themes = new Store({
  name: "themes",
});

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

  metaIntoText = customizeMetadata(metaIntoText, { bg, fg, ac });
  console.log("customized meta", metaIntoText);

  fs.writeFileSync(
    path.join(app.getPath("userData"), "temp_metadata.styl"),
    metaIntoText
  );
  fs.writeFileSync(
    path.join(app.getPath("userData"), "temp_userstyle.styl"),
    styleIntoText
  );
  console.log("written to file");

  let css = customizeTheme(
    styleIntoText,
    path.join(app.getPath("userData"), "temp_metadata.styl")
  );
  if (!css) return;
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

  fs.removeSync(path.join(app.getPath("userData"), "temp_metadata.styl"));
  fs.removeSync(path.join(app.getPath("userData"), "temp_userstyle.styl"));
});
