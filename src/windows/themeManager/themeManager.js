const customTitlebar = require("custom-electron-titlebar");
const { app, process, Menu } = require("electron").remote;
const { ipcRenderer } = require("electron");
const Store = require("electron-store");
const Swal = require("sweetalert2");
const { escape } = require("../util/escapeText");
const { customizeTheme, customizeMetadata } = require("../util/theme");
const { writeFileSync, removeSync } = require("fs-extra");
const path = require("path");

let settings = new Store({
  name: "settings",
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

// Load themes
let themes = new Store({
  name: "themes",
});

themes.get("themes").forEach((theme) => {
  // Create the theme element for the DOM
  let themeElement = document.createRange()
    .createContextualFragment(`<div class="theme" id="${theme.name}" ${
    theme.id ? `data-id=\"${theme.id}\"` : ""
  }>
                <div class="name">${theme.name}</div>
                <button type="button" class="remove-theme" ${
                  theme.name == "Default" ||
                  theme.name == "Dark" ||
                  theme.name == "Dark Plus"
                    ? "disabled"
                    : ""
                } onclick="removeTheme(this)"><span class="lni lni-close"></span></button>
            </div>`);
  // Append the element to the themes element
  document.querySelector(".themes").append(themeElement);
});

/**
 * Remove a theme
 * @param {object} rtObj 'this' object passed during onclick
 */
function removeTheme(rtObj) {
  let themeEl = rtObj.parentElement;
  let themeName = themeEl.id;
  let themeId =
    themeEl.getAttribute("data-id").length > 0
      ? themeEl.getAttribute("data-id")
      : undefined;
  if (themeName !== "Default" && themeName !== "Dark") {
    Swal.fire({
      title: `<h2>Do you really want to delete the theme <i>"${escape(
        themeName
      )}"</i> ?</h2>`,
      customClass: {
        title: "edit-popup-title",
        popup: "edit-popup",
        confirmButton: "edit-popup-button edit-popup-confirm-button",
        cancelButton: "edit-popup-button edit-popup-cancel-button",
        closeButton: "edit-popup-close-button",
        header: "edit-popup-header",
      },
      width: "50%",
      showCancelButton: true,
      confirmButtonText: "Delete",
      buttonsStyling: false,
    }).then((result) => {
      if (result.value) {
        // Get themes list
        let themesList = Array.from(themes.get("themes"));
        // Filter themes list to remove current theme
        themesList = themesList.filter((x) => x.id !== themeId);
        // Set the filtered themes list to global themes list
        themes.set("themes", themesList);
        // Remove theme from DOM
        themeEl.remove();
        // IPC message to refresh main window
        ipcRenderer.send("themes-changed", true);
      }
    });
  }
}

/**
 * Update base dark theme
 */
function updateBaseThemes() {
  // Add spin effect to the icon on the button
  document
    .querySelector(".button .lni-reload")
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
                  _bg: theme.colors.bg,
                  _fg: theme.colors.fg,
                  _ac: theme.colors.ac,
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
            .querySelector(".button .lni-reload")
            .classList.remove("lni-is-spinning");
        })
        .catch((err) => console.error(err));
    })
    .catch((e) => {
      if (e) throw e;
    });
}

// Update Base Themes Button Click
document.querySelector(".button.update").addEventListener("click", () => {
  updateBaseThemes();
});

// Button To Reload The Page
document.querySelector("#reload-page").addEventListener("click", () => {
  window.location.reload();
});
