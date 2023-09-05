import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./utils/isDev";
import { electronTabStore } from "./stores/tabs/electron";
import { TabStore } from "./stores/tabs/common";

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

  ipcMain.handle("get-whatsapp-preload-path", () => {
    // @ts-expect-error ImportMeta works correctly
    return import.meta.url.replace("main.js", "whatsapp.preload.js");
  });

  ipcMain.handle("tab-store-get", () => {
    return electronTabStore.store;
  });

  ipcMain.handle(
    "tab-store-set",
    (_event, key: keyof TabStore, value: unknown) => {
      if (value === undefined) return electronTabStore.delete(key);
      return electronTabStore.set(key, value);
    }
  );
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
