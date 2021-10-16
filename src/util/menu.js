const {
  Menu,
  BrowserWindow,
  app,
  shell,
  dialog,
  clipboard,
} = require("electron");
const os = require("os");
const { mainIcon } = require("./icons");
const checkUpdates = require("./checkUpdates");
const langConf = require("../lang.conf");

const mainMenu = (i18n) => {
  let menuTemplate = [
    {
      label: i18n.t("&File"),
      id: "file",
      submenu: [
        {
          label: i18n.t("Force &Reload"),
          role: "forceReload",
          id: "forceReload",
        },
        {
          label: i18n.t("&Quit"),
          id: "quit",
          accelerator: "CmdOrCtrl+Q",
          click() {
            app.exit(0);
          },
        },
      ],
    },
    {
      label: i18n.t("&Edit"),
      id: "edit",
      submenu: [
        {
          label: i18n.t("Undo"),
          accelerator: "CmdOrCtrl+Z",
          selector: "undo:",
          id: "undo",
        },
        {
          label: i18n.t("Redo"),
          accelerator: "Shift+CmdOrCtrl+Z",
          selector: "redo:",
          id: "redo",
        },
        {
          type: "separator",
        },
        {
          label: i18n.t("Cut"),
          accelerator: "CmdOrCtrl+X",
          selector: "cut:",
          id: "cut",
        },
        {
          label: i18n.t("Copy"),
          accelerator: "CmdOrCtrl+C",
          selector: "copy:",
          id: "copy",
        },
        {
          label: i18n.t("Paste"),
          accelerator: "CmdOrCtrl+V",
          selector: "paste:",
          id: "paste",
        },
        {
          label: i18n.t("Select All"),
          accelerator: "CmdOrCtrl+A",
          selector: "selectAll:",
          id: "selectAll",
        },
        {
          type: "separator",
        },
        {
          label: i18n.t("Language"),
          submenu: langConf.languages.map((lang) => {
            return {
              label: i18n.t(lang),
              type: "radio",
              checked: i18n.language === lang,
              click: () => {
                i18n.changeLanguage(lang);
              },
            };
          }),
        },
      ],
    },
    {
      label: i18n.t("Tab"),
      id: "tab",
      submenu: [
        {
          label: i18n.t("Add New Tab"),
          accelerator: "CmdOrCtrl+T",
          click() {
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.send("add-new-tab");
          },
          id: "addNewTab",
        },
        {
          label: i18n.t("Edit Active Tab"),
          accelerator: "CmdOrCtrl+E",
          click() {
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.send("edit-tab");
          },
          id: "editActiveTab",
        },
        {
          label: i18n.t("Close Active Tab"),
          accelerator: "CmdOrCtrl+W",
          click() {
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.send("prompt-before-closing-tab");
          },
          id: "closeActiveTab",
        },
        {
          label: i18n.t("Open Tab DevTools"),
          accelerator: "CmdOrCtrl+Shift+D",
          click() {
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.send("open-tab-devtools");
          },
          id: "openDevTools",
        },
        {
          label: i18n.t("Restore Tab"),
          accelerator: "CmdOrCtrl+Shift+T",
          click() {
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.send("restore-tab");
          },
          id: "restoreTab",
        },
        {
          type: "separator",
        },
        {
          label: i18n.t("Go to Next Tab"),
          accelerator: "CmdOrCtrl+Tab",
          click() {
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.send("next-tab");
          },
          id: "gotoNextTab",
        },
        {
          label: i18n.t("Go to Previous Tab"),
          accelerator: "CmdOrCtrl+Shift+Tab",
          click() {
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.send("previous-tab");
          },
          id: "gotoPreviousTab",
        },
        {
          type: "separator",
        },
        {
          label: i18n.t("Go to First Tab"),
          accelerator: "CmdOrCtrl+1",
          click() {
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.send("first-tab");
          },
          id: "gotoFirstTab",
        },
        {
          label: i18n.t("Go to Last Tab"),
          accelerator: "CmdOrCtrl+9",
          click() {
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.send("last-tab");
          },
          id: "gotoLastTab",
        },
      ],
    },
    {
      label: i18n.t("&View"),
      id: "view",
      submenu: [
        {
          label: i18n.t("Toggle Fullscreen"),
          accelerator: "F11",
          click() {
            let window = BrowserWindow.getFocusedWindow();
            window.setFullScreen(!window.fullScreen);
          },
          id: "toggleFullscreen",
        },
        {
          label: i18n.t("Toggle Tab Bar"),
          accelerator: "CmdOrCtrl+Shift+B",
          click() {
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.send("toggle-tab-bar");
          },
          id: "toggleTabBar",
        },
      ],
    },
    {
      label: i18n.t("Themes"),
      id: "themes",
      submenu: [
        {
          label: i18n.t("Theme Manager"),
          accelerator: "Alt+T",
          click() {
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.send("open-theme-manager");
          },
          id: "themeManager",
        },
      ],
    },
    {
      label: i18n.t("&Settings"),
      id: "settingsMenu",
      submenu: [
        {
          label: i18n.t("&Settings"),
          accelerator: "Ctrl+,",
          click() {
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.send("open-settings");
          },
          id: "settings",
        },
      ],
    },
    {
      label: i18n.t("&Help"),
      id: "help",
      submenu: [
        {
          label: i18n.t("&About"),
          click() {
            let versionInfo = `Altus: ${app.getVersion()}
  Electron: ${process.versions.electron}
  Chrome: ${process.versions.chrome}
  V8: ${process.versions.v8}
  OS: ${os.type()} ${os.arch()} ${os.release()}`;

            dialog
              .showMessageBox({
                type: "info",
                title: `Altus v${app.getVersion()}`,
                message: `Made by Aman Harwara.`,
                detail: `With help from: MarceloZapatta, Dafnik, dmcdo, insign, srevinsaju, maicol07, ngmoviedo.
  
  Thanks to: vednoc for Dark WhatsApp theme.
  
  ${versionInfo}`,
                icon: mainIcon,
                buttons: ["Copy Version Info", "OK"],
              })
              .then((res) => {
                let buttonClicked = res.response;
                switch (buttonClicked) {
                  case 0:
                    clipboard.write({
                      text: versionInfo,
                    });
                    break;
                }
              })
              .catch((err) => {
                console.error(err);
              });
          },
          id: "about",
        },
        {
          label: i18n.t("Donate"),
          submenu: [
            {
              label: "Liberapay",
              id: "liberapay",
              click() {
                shell.openExternal("https://liberapay.com/aman_harwara/");
              },
            },
            {
              label: "Ko-Fi",
              id: "kofi",
              click() {
                shell.openExternal("https://ko-fi.com/amanharwara");
              },
            },
            {
              label: "Buy Me a Coffee",
              id: "buymeacoffee",
              click() {
                shell.openExternal("https://buymeacoffee.com/amanharwara");
              },
            },
            {
              label: "Other Links",
              id: "otherlinks",
              click() {
                shell.openExternal(
                  "https://github.com/amanharwara/altus#support"
                );
              },
            },
          ],
          id: "donate",
        },
        {
          label: i18n.t("Check For &Updates"),
          accelerator: "CmdOrCtrl+Shift+U",
          click() {
            dialog
              .showMessageBox({
                type: "question",
                message: "Check for Updates?",
                detail: `Current version: v${app.getVersion()}`,
                buttons: ["Yes", "No"],
              })
              .then((res) => {
                let buttonClicked = res.response;
                if (buttonClicked === 0) {
                  checkUpdates().catch((err) => console.error(err));
                }
              })
              .catch((err) => console.error(err));
          },
          id: "checkForUpdates",
        },
        {
          label: i18n.t("Links"),
          submenu: [
            {
              label: i18n.t("Report Bugs/Issues"),
              click: () => {
                shell.openExternal(
                  "https://gitlab.com/amanharwara/altus/-/issues"
                );
              },
            },
            {
              label: i18n.t("Website"),
              click: () => {
                shell.openExternal("https://amanharwara.com");
              },
            },
            {
              label: i18n.t("Repository"),
              click: () => {
                shell.openExternal("https://www.gitlab.com/amanharwara/altus");
              },
            },
          ],
          id: "links",
        },
        {
          label: i18n.t("Open &DevTools"),
          accelerator: "CmdOrCtrl+Shift+I",
          click() {
            let window = BrowserWindow.getFocusedWindow();
            window.webContents.openDevTools();
          },
          id: "openWindowDevTools",
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(menuTemplate);
};

const trayContextMenu = Menu.buildFromTemplate([
  {
    label: "Maximize",
    click() {
      BrowserWindow.getAllWindows()[0].show();
      BrowserWindow.getAllWindows()[0].focus();
    },
  },
  {
    label: "Minimize to Tray",
    click() {
      BrowserWindow.getAllWindows()[0].hide();
    },
  },
  {
    label: "Open Settings",
    click() {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      mainWindow.webContents.send("open-settings");
      mainWindow.show();
      mainWindow.focus();
    }
  },
  {
    label: "Exit",
    click() {
      app.exit(0);
    },
  },
]);

module.exports = { mainMenu, trayContextMenu };
