const customTitlebar = require("custom-electron-titlebar");
const { ipcRenderer } = require("electron");
const { process, Menu, dialog, app } = require("electron").remote;
const Store = require("electron-store");
const Tabby = require("tabbyjs");
const path = require("path");
const { customizeTheme, customizeMetadata } = require("../util/theme");
const { writeFileSync, removeSync } = require("fs-extra");
const Color = require("color");
const uuid = require("uuid/v4");
const fs = require("fs-extra");

let settings = new Store({
  name: "settings",
});

// Checks if custom titlebar is enabled in settings & the platform isn't a Mac
if (
  Array.from(settings.get("settings")).find((s) => s.id === "customTitlebar")
    .value === true &&
  process.platform !== "darwin"
) {
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
  mainTitlebar.updateTitle(`Theme Manager`);
} else {
  // CSS style when no custom titlebar
  let style = document.createElement("style");
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

let tabs = new Tabby("[data-tabs]");

tabs.toggle("#themes");

let themes = new Store({
  name: "themes",
});

console.log(themes.get("themes"));

function addThemesToDOM() {
  document.getElementById("themes-container").innerHTML = "";
  themes.get("themes").forEach((theme) => {
    let disabled =
      theme.name == "Default" ||
      theme.name == "Dark" ||
      theme.name == "Dark Plus";
    let themeElement = document.createRange()
      .createContextualFragment(`<div class="theme" id="${theme.name}" ${
      theme.id ? `data-id=\"${theme.id}\"` : ""
    }>
        <div class="name">${theme.name}</div>
        <div class="buttons">
          <button type="button" class="edit-theme" ${
            disabled ? "disabled" : ""
          } onclick="editTheme(this)">
            <span class="lni lni-pencil"></span>
          </button>
          <button type="button" class="remove-theme" ${
            disabled ? "disabled" : ""
          } onclick="removeTheme(this)">
            <span class="lni lni-close"></span>
          </button>
        </div>
    </div>`);
    document.getElementById("themes-container").append(themeElement);
  });
}

addThemesToDOM();

/**
 * @param {Element} this_theme
 */
function removeTheme(this_theme) {
  let themeEl = this_theme.closest(".theme");
  let themeName = themeEl.id;
  let themeId =
    themeEl.getAttribute("data-id").length > 0
      ? themeEl.getAttribute("data-id")
      : undefined;

  dialog
    .showMessageBox({
      type: "question",
      title: "Remove Theme?",
      message: `Do you really want to remove the theme "${themeName}"?`,
      buttons: ["Yes", "No"],
    })
    .then(({ response }) => {
      if (response === 0) {
        let themesList = Array.from(themes.get("themes"));
        themesList = themesList.filter((x) => x.id !== themeId);
        themes.set("themes", themesList);
        themeEl.remove();
        ipcRenderer.send("themes-changed", true);
      }
    })
    .catch((err) => console.error(err));
}

/**
 * @param {Element} this_theme
 */
function editTheme(this_theme) {
  resetFields();
  let themeEl = this_theme.closest(".theme");
  let themeId = themeEl.getAttribute("data-id");

  if (themeId) {
    let theme = themes.get("themes").find((t) => t.id === themeId);
    document.querySelector("#theme-name input").value = theme.name;
    document.querySelector("#theme-id input").value = theme.id;
    Object.keys(theme.colors).forEach((key) => {
      document.querySelectorAll(`#theme-${key} input`).forEach((input) => {
        input.value = theme.colors[key];
      });
    });
    tabs.toggle("#addnew");
  } else {
    return;
  }
}

/**
 * Update base dark theme
 */
function updateCustomThemes() {
  // Add spin effect to the icon on the button
  document
    .querySelector("#update-custom-themes .lni-reload")
    .classList.add("lni-is-spinning");

  window
    .fetch(
      "https://raw.githubusercontent.com/vednoc/dark-whatsapp/master/wa.user.styl",
      {
        cache: "no-cache",
      }
    )
    .then((res) => res.text())
    .then((base_theme) => {
      window
        .fetch(
          "https://raw.githubusercontent.com/vednoc/dark-whatsapp/master/metadata.styl"
        )
        .then((res) => res.text())
        .then((metadata) => {
          let _themes = themes.get("themes");

          let tempMetaPath = path.join(
            app.getPath("userData"),
            "temp_metadata.styl"
          );

          _themes = _themes.map((theme) => {
            if (theme.name === "Dark Plus" || theme.colors) {
              if (theme.name === "Dark Plus") {
                writeFileSync(tempMetaPath, customizeMetadata(metadata));
                theme.css = customizeTheme(base_theme, tempMetaPath);
                removeSync(tempMetaPath);
                return theme;
              }
              if (theme.colors) {
                let colors = {
                  bg: theme.colors.bg,
                  fg: theme.colors.fg,
                  ac: theme.colors.ac,
                };
                writeFileSync(
                  tempMetaPath,
                  customizeMetadata(metadata, colors)
                );
                theme.css = customizeTheme(base_theme, tempMetaPath);
                removeSync(tempMetaPath);
                return theme;
              }
            } else {
              return theme;
            }
          });

          themes.set("themes", _themes);

          ipcRenderer.send("themes-changed", true);

          // Remove the spin effect from the icon
          document
            .querySelector("#update-custom-themes .lni-reload")
            .classList.remove("lni-is-spinning");
        })
        .catch((err) => console.error(err));
    })
    .catch((e) => {
      if (e) throw e;
    });
}

