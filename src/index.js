const {
  app,
  BrowserWindow,
  Menu,
  nativeImage,
  ipcMain,
  dialog,
} = require("electron");
const path = require("path");
const { mainMenu } = require("./util/menu");
const { mainIcon } = require("./util/icons");

if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

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
