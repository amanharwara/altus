import {
  app,
  BrowserWindow,
  clipboard,
  dialog,
  ipcMain,
  Menu,
  MenuItem,
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
import { fallbackLanguage, languages } from "./i18n/langauges.config";
import os from "os";
import { SettingsStore } from "./stores/settings/common";
import Store from "electron-store";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const windowState = new Store<{
  width: number | null;
  height: number | null;
  x: number | null;
  y: number | null;
}>({
  name: "windowState",
  defaults: {
    width: null,
    height: null,
    x: null,
    y: null,
  },
});

const createWindow = () => {
  const useCustomTitlebar =
    process.platform !== "darwin" &&
    electronSettingsStore.get("settings").customTitlebar.value;

  const rememberWindowSize =
    electronSettingsStore.get("settings").rememberWindowSize.value;
  const rememberWindowPosition =
    electronSettingsStore.get("settings").rememberWindowPosition.value;

  const mainWindow = new BrowserWindow({
    minWidth: 520,
    minHeight: 395,
    width: rememberWindowSize ? windowState.get("width") || 800 : undefined,
    height: rememberWindowSize ? windowState.get("height") || 600 : undefined,
    x: rememberWindowPosition ? windowState.get("x") || undefined : undefined,
    y: rememberWindowPosition ? windowState.get("y") || undefined : undefined,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webviewTag: true,
    },
    title: "Altus",
    show: false,
    frame: !useCustomTitlebar,
    titleBarStyle: useCustomTitlebar ? "hidden" : "default",
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

  if (electronSettingsStore.get("settings").launchMinimized.value) {
    mainWindow.minimize();
    mainWindow.blur();
  } else {
    mainWindow.once("ready-to-show", () => {
      mainWindow.show();
      mainWindow.focus();
    });
  }

  mainWindow.on("resize", () => {
    windowState.store = mainWindow.getBounds();
  });

  mainWindow.on("move", () => {
    windowState.store = mainWindow.getBounds();
  });

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

    pruneUnusedPartitions(
      electronTabStore.get("tabs"),
      electronTabStore.get("previouslyClosedTab"),
      app.getPath("userData")
    );

    const mainWindow = createWindow();

    initializeI18N(mainWindow);

    addIPCHandlers(mainWindow);
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
  mainWindow.webContents.send("open-whatsapp-link", url);
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

function addIPCHandlers(mainWindow: BrowserWindow) {
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

  ipcMain.handle(
    "show-message-box",
    (_event, options: Electron.MessageBoxOptions) => {
      return dialog.showMessageBox(options);
    }
  );

  ipcMain.handle("get-app-menu", () => {
    const menu = Menu.getApplicationMenu();
    if (!menu) return;
    const cloneableMenu = getCloneableMenu(menu);
    return cloneableMenu;
  });

  ipcMain.handle("menu-item-click", (_event, id: string) => {
    const menu = Menu.getApplicationMenu();
    if (!menu) return;
    const item = menu.getMenuItemById(id);
    if (!item) return;
    item.click();
  });

  ipcMain.handle("minimize-window", () => {
    mainWindow.minimize();
  });

  ipcMain.handle("maximize-window", () => {
    mainWindow.maximize();
  });

  ipcMain.handle("restore-window", () => {
    mainWindow.restore();
  });

  ipcMain.handle("close-window", () => {
    mainWindow.close();
  });

  ipcMain.handle("is-maximized", () => {
    return mainWindow.isMaximized();
  });

  ipcMain.handle("is-blurred", () => {
    return !mainWindow.isFocused();
  });

  mainWindow.on("blur", () => mainWindow.webContents.send("window-blurred"));
  mainWindow.on("focus", () => mainWindow.webContents.send("window-focused"));
}

type CloneableMenuItem = Omit<MenuItem, "menu" | "submenu" | "click"> & {
  submenu?: CloneableMenu;
};
export type CloneableMenu = CloneableMenuItem[];

function getCloneableMenu(menu: Menu) {
  return menu.items.map(getCloneableMenuItem);
}

function getCloneableMenuItem(item: MenuItem): CloneableMenuItem {
  const cloneableItem = { ...item } as CloneableMenuItem & {
    menu?: Menu;
    submenu?: Menu;
    click?: () => void;
  };
  delete cloneableItem["menu"];
  delete cloneableItem["click"];
  if (cloneableItem.submenu) {
    (cloneableItem as CloneableMenuItem).submenu = getCloneableMenu(
      cloneableItem.submenu as Menu
    );
  }
  cloneableItem.checked = item.checked;
  return cloneableItem;
}

function initializeI18N(mainWindow: BrowserWindow) {
  if (!i18n.isInitialized) {
    i18n.init(
      {
        ...i18nOptions,
        lng:
          (electronSettingsStore.get("settings").language?.value as string) ||
          fallbackLanguage,
      },
      (error) => {
        if (error) console.error("i18n initialization error:", error);

        i18n.on("loaded", () => {
          const menu = getLocalizedMainMenu();
          Menu.setApplicationMenu(menu);
          mainWindow.webContents.send("reload-custom-title-bar");
          i18n.off("loaded");
        });

        i18n.on("languageChanged", (lng) => {
          const menu = getLocalizedMainMenu();
          Menu.setApplicationMenu(menu);
          mainWindow.webContents.send("reload-custom-title-bar");

          electronSettingsStore.set("settings", {
            ...electronSettingsStore.get("settings"),
            language: {
              value: lng,
            },
          });
        });
      }
    );
  }
}

const versionInfo = `Altus: ${app.getVersion()}
Electron: ${process.versions.electron}
Chrome: ${process.versions.chrome}
V8: ${process.versions.v8}
OS: ${os.type()} ${os.arch()} ${os.release()}`;

const aboutDialogText = `With help from: MarceloZapatta, Dafnik, dmcdo, insign, srevinsaju, maicol07, ngmoviedo.

Thanks to: vednoc for Dark WhatsApp theme.
  
${versionInfo}`;

function getLocalizedMainMenu() {
  const menuTemplate: (
    | Electron.MenuItemConstructorOptions
    | Electron.MenuItem
  )[] = [
    {
      label: i18n.t("&File"),
      submenu: [
        {
          label: i18n.t("Start &New Chat"),
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("new-chat");
          },
          id: "start-new-chat",
        },
        {
          label: i18n.t("Force &Reload"),
          role: "forceReload",
          id: "force-reload",
        },
        {
          label: i18n.t("&Quit"),
          role: "quit",
          id: "quit",
        },
      ],
    },
    {
      label: i18n.t("&Edit"),
      submenu: [
        {
          label: i18n.t("Undo"),
          role: "undo",
          id: "undo",
        },
        {
          label: i18n.t("Redo"),
          role: "redo",
          id: "redo",
        },
        {
          type: "separator",
        },
        {
          label: i18n.t("Cut"),
          role: "cut",
          id: "cut",
        },
        {
          label: i18n.t("Copy"),
          role: "copy",
          id: "copy",
        },
        {
          label: i18n.t("Paste"),
          role: "paste",
          id: "paste",
        },
        {
          label: i18n.t("Select All"),
          role: "selectAll",
          id: "select-all",
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
              id: lang,
            };
          }),
        },
      ],
    },
    {
      label: i18n.t("Tab"),
      submenu: [
        {
          label: i18n.t("Add New Tab"),
          accelerator: "CmdOrCtrl+T",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("add-new-tab");
          },
          id: "add-new-tab",
        },
        {
          label: i18n.t("Edit Active Tab"),
          accelerator: "CmdOrCtrl+E",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("edit-active-tab");
          },
          id: "edit-active-tab",
        },
        {
          label: i18n.t("Close Active Tab"),
          accelerator: "CmdOrCtrl+W",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("close-active-tab");
          },
          id: "close-active-tab",
        },
        {
          label: i18n.t("Open Tab DevTools"),
          accelerator: "CmdOrCtrl+Shift+D",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("open-tab-devtools");
          },
          id: "open-tab-devtools",
        },
        {
          label: i18n.t("Restore Tab"),
          accelerator: "CmdOrCtrl+Shift+T",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("restore-tab");
          },
          id: "restore-tab",
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
          id: "next-tab",
        },
        {
          label: i18n.t("Go to Previous Tab"),
          accelerator: "CmdOrCtrl+Shift+Tab",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("previous-tab");
          },
          id: "previous-tab",
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
          id: "first-tab",
        },
        {
          label: i18n.t("Go to Last Tab"),
          accelerator: "CmdOrCtrl+9",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("last-tab");
          },
          id: "last-tab",
        },
      ],
    },
    {
      label: i18n.t("Themes"),
      submenu: [
        {
          label: i18n.t("Theme Manager"),
          accelerator: "Alt+T",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("open-theme-manager");
          },
          id: "open-theme-manager",
        },
      ],
    },
    {
      label: i18n.t("&Settings"),
      submenu: [
        {
          label: i18n.t("&Settings"),
          accelerator: "Ctrl+,",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("open-settings");
          },
          id: "open-settings",
        },
      ],
    },
    {
      label: i18n.t("&Help"),
      submenu: [
        {
          label: i18n.t("&About"),
          click() {
            dialog
              .showMessageBox({
                type: "info",
                title: `Altus v${app.getVersion()}`,
                message: `Made by Aman Harwara.`,
                detail: aboutDialogText,
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
          id: "check-for-updates",
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
              id: "report-bugs-issues",
            },
            {
              label: i18n.t("Website"),
              click: () => {
                shell.openExternal("https://amanharwara.com");
              },
              id: "website",
            },
            {
              label: i18n.t("Repository"),
              click: () => {
                shell.openExternal("https://www.github.com/amanharwara/altus");
              },
              id: "repository",
            },
          ],
        },
        {
          label: i18n.t("Open &DevTools"),
          role: "toggleDevTools",
          id: "toggle-dev-tools",
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(menuTemplate);
}
