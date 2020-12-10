const customTitlebar = require("custom-electron-titlebar");
const { process, BrowserWindow, dialog } = require("electron").remote;
const { ipcRenderer, remote } = require("electron");
const Store = require("electron-store");
const uuid = require("uuid/v4");
const Swal = require("sweetalert2");
const Tabby = require("tabbyjs");
const choices = require("choices.js");
const { escape } = require("../util/escapeText");
const {
  addTabToDOM,
  removeTab,
  addNewTab,
  setupExistingTabs,
  changeTabName,
  setTabTheme,
  setUtilityBar,
  setTabBarVisibility,
  toggleNotifications,
  toggleSound,
  zoom,
  getActiveTab,
} = require("./util");
const Dragula = require("dragula");
const arrayMove = require("../util/arrayMove");

// Load the main settings into settings variable
let settings = new Store({
  name: "settings",
});

// Load the themes
let themes = new Store({
  name: "themes",
});

if (!themes.get("themes") || themes.get("themes").length === 0) {
  window.location.reload();
}

// Load the tabs
let tabStore = new Store({
  name: "tabs",
  defaults: {
    tabs: [],
    active_tab_id: null,
  },
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
  });
  // Setting title explicitly
  mainTitlebar.updateTitle(`Altus`);
}

// Initialize tabs using Tabby
let tabs = new Tabby("[data-tabs]");

tabs.toggle("#addtab");

// Create variable themesList
let themesList = [];

function createThemesList() {
  themesList = [];
  themes.get("themes").forEach((i) => {
    themesList.push({
      value: i.name,
      label: i.name,
      ...(i.name === "Default"
        ? {
            selected: true,
          }
        : {}),
    });
  });
}

createThemesList();

// Custom select box for themes on the "Add Tab" screen
let themeSelect = new choices("#theme-select", {
  searchEnabled: true,
  choices: themesList,
});

// Click event for the "Add Tab" button
document.querySelector("#add-tab-button").addEventListener("click", () => {
  addNewTab();
});

// Add tab when Enter is pressed
document.querySelector("#tab-name-textbox").addEventListener("keydown", (e) => {
  if (e.which == 13) {
    addNewTab();
  }
});

/**
 * Run code after DOM has loaded
 */
document.addEventListener("DOMContentLoaded", (e) => {
  setTabBarVisibility(
    settings.get("settings").find((s) => s.id === "tabBar").value
  );
  let tab_drake = Dragula([document.querySelector("[data-tabs]")], {
    direction: "horizontal",
    invalid: (el) => el.classList.contains("addtab"),
    accepts: (el, t, src, sib) => (!sib ? false : true),
  });
  tab_drake.on("dragend", (el) => {
    let id = el.firstChild.getAttribute("data-tab-id");
    let tabs_array = tabStore.get("tabs");
    let old_index = tabs_array.findIndex((tab) => tab.id === id);
    let dom_tabs = Array.from(
      document.querySelectorAll("[data-tabs] li:not(.addtab) a")
    ).reverse();
    let new_index = dom_tabs.findIndex(
      (tab) => tab.getAttribute("data-tab-id") === id
    );
    let new_tabs_array = arrayMove(tabs_array, old_index, new_index);
    tabStore.set("tabs", new_tabs_array);
  });
});

document.addEventListener(
  "tabby",
  (e) => {
    if (
      settings.get("settings").find((s) => s.id === "rememberActiveTab")
        .value === true
    ) {
      if (e.detail.previousTab) {
        let previous_tab_id = e.detail.previousTab.id;
        if (!document.getElementById(previous_tab_id)) {
          if (
            previous_tab_id.replace("tabby-toggle_tab-content-", "") ===
            tabStore.get("active_tab_id")
          ) {
            tabStore.set("active_tab_id", null);
          }
        } else {
          let tab_id = e.target.id.replace("tabby-toggle_tab-content-", "");
          tabStore.set("active_tab_id", tab_id);
        }
      }
    }
  },
  false
);

setupExistingTabs();

// IPC event when a theme is added or removed
ipcRenderer.on("themes-changed", (e) => {
  createThemesList();
  themeSelect.setChoices(themesList, "value", "label", true);
});

// IPC event of message indicator
ipcRenderer.on("message-indicator", (e, detail) => {
  let { messageCount, tabId } = detail;
  let tabElement = document.getElementById("tabby-toggle_tab-content-" + tabId);
  if (messageCount > 0 && messageCount !== undefined && messageCount !== null) {
    if (tabElement.querySelector(".badge")) {
      tabElement.querySelector(".badge").dataset.count = messageCount;
    } else {
      let badge = document.createElement("span");
      badge.className = "badge";
      badge.dataset.count = messageCount;
      tabElement.prepend(badge);
    }
  } else {
    if (tabElement.querySelector(".badge"))
      tabElement.querySelector(".badge").remove();
  }
});

// IPC for zoom in
ipcRenderer.on("zoom-in", () => {
  zoom("in", getActiveTab().whatsapp);
});
// IPC for zoom out
ipcRenderer.on("zoom-out", () => {
  zoom("out", getActiveTab().whatsapp);
});
// IPC for reset zoom
ipcRenderer.on("reset-zoom", () => {
  zoom("reset", getActiveTab().whatsapp);
});

ipcRenderer.on("switch-to-add", () => {
  tabs.toggle("#addtab");
});

ipcRenderer.on("toggle-tab-bar", (e, t) => {
  if (t) {
    setTabBarVisibility(t);
  } else if (document.querySelector("#tabs-list-").style.display === "none") {
    setTabBarVisibility(true);
  } else {
    setTabBarVisibility(false);
  }
});

ipcRenderer.on("close-tab", () => {
  const activeTab = document.querySelector(
    `[role="tab"][aria-selected="true"]`
  );

  removeTab(activeTab.querySelector(".lni-close"));
});

ipcRenderer.on("edit-tab", () => {
  const activeTab = document.querySelector(
    `[role="tab"][aria-selected="true"]`
  );

  activeTab.querySelector(".lni-cog").click();
});

ipcRenderer.on("next-tab", () => {
  const activeTab = document.querySelector(
    `[role="tab"][aria-selected="true"]`
  );

  const tabItem = activeTab.closest("li");

  if (tabItem.nextSibling.querySelector) {
    tabs.toggle(tabItem.nextSibling.querySelector("a"));
  } else {
    tabs.toggle(tabItem.closest("ul").querySelector("li:first-child > a"));
  }
});

ipcRenderer.on("previous-tab", () => {
  const activeTab = document.querySelector(
    `[role="tab"][aria-selected="true"]`
  );

  const tabItem = activeTab.closest("li");

  if (tabItem.matches("li:first-child")) {
    tabs.toggle(
      tabItem.closest("ul").querySelector("li:nth-last-child(2) > a")
    );
  } else {
    tabs.toggle(tabItem.previousSibling.querySelector("a"));
  }
});

ipcRenderer.on("activate-window-and-tab", (e, tabid) => {
  remote.getCurrentWindow().show();
  tabs.toggle(document.querySelector(`[data-tab-id="${tabid}"]`));
});
