const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog,
  Tray,
  shell,
} = require("electron");
const path = require("path");
const { mainMenu, trayContextMenu } = require("./util/menu");
const {
  mainIcon,
  trayIcon,
  trayNotifIcon,
  mainNotifIcon,
} = require("./util/icons");
const Store = require("electron-store");
const AutoLaunch = require("auto-launch");
const importSettings = require("./ipcHandlers/main/importSettings");
const exportSettings = require("./ipcHandlers/main/exportSettings");
const promptCloseTab = require("./ipcHandlers/main/promptCloseTab");
const flushSessionData = require("./ipcHandlers/main/flushSessionData");
const zoom = require("./ipcHandlers/main/zoom");
const contextMenu = require("electron-context-menu");
const handleWhatsappLinks = require("./util/handleWhatsappLinks");
const electronDL = require("electron-dl");

let settings = new Store({
  name: "settings",
});

let tray = null;

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
        if (tray) tray.destroy();
        app.quit();
        return;
      }
    });
};

const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    minWidth: 400,
    minHeight: 200,
    backgroundColor: "#383c49",
    title: `Altus ${app.getVersion()}`,
    icon: mainIcon,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
    },
    show: false,
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
    } else {
      if (tray) tray.destroy();
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
      if (argv.find((arg) => arg.includes("whatsapp"))) {
        handleWhatsappLinks(argv);
      }
    }
  });

  app.on("ready", () => {
    if (app.isPackaged) app.setAsDefaultProtocolClient("whatsapp");

    createMainWindow();

    Store.initRenderer();

    contextMenu();

    if (process.argv.findIndex((arg) => arg.includes("whatsapp")) !== -1) {
      handleWhatsappLinks(process.argv);
    }

    let mainWindow = BrowserWindow.getAllWindows()[0];

    app.showExitPrompt = settings.get("exitPrompt")
      ? settings.get("exitPrompt").value
      : false;
    app.closeToTray = settings.get("closeToTray")
      ? settings.get("closeToTray").value
      : false;
    app.preventEnter = settings.get("preventEnter")
      ? settings.get("preventEnter").value
      : false;
    app.notificationBadge = settings.get("notificationBadge")
      ? settings.get("notificationBadge").value
      : false;
    app.startMinimized = settings.get("launchMinimized")
      ? settings.get("launchMinimized").value
      : false;
    app.autoLaunch = settings.get("autoLaunch")
      ? settings.get("autoLaunch").value
      : false;
    app.showSaveDialog = settings.get("showSaveDialog")
      ? settings.get("showSaveDialog").value
      : true;
    app.defaultDownloadDir = settings.get("defaultDownloadDir")
      ? settings.get("defaultDownloadDir").value
      : app.getPath("downloads");

    electronDL({
      saveAs: app.showSaveDialog,
      directory: app.defaultDownloadDir,
    });

    if (!app.startMinimized) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      mainWindow.minimize();
      mainWindow.blur();
    }

    const altusAutoLauncher = new AutoLaunch({ name: "Altus" });

    if (app.autoLaunch) {
      altusAutoLauncher.enable();
    } else {
      altusAutoLauncher.disable();
    }

    ipcMain.on("import-settings", importSettings);

    ipcMain.on("export-settings", exportSettings);

    ipcMain.on("prompt-close-tab", promptCloseTab);

    ipcMain.on("flush-session-data", flushSessionData);

    ipcMain.on("zoom", zoom);

    ipcMain.on("open-link", (e, url) => {
      shell.openExternal(url);
    });

    ipcMain.on("exitPrompt", (e, value) => {
      app.showExitPrompt = value;
    });

    ipcMain.on("closeToTray", (e, value) => {
      app.closeToTray = value;
    });

    ipcMain.on("preventEnter", (e, value) => {
      app.preventEnter = value;
    });

    ipcMain.on("autoHideMenuBar", (e, value) => {
      mainWindow.setAutoHideMenuBar(value);
      mainWindow.setMenuBarVisibility(!value);
    });

    ipcMain.on("notificationBadge", (e, value) => {
      app.notificationBadge = value;
      if (!app.notificationBadge) {
        if (tray) tray.setImage(trayIcon);
        mainWindow.setOverlayIcon(null, "Notification badge empty");
      }
    });

    ipcMain.on("trayIcon", (e, enabled) => {
      if (enabled) {
        if (process.platform !== "darwin") {
          if (!tray) {
            tray = new Tray(trayIcon);
            tray.setToolTip("Altus");
            tray.setContextMenu(trayContextMenu);
            tray.on("double-click", () => {
              BrowserWindow.getAllWindows()[0].show();
            });
          }
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

    ipcMain.on("message-indicator", (e, detail) => {
      mainWindow.webContents.send("message-indicator", detail);
      if (app.notificationBadge) {
        if (detail.messageCount) {
          switch (process.platform) {
            case "darwin":
              app.dock.setBadge("·");
              break;
            default:
              if (tray) tray.setImage(trayNotifIcon);
              mainWindow.setOverlayIcon(mainNotifIcon, "Notification badge");
              break;
          }
        } else {
          switch (process.platform) {
            case "darwin":
              app.dock.setBadge("");
              break;
            default:
              if (tray) tray.setImage(trayIcon);
              mainWindow.setOverlayIcon(null, "Notification badge empty");
              break;
          }
        }
      }
    });
  });

  app.on("web-contents-created", (e, context) => {
    if (context.getType() === "webview") {
      contextMenu({
        window: {
          webContents: context,
          inspectElement: context.inspectElement.bind(context),
        },
        showSaveImageAs: true,
        showInspectElement: true,
        append: (def, params, window) => [
          {
            label: "Bold",
            visible: params.isEditable,
            click: () => {
              window.webContents.send("format-text", "*");
            },
          },
          {
            label: "Italic",
            visible: params.isEditable,
            click: () => {
              window.webContents.send("format-text", "_");
            },
          },
          {
            label: "Strike",
            visible: params.isEditable,
            click: () => {
              window.webContents.send("format-text", "~");
            },
          },
          {
            label: "Monospaced",
            visible: params.isEditable,
            click: () => {
              window.webContents.send("format-text", "```");
            },
          },
        ],
      });
    }

    context.on("before-input-event", (e, input) => {
      if (app.preventEnter) {
        if (input.key === "Enter" && !input.shift && !input.control) {
          context.sendInputEvent({
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

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });

  if (!app.isPackaged) {
    require("electron-reload")(__dirname, {
      electron: path.join(__dirname, "../node_modules", ".bin", "electron"),
      awaitWriteFinish: true,
    });
  }
}
