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
    label: "File",
    submenu: [
      {
        role: "forceReload",
      },
      {
        label: "Quit",
        accelerator: "CmdOrCtrl+Q",
        click() {
          app.exit(0);
        },
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      {
        label: "Undo",
        accelerator: "CmdOrCtrl+Z",
        selector: "undo:",
      },
      {
        label: "Redo",
        accelerator: "Shift+CmdOrCtrl+Z",
        selector: "redo:",
      },
      {
        type: "separator",
      },
      {
        label: "Cut",
        accelerator: "CmdOrCtrl+X",
        selector: "cut:",
      },
      {
        label: "Copy",
        accelerator: "CmdOrCtrl+C",
        selector: "copy:",
      },
      {
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
        selector: "paste:",
      },
      {
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
        selector: "selectAll:",
      },
    ],
  },
  {
    label: "Tab",
    submenu: [
      {
        label: "Add New Tab",
        accelerator: "CmdOrCtrl+T",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.webContents.send("add-new-tab");
        },
      },
      {
        label: "Edit Active Tab",
        accelerator: "CmdOrCtrl+E",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.webContents.send("edit-tab");
        },
      },
      {
        label: "Close Active Tab",
        accelerator: "CmdOrCtrl+W",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.webContents.send("prompt-before-closing-tab");
        },
      },
      {
        label: "Restore Tab",
        accelerator: "CmdOrCtrl+Shift+T",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.webContents.send("restore-tab");
        },
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
      },
      {
        label: "Go to Previous Tab",
        accelerator: "CmdOrCtrl+Shift+Tab",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.webContents.send("previous-tab");
        },
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
      },
      {
        label: "Go to Last Tab",
        accelerator: "CmdOrCtrl+9",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.webContents.send("last-tab");
        },
      },
    ],
  },
  {
    label: "View",
    submenu: [
      {
        label: "Toggle Fullscreen",
        accelerator: "F11",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.setFullScreen(!window.fullScreen);
        },
      },
      {
        label: "Toggle Tab Bar",
        accelerator: "CmdOrCtrl+Shift+B",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.webContents.send("toggle-tab-bar");
        },
      },
    ],
  },
  {
    label: "Themes",
    submenu: [
      {
        label: "Theme Manager",
        accelerator: "Alt+T",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.webContents.send("open-theme-manager");
        },
      },
    ],
  },
  {
    label: "Settings",
    submenu: [
      {
        label: "Settings",
        accelerator: "Ctrl+,",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.webContents.send("open-settings");
        },
      },
    ],
  },
  {
    label: "Help",
    submenu: [
      {
        label: "About",
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
      },
      {
        label: "Donate",
        submenu: [
          {
            label: "Liberapay",
            click() {
              shell.openExternal("https://liberapay.com/aman_harwara/");
            },
          },
          {
            label: "Ko-Fi",
            click() {
              shell.openExternal("ko-fi.com/amanharwara");
            },
          },
        ],
      },
      {
        label: "Check For Updates",
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
      },
      {
        label: "Open DevTools",
        accelerator: "CmdOrCtrl+Shift+I",
        click() {
          let window = BrowserWindow.getFocusedWindow();
          window.webContents.openDevTools();
        },
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
