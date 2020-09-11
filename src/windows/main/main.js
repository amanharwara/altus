// Import custom titlebar module
const customTitlebar = require("custom-electron-titlebar");

// Import extra electron modules
const { process, BrowserWindow } = require("electron").remote;
const { ipcRenderer, remote } = require("electron");

// Import electron store module for settings
const Store = require("electron-store");

// Import UUIDv4 for creating unique IDs
const uuid = require("uuid/v4");

// Import SweetAlert2 for modals
const Swal = require("sweetalert2");

// Load tabbyjs for tabs
const Tabby = require("tabbyjs");

const choices = require("choices.js");

// Import escape text function
const { escape } = require("../otherAssets/escapeText");

// Import util functions
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

// Go through all the items in the themes list
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
  window.location.reload();
});

// IPC event of message indicator
ipcRenderer.on("message-indicator", (e, messageCount) => {
  if (messageCount > 0 && messageCount !== undefined && messageCount !== null) {
    ipcRenderer.sendSync("update-badge", messageCount);
  } else {
    ipcRenderer.sendSync("update-badge", "");
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

