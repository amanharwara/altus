import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./utils/isDev";
import { electronTabStore } from "./stores/tabs/electron";
import { Tab } from "./stores/tabs/common";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webviewTag: true,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  ipcMain.handle("get-tabs", () => {
    return electronTabStore.get("tabs");
  });

  ipcMain.handle("get-previously-closed-tab", () => {
    return electronTabStore.get("previouslyClosedTab");
  });

  ipcMain.handle("set-tabs", (_event, tabs: Tab[]) => {
    return electronTabStore.set("tabs", tabs);
  });

  ipcMain.handle("set-previously-closed-tab", (_event, tab: Tab) => {
    return electronTabStore.set("previouslyClosedTab", tab);
  });
};

app.on("ready", () => {
  const userAgentFallback = app.userAgentFallback;
  app.userAgentFallback = userAgentFallback.replace(
    /(Altus|Electron)([^\s]+\s)/g,
    ""
  );

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