document
  .getElementById("update-custom-themes")
  .addEventListener("click", updateCustomThemes);

ipcRenderer.on("themes-changed", () => {
  addThemesToDOM();
});

/* Add New Theme Section */

const presets = {
  "dark-plus": {
    bg: "#1f232a",
    fg: "#eeeeee",
    ac: "#7289da",
  },
  "dark-mint": {
    bg: "#10151E",
    fg: "#eeeeee",
    ac: "#40C486",
  },
  "purple-ish": {
    bg: "#15192E",
    fg: "#eeeeee",
    ac: "#125DBF",
  },
};

document.querySelectorAll(".color-input input").forEach((colorInput) => {
  colorInput.addEventListener("change", (e) => {
    let value;

    if (e.target.value.length > 0) {
      value = e.target.value;
    } else {
      switch (e.target.closest(".option").id) {
        case "theme-bg":
          value = "#1f232a";
          break;
        case "theme-fg":
          value = "#eee";
          break;
        case "theme-ac":
          value = "#7289da";
          break;
        default:
          value = "#000";
          break;
      }
    }

    e.target.closest("div").querySelector('input[type="text"]').value = Color(
      value
    )
      .hex()
      .toString();
    e.target.closest("div").querySelector('input[type="color"]').value = Color(
      value
    )
      .hex()
      .toString();
  });
});

function resetFields() {
  enableFields();
  document.querySelector("#theme-preset select").value = "dark-plus";
  document.querySelectorAll(".option input").forEach((input) => {
    switch (input.closest(".option").id) {
      case "theme-name":
        input.value = "";
        break;
      case "theme-bg":
        input.value = presets["dark-plus"].bg;
        break;
      case "theme-fg":
        input.value = presets["dark-plus"].fg;
        break;
      case "theme-ac":
        input.value = presets["dark-plus"].ac;
        break;
      case "theme-id":
        input.value = uuid();
        break;
    }
  });
}

function disableFields() {
  document
    .querySelectorAll(".option input, .option select")
    .forEach((field) => {
      field.setAttribute("disabled", true);
    });
}

function enableFields() {
  document
    .querySelectorAll(".option:not(#theme-id) input, .option select")
    .forEach((field) => {
      field.removeAttribute("disabled");
    });
}

resetFields();

document.getElementById("cancel").addEventListener("click", resetFields);

document
  .querySelector("#theme-preset select")
  .addEventListener("input", (e) => {
    let selected_preset = presets[e.target.value];
    Object.keys(selected_preset).forEach((key) => {
      document.querySelectorAll(`#theme-${key} input`).forEach((input) => {
        input.value = selected_preset[key];
      });
    });
  });

document.getElementById("save-theme").addEventListener("click", async (e) => {
  let icon = document.querySelector("#save-theme .icon");

  icon.classList.remove("lni-checkmark");
  icon.classList.add("lni-spinner");
  icon.classList.add("lni-is-spinning");

  let theme_name =
    document.querySelector("#theme-name input").value || "New Theme";
  let theme_bg =
    document.querySelector("#theme-bg input").value || presets["dark-plus"].bg;
  let theme_fg =
    document.querySelector("#theme-fg input").value || presets["dark-plus"].fg;
  let theme_ac =
    document.querySelector("#theme-ac input").value || presets["dark-plus"].ac;
  let theme_id = document.querySelector("#theme-id input").value || uuid();

  let theme = {
    name: theme_name,
    id: theme_id,
    css: "",
    colors: {
      bg: theme_bg,
      fg: theme_fg,
      ac: theme_ac,
    },
  };

  disableFields();

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

  metaIntoText = customizeMetadata(metaIntoText, {
    bg: theme_bg,
    fg: theme_fg,
    ac: theme_ac,
  });
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

  theme.css = css;

  console.log("got theme", theme);

  let themesList = Array.from(themes.get("themes"));
  console.log("got theme list", themesList);

  if (themesList.find((t) => t.id === theme.id)) {
    themesList[themesList.findIndex((t) => t.id === theme.id)] = theme;
    console.log("edited theme", themesList);
  } else {
    themesList.push(theme);
    console.log("pushed to theme list", themesList);
  }

  themes.set("themes", themesList);
  console.log("set themes", themes.get("themes"));

  ipcRenderer.send("themes-changed", true);
  console.log("sent ipc renderer");

  fs.removeSync(path.join(app.getPath("userData"), "temp_metadata.styl"));
  fs.removeSync(path.join(app.getPath("userData"), "temp_userstyle.styl"));

  icon.classList.add("lni-checkmark");
  icon.classList.remove("lni-spinner");
  icon.classList.remove("lni-is-spinning");

  resetFields();
});
