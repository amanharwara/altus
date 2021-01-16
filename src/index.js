const { app, BrowserWindow, Menu, ipcMain, dialog, Tray } = require("electron");
const path = require("path");
const { mainMenu, trayContextMenu } = require("./util/menu");
const { mainIcon, trayIcon, trayNotifIcon } = require("./util/icons");

if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const confirmExit = () => {
  dialog
    .showMessageBox({
      type: "question",
      buttons: ["OK", "Cancel"],
      title: "Exit",
      message: "Are you sure you want to exit?",
    })
    .then((res) => {
      if (res.response == 0) {
        app.showExitPrompt = false;
        app.quit();
        return;
      }
    });
};

const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    title: `Altus ${app.getVersion()}`,
    icon: mainIcon,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      webviewTag: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../public/index.html"));

  mainWindow.webContents.send("userDataPath", app.getPath("userData"));

  mainWindow.on("close", (e) => {
    if (app.closeToTray) {
      e.preventDefault();
      mainWindow.hide();
    } else if (app.showExitPrompt) {
      e.preventDefault();
      confirmExit();
    }
  });

  Menu.setApplicationMenu(mainMenu);
};

const singleInstanceLock = app.requestSingleInstanceLock();

if (!singleInstanceLock) {
  app.exit(0);
} else {
  app.on("second-instance", (e, argv) => {
    if (BrowserWindow.getAllWindows().length > 0) {
      let mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.on("ready", () => {
    createMainWindow();

    app.showExitPrompt = false;
    app.closeToTray = false;
    app.preventEnter = false;

    let tray = null;

    ipcMain.on("prompt-close-tab", (e, id) => {
      dialog
        .showMessageBox({
          type: "question",
          buttons: ["OK", "Cancel"],
          title: "Close Tab",
          message: "Are you sure you want to close the tab?",
        })
        .then((res) => {
          if (res.response == 0) {
            let mainWindow = BrowserWindow.getFocusedWindow();
            mainWindow.webContents.send("close-tab", id);
            return;
          }
        });
    });

    ipcMain.on("toggle-exit-prompt", (e, value) => {
      app.showExitPrompt = value;
    });

    ipcMain.on("toggle-close-to-tray", (e, value) => {
      app.closeToTray = value;
    });

    ipcMain.on("toggle-prevent-enter-submit", (e, value) => {
      app.preventEnter = value;
    });

    ipcMain.on("toggle-tray-icon", (e, enabled) => {
      if (enabled) {
        if (process.platform !== "darwin") {
          tray = new Tray(trayIcon);
          tray.setToolTip("Altus");
          tray.setContextMenu(trayContextMenu);
          tray.on("double-click", () => {
            BrowserWindow.getAllWindows()[0].show();
          });
        } else {
          app.dock.setMenu(trayContextMenu);
        }
      } else {
        if (tray) {
          tray.destroy();
        }
        tray = null;
      }
    });
  });

  app.on("web-contents-created", (e, context) => {
    context.on("before-input-event", (e, input) => {
      if (app.preventEnter) {
        if (input.key === "Enter" && !input.shift && !input.control) {
          context.webContents.sendInputEvent({
            keyCode: "Shift+Return",
            type: "keyDown",
          });
          e.preventDefault();
          return;
        }

        if (input.key === "Enter" && input.control) {
          context.webContents.executeJavaScript(
            `document.querySelector('[data-icon="send"]').click()`
          );
          e.preventDefault();
          return;
        }
      }
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });

  require("electron-reload")(__dirname, {
    electron: path.join(__dirname, "../node_modules", ".bin", "electron"),
    awaitWriteFinish: true,
  });
}
