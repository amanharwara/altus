import {
  app,
  BrowserWindow,
  clipboard,
  dialog,
  ipcMain,
  Menu,
  MenuItem,
  nativeImage,
  session,
  shell,
  Tray,
} from "electron";
import fs from "fs";
import path from "path";
import { isDev } from "./utils/isDev";
import { electronTabStore } from "./stores/tabs/electron";
import { Tab, TabStore } from "./stores/tabs/common";
import { electronThemeStore } from "./stores/themes/electron";
import { ThemeStore } from "./stores/themes/common";
import { electronSettingsStore } from "./stores/settings/electron";
import { languages } from "./i18n/langauges.config";
import os from "os";
import Store from "electron-store";
import { electronI18N } from "./i18n/electron";
import { SettingKey } from "./stores/settings/common";

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

let tray: Tray | undefined;

const createWindow = () => {
  const useCustomTitlebar =
    process.platform !== "darwin" &&
    electronSettingsStore.get("customTitlebar").value;

  const rememberWindowSize =
    electronSettingsStore.get("rememberWindowSize").value;

  const rememberWindowPosition = electronSettingsStore.get(
    "rememberWindowPosition"
  ).value;

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
    icon: "./src/icons/app/icon.png",
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

  if (electronSettingsStore.get("launchMinimized").value) {
    mainWindow.minimize();
    mainWindow.blur();
  } else {
    mainWindow.once("ready-to-show", () => {
      mainWindow.show();
      mainWindow.focus();
    });
  }

  changeAutoHideMenuBar(
    mainWindow,
    electronSettingsStore.get("autoHideMenuBar").value
  );

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
  app.on("second-instance", (_, argv) => {
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

    initializeI18N(mainWindow).then(() => {
      toggleTray(mainWindow, electronSettingsStore.get("trayIcon").value);
    });

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

  app.on("web-contents-created", (_, webContents) => {
    webContents.on("before-input-event", (event, input) => {
      if (electronSettingsStore.get("preventEnter").value) {
        if (input.key === "Enter" && !input.shift && !input.control) {
          webContents.sendInputEvent({
            keyCode: "Shift+Return",
            type: "keyDown",
          });
          event.preventDefault();
          return;
        }

        if (input.key === "Enter" && input.control) {
          webContents.executeJavaScript(
            `document.querySelector('[data-icon="send"]').click()`
          );
          event.preventDefault();
          return;
        }
      }
    });
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

function changeAutoHideMenuBar(mainWindow: BrowserWindow, value: boolean) {
  mainWindow.setAutoHideMenuBar(value);
  mainWindow.setMenuBarVisibility(!value);
}

function toggleTray(mainWindow: BrowserWindow, enabled: boolean) {
  if (!enabled) {
    if (tray) tray.destroy();
    tray = undefined;
    return;
  }
  if (process.platform === "darwin") {
    app.dock.setMenu(getLocalizedTrayMenu());
  }
  const icon = nativeImage.createFromPath(
    process.platform === "win32"
      ? "./src/icons/app/icon.ico"
      : "./src/icons/app/tray.png"
  );
  tray = new Tray(
    process.platform === "darwin"
      ? icon.resize({
          width: 16,
          height: 16,
        })
      : icon
  );
  tray.setToolTip("Altus");
  tray.setContextMenu(getLocalizedTrayMenu());
  if (process.platform !== "darwin") {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  }
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
    (_event, key: SettingKey, value: unknown) => {
      if (value === undefined) return electronSettingsStore.delete(key);
      if (key === "autoHideMenuBar") {
        changeAutoHideMenuBar(mainWindow, value as boolean);
      } else if (key === "trayIcon") {
        toggleTray(mainWindow, value as boolean);
      }
      return electronSettingsStore.set(key, { value });
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
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (!focusedWindow) return;
    const focusedWebContents = focusedWindow.webContents;
    item.click(undefined, focusedWindow, focusedWebContents);
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

async function initializeI18N(mainWindow: BrowserWindow) {
  electronI18N.setLanguageChangeCallback((language) => {
    electronSettingsStore.set("language", {
      value: language,
    });
  });

  electronI18N.setLanguageLoadedCallback(() => {
    const menu = getLocalizedMainMenu();
    Menu.setApplicationMenu(menu);
    mainWindow.webContents.send("reload-custom-title-bar");
    mainWindow.webContents.send("reload-translations");
  });

  try {
    await electronI18N.initialize();

    const initialLanguage = electronSettingsStore.get("language").value;
    electronI18N.setLanguage(initialLanguage);
  } catch (error) {
    console.error(error);
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
      label: electronI18N.t("&File"),
      submenu: [
        {
          label: electronI18N.t("Start &New Chat"),
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("new-chat");
          },
          id: "start-new-chat",
        },
        {
          label: electronI18N.t("Force &Reload"),
          role: "forceReload",
          id: "force-reload",
        },
        {
          label: electronI18N.t("&Quit"),
          role: "quit",
          id: "quit",
        },
      ],
    },
    {
      label: electronI18N.t("&Edit"),
      submenu: [
        {
          label: electronI18N.t("Undo"),
          role: "undo",
          id: "undo",
        },
        {
          label: electronI18N.t("Redo"),
          role: "redo",
          id: "redo",
        },
        {
          type: "separator",
        },
        {
          label: electronI18N.t("Cut"),
          role: "cut",
          id: "cut",
        },
        {
          label: electronI18N.t("Copy"),
          role: "copy",
          id: "copy",
        },
        {
          label: electronI18N.t("Paste"),
          role: "paste",
          id: "paste",
        },
        {
          label: electronI18N.t("Select All"),
          role: "selectAll",
          id: "select-all",
        },
        {
          type: "separator",
        },
        {
          label: electronI18N.t("Language"),
          submenu: languages.map((lang) => {
            return {
              label: electronI18N.t(lang),
              type: "radio",
              checked: electronI18N.getLanguage() === lang,
              click: () => {
                electronI18N.setLanguage(lang);
              },
              id: lang,
            };
          }),
        },
      ],
    },
    {
      label: electronI18N.t("Tab"),
      submenu: [
        {
          label: electronI18N.t("Add New Tab"),
          accelerator: "CmdOrCtrl+T",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("add-new-tab");
          },
          id: "add-new-tab",
        },
        {
          label: electronI18N.t("Edit Active Tab"),
          accelerator: "CmdOrCtrl+E",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("edit-active-tab");
          },
          id: "edit-active-tab",
        },
        {
          label: electronI18N.t("Close Active Tab"),
          accelerator: "CmdOrCtrl+W",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("close-active-tab");
          },
          id: "close-active-tab",
        },
        {
          label: electronI18N.t("Open Tab DevTools"),
          accelerator: "CmdOrCtrl+Shift+D",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("open-tab-devtools");
          },
          id: "open-tab-devtools",
        },
        {
          label: electronI18N.t("Restore Tab"),
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
          label: electronI18N.t("Go to Next Tab"),
          accelerator: "CmdOrCtrl+Tab",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("next-tab");
          },
          id: "next-tab",
        },
        {
          label: electronI18N.t("Go to Previous Tab"),
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
          label: electronI18N.t("Go to First Tab"),
          accelerator: "CmdOrCtrl+1",
          click() {
            const window = BrowserWindow.getFocusedWindow();
            if (window) window.webContents.send("first-tab");
          },
          id: "first-tab",
        },
        {
          label: electronI18N.t("Go to Last Tab"),
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
      label: electronI18N.t("Themes"),
      submenu: [
        {
          label: electronI18N.t("Theme Manager"),
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
      label: electronI18N.t("&Settings"),
      submenu: [
        {
          label: electronI18N.t("&Settings"),
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
      label: electronI18N.t("&Help"),
      submenu: [
        {
          label: electronI18N.t("&About"),
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
          label: electronI18N.t("Check For &Updates"),
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
          label: electronI18N.t("Links"),
          submenu: [
            {
              label: electronI18N.t("Report Bugs/Issues"),
              click: () => {
                shell.openExternal(
                  "https://gitlab.com/amanharwara/altus/-/issues"
                );
              },
              id: "report-bugs-issues",
            },
            {
              label: electronI18N.t("Website"),
              click: () => {
                shell.openExternal("https://amanharwara.com");
              },
              id: "website",
            },
            {
              label: electronI18N.t("Repository"),
              click: () => {
                shell.openExternal("https://www.github.com/amanharwara/altus");
              },
              id: "repository",
            },
          ],
        },
        {
          label: electronI18N.t("Open &DevTools"),
          role: "toggleDevTools",
          id: "toggle-dev-tools",
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(menuTemplate);
}

function getLocalizedTrayMenu() {
  const menuTemplate: (
    | Electron.MenuItemConstructorOptions
    | Electron.MenuItem
  )[] = [
    {
      label: electronI18N.t("Maximize"),
      click() {
        const window = BrowserWindow.getAllWindows()[0];
        if (window) window.show();
      },
    },
    {
      label: electronI18N.t("Minimize to Tray"),
      click() {
        const window = BrowserWindow.getAllWindows()[0];
        if (window) window.hide();
      },
    },
    {
      label: electronI18N.t("Quit"),
      role: "quit",
    },
  ];

  return Menu.buildFromTemplate(menuTemplate);
}
