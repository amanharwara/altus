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

let menuTemplate = [
  {
    label: "&File",
    id: "file",
    submenu: [
      {
        role: "forceReload",
        id: "forceReload",
      },
      {
        label: "&Quit",
        id: "quit",
        accelerator: "CmdOrCtrl+Q",
        click() {
          app.exit(0);
        },
      },
    ],
  },
  {
    label: "&Edit",
    id: "edit",
    submenu: [
      {
        label: "Undo",
        accelerator: "CmdOrCtrl+Z",
        selector: "undo:",
        id: "undo",
      },
      {
        label: "Redo",
        accelerator: "Shift+CmdOrCtrl+Z",
        selector: "redo:",
        id: "redo",
      },
      {
        type: "separator",
      },
      {
        label: "Cut",
        accelerator: "CmdOrCtrl+X",
        selector: "cut:",
        id: "cut",
      },
      {
        label: "Copy",
        accelerator: "CmdOrCtrl+C",
        selector: "copy:",
        id: "copy",
      },
      {
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
        selector: "paste:",
        id: "paste",
      },
      {
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
        selector: "selectAll:",
        id: "selectAll",
      },
    ],
  },
  {
    label: "Tab",
    id: "tab",
    submenu: [
      {
        label: "Add New Tab",
        accelerator: "CmdOrCtrl+T",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.webContents.send("add-new-tab");
        },
        id: "addNewTab",
      },
      {
        label: "Edit Active Tab",
        accelerator: "CmdOrCtrl+E",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.webContents.send("edit-tab");
        },
        id: "editActiveTab",
      },
      {
        label: "Close Active Tab",
        accelerator: "CmdOrCtrl+W",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.webContents.send("prompt-before-closing-tab");
        },
        id: "closeActiveTab",
      },
      {
        label: "Open Tab DevTools",
        accelerator: "CmdOrCtrl+Shift+D",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.webContents.send("open-tab-devtools");
        },
        id: "openDevTools",
      },
      {
        label: "Restore Tab",
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
        label: "Go to Next Tab",
        accelerator: "CmdOrCtrl+Tab",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.webContents.send("next-tab");
        },
        id: "gotoNextTab",
      },
      {
        label: "Go to Previous Tab",
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
        label: "Go to First Tab",
        accelerator: "CmdOrCtrl+1",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.webContents.send("first-tab");
        },
        id: "gotoFirstTab",
      },
      {
        label: "Go to Last Tab",
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
    label: "&View",
    id: "view",
    submenu: [
      {
        label: "Toggle Fullscreen",
        accelerator: "F11",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.setFullScreen(!window.fullScreen);
        },
        id: "toggleFullscreen",
      },
      {
        label: "Toggle Tab Bar",
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
    label: "Themes",
    id: "themes",
    submenu: [
      {
        label: "Theme Manager",
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
    label: "&Settings",
    id: "settingsMenu",
    submenu: [
      {
        label: "&Settings",
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
    label: "&Help",
    id: "help",
    submenu: [
      {
        label: "&About",
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
              detail: `With help from: MarceloZapatta, Dafnik, dmcdo, insign, srevinsaju.

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
        label: "Donate",
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
        label: "Check For &Updates",
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
        label: "Links",
        submenu: [
          {
            label: "Report Bugs/Issues",
            click: () => {
              shell.openExternal(
                "https://gitlab.com/amanharwara/altus/-/issues"
              );
            },
          },
          {
            label: "Website",
            click: () => {
              shell.openExternal("https://amanharwara.com");
            },
          },
          {
            label: "Repository",
            click: () => {
              shell.openExternal("https://www.gitlab.com/amanharwara/altus");
            },
          },
        ],
        id: "links",
      },
      {
        label: "Open &DevTools",
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

let mainMenu = Menu.buildFromTemplate(menuTemplate);

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
    label: "Exit",
    click() {
      app.exit(0);
    },
  },
]);

module.exports = { mainMenu, trayContextMenu };
