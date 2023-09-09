import {
  app,
  BrowserWindow,
  clipboard,
  dialog,
  ipcMain,
  Menu,
  session,
  shell,
} from "electron";
import fs from "fs";
import path from "path";
import { isDev } from "./utils/isDev";
import { electronTabStore } from "./stores/tabs/electron";
import { Tab, TabStore } from "./stores/tabs/common";
import { electronThemeStore } from "./stores/themes/electron";
import { ThemeStore } from "./stores/themes/common";
import { electronSettingsStore } from "./stores/settings/electron";
import { i18n, i18nOptions } from "./i18n/i18next.config";
import { languages } from "./i18n/langauges.config";
import os from "os";
import { SettingsStore } from "./stores/settings/common";

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

  return mainWindow;
};

const singleInstanceLock = app.requestSingleInstanceLock();

if (!singleInstanceLock) {
  app.exit();
} else {
  app.on("second-instance", (event, argv) => {
    if (BrowserWindow.getAllWindows().length === 0) return;

    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();

    if (argv.find((arg) => arg.includes("whatsapp"))) {
      handleWhatsappLinks(argv);
    }
  });

  app.on("ready", () => {
    const userAgentFallback = app.userAgentFallback;
    app.userAgentFallback = userAgentFallback.replace(
      /(Altus|Electron)([^\s]+\s)/g,
      ""
    );

    if (app.isPackaged) app.setAsDefaultProtocolClient("whatsapp");
    if (process.argv.some((arg) => arg.includes("whatsapp"))) {
      handleWhatsappLinks(process.argv);
    }

    addIPCHandlers();

    initializeI18N();

    pruneUnusedPartitions(
      electronTabStore.get("tabs"),
      electronTabStore.get("previouslyClosedTab"),
      app.getPath("userData")
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
}

function handleWhatsappLinks(argv: string[]) {
  const arg = argv.find((arg) => arg.includes("whatsapp"));
  if (!arg) return;

  let url = "https://web.whatsapp.com/";

  if (arg.includes("send/?phone")) {
    url += arg.split("://")[1].replace("/", "");
  } else if (arg.includes("chat/?code")) {
    url += "accept?code=" + arg.split("=")[1];
  }

  const mainWindow = BrowserWindow.getAllWindows()[0];
  mainWindow.webContents.executeJavaScript(
    `document.querySelector("webview").src = "${url}";`
  );
}

function pruneUnusedPartitions(
  tabs: Tab[],
  previouslyClosedTab: Tab | null,
  userDataPath: string
) {
  const partitionsDirectoryPath = path.join(userDataPath, "Partitions");

  const doesPartitionsDirectoryExist = fs.existsSync(partitionsDirectoryPath);
  if (!doesPartitionsDirectoryExist) return;

  const partitions = fs.readdirSync(partitionsDirectoryPath);

  const tabIds = tabs.map((tab) => tab.id.toLowerCase());
  if (previouslyClosedTab) {
    tabIds.push(previouslyClosedTab.id);
  }

  partitions
    .filter((id) => !tabIds.includes(id))
    .forEach((id) => {
      const partitionPath = path.join(partitionsDirectoryPath, id);
      fs.rmSync(partitionPath, {
        recursive: true,
      });
    });
}

function addIPCHandlers() {
  ipcMain.handle("get-whatsapp-preload-path", () => {
    // @ts-expect-error ImportMeta works correctly
    return import.meta.url.replace("main.js", "whatsapp.preload.js");
  });

  ipcMain.handle("settings-store-get", () => {
    return electronSettingsStore.store;
  });

  ipcMain.handle(
    "settings-store-set",
    (_event, key: keyof SettingsStore, value: unknown) => {
      if (value === undefined) return electronSettingsStore.delete(key);
      return electronSettingsStore.set(key, value);
    }
  );

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

  ipcMain.handle("theme-store-get", () => {
    return electronThemeStore.store;
  });

  ipcMain.handle(
    "theme-store-set",
    (_event, key: keyof ThemeStore, value: unknown) => {
      if (value === undefined) return electronThemeStore.delete(key);
      return electronThemeStore.set(key, value);
    }
  );

  ipcMain.handle(
    "toggle-notifications",
    (_event, enabled: boolean, partition: string) => {
      session
        .fromPartition(partition)
        .setPermissionRequestHandler((webContents, permission, callback) => {
          if (permission === "notifications") {
            callback(enabled);
          }
        });
    }
  );

  ipcMain.on("open-link", (_event, url: string) => {
    shell.openExternal(url);
  });
}

function initializeI18N() {
  if (!i18n.isInitialized) {
    i18n.init(i18nOptions, (error) => {
      if (error) console.error("i18n initialization error:", error);

      i18n.on("loaded", () => {
        i18n.changeLanguage(app.getLocale());
        i18n.off("loaded");
      });

      i18n.on("languageChanged", () => {
        const menu = getLocalizedMainMenu();
        Menu.setApplicationMenu(menu);
      });
    });
  }
}

function getLocalizedMainMenu() {
  const menuTemplate: (
    | Electron.MenuItemConstructorOptions
    | Electron.MenuItem
  )[] = [
    {
      label: i18n.t("&File"),
      id: "file",
      submenu: [
        {
          label: i18n.t("Start &New Chat"),
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("new-chat");
          },
        },
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
          id: "undo",
        },
        {
          label: i18n.t("Redo"),
          accelerator: "Shift+CmdOrCtrl+Z",
          id: "redo",
        },
        {
          type: "separator",
        },
        {
          label: i18n.t("Cut"),
          accelerator: "CmdOrCtrl+X",
          id: "cut",
        },
        {
          label: i18n.t("Copy"),
          accelerator: "CmdOrCtrl+C",
          id: "copy",
        },
        {
          label: i18n.t("Paste"),
          accelerator: "CmdOrCtrl+V",
          id: "paste",
        },
        {
          label: i18n.t("Select All"),
          accelerator: "CmdOrCtrl+A",
          id: "selectAll",
        },
        {
          type: "separator",
        },
        {
          label: i18n.t("Language"),
          submenu: languages.map((lang) => {
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
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("add-new-tab");
          },
          id: "addNewTab",
        },
        {
          label: i18n.t("Edit Active Tab"),
          accelerator: "CmdOrCtrl+E",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("edit-tab");
          },
          id: "editActiveTab",
        },
        {
          label: i18n.t("Close Active Tab"),
          accelerator: "CmdOrCtrl+W",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("prompt-before-closing-tab");
          },
          id: "closeActiveTab",
        },
        {
          label: i18n.t("Open Tab DevTools"),
          accelerator: "CmdOrCtrl+Shift+D",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("open-tab-devtools");
          },
          id: "openDevTools",
        },
        {
          label: i18n.t("Restore Tab"),
          accelerator: "CmdOrCtrl+Shift+T",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("restore-tab");
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
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("next-tab");
          },
          id: "gotoNextTab",
        },
        {
          label: i18n.t("Go to Previous Tab"),
          accelerator: "CmdOrCtrl+Shift+Tab",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("previous-tab");
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
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("first-tab");
          },
          id: "gotoFirstTab",
        },
        {
          label: i18n.t("Go to Last Tab"),
          accelerator: "CmdOrCtrl+9",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("last-tab");
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
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.setFullScreen(!window.fullScreen);
          },
          id: "toggleFullscreen",
        },
        {
          label: i18n.t("Toggle Tab Bar"),
          accelerator: "CmdOrCtrl+Shift+B",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("toggle-tab-bar");
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
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("open-theme-manager");
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
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("open-settings");
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
            const versionInfo = `Altus: ${app.getVersion()}
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
                // icon: mainIcon,
                buttons: ["Copy Version Info", "OK"],
              })
              .then((res) => {
                const buttonClicked = res.response;
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
                const buttonClicked = res.response;
                if (buttonClicked === 0) {
                  // checkUpdates().catch((err) => console.error(err));
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
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.openDevTools();
          },
          id: "openWindowDevTools",
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(menuTemplate);
}
