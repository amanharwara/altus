// Base Electron modules
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog,
  shell,
  Tray,
  nativeImage,
} = require("electron");

const url = require("url");
const path = require("path");

// Import electron context menu library
const contextMenu = require("electron-context-menu");

// Import createWindow function
const { createWindow } = require("./js/createWindow");

// Used for storing settings
const Store = require("electron-store");

// Import default settings
const { defaultSettings } = require("./js/defaultSettings");

// Used for fetching base dark theme CSS & more
const fetch = require("node-fetch");

// Used to create a message count badge on Windows
let Badge, BadgeGen;
if (process.platform == "win32") {
  Badge = require("electron-windows-badge");
  BadgeGen = require("electron-windows-badge/badge_generator");
}

// Declaring the window variables to use later
let mainWindow,
  aboutWindow,
  settingsWindow,
  customThemeWindow,
  themeManagerWindow,
  checkUpdatesWindow;

// Declaring the tray icon variable to use later
let trayIcon;

const { generateTheme } = require("./windows/util/generateTheme");

/**
 * Get the Dark Theme CSS and pass it to the createThemesList callback
 * @param {createThemesListCallback} createThemesList
 */
function getDarkTheme(createThemesList) {
  fetch(
    "https://raw.githubusercontent.com/vednoc/dark-whatsapp/master/wa.user.styl",
    {
      cache: "no-cache",
    }
  )
    .then((res) => res.text())
    .then((style) => {
      createThemesList(generateTheme({}, style));
    })
    .catch((err) => {
      throw new Error(err);
    });
}

/**
 * Create the default themes list
 * @callback createThemesListCallback
 * @param {string} darkThemeCSS CSS for the dark theme
 */
function createThemesList(darkThemeCSS) {
  new Store({
    name: "themes",
    defaults: {
      themes: [
        {
          name: "Default",
          css: "",
        },
        {
          name: "Dark",
          css: "",
        },
        {
          name: "Dark Plus",
          css: darkThemeCSS,
        },
      ],
    },
  });
}

// Get the dark theme css using fetch & generate the default themes list
getDarkTheme(createThemesList);

// Declaring the fileMenuTemplate variable & creating the template for the 'File' menu
let fileMenuTemplate = [
  {
    label: "Add New Instance",
    accelerator: "CmdOrCtrl+N",
    click() {
      mainWindow.webContents.send("switch-to-add");
    },
  },
  {
    label: "Force Reload",
    accelerator: "CmdOrCtrl+Shift+R",
    click() {
      var window = BrowserWindow.getFocusedWindow();
      window.webContents.reload();
    },
  },
  {
    label: "Quit",
    accelerator: "CmdOrCtrl+Q",
    click() {
      // Quit the app
      app.exit(0);
    },
  },
];

// Checks if app is packaged or not
if (!app.isPackaged) {
  // Allows DevTools if app is not packaged
  fileMenuTemplate.unshift({
    label: "Open DevTools",
    accelerator: "CmdOrCtrl+Shift+I",
    click() {
      var window = BrowserWindow.getFocusedWindow();
      window.webContents.openDevTools();
    },
  });
}

// Create the main menu template
const mainMenuTemplate = [
  {
    label: "File",
    submenu: fileMenuTemplate,
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
        label: "Go to Next Tab",
        accelerator: "CmdOrCtrl+Tab",
        click() {
          mainWindow.webContents.send("next-tab");
        },
      },
      {
        label: "Go to Previous Tab",
        accelerator: "CmdOrCtrl+Shift+Tab",
        click() {
          mainWindow.webContents.send("previous-tab");
        },
      },
      {
        type: "separator",
      },
      {
        label: "Close Active Tab",
        accelerator: "CmdOrCtrl+W",
        click() {
          if (app.showExitPrompt === true) {
            confirmCloseTab(mainWindow);
          } else {
            mainWindow.webContents.send("close-tab");
          }
        },
      },
      {
        label: "Edit Active Tab",
        accelerator: "CmdOrCtrl+E",
        click() {
          mainWindow.webContents.send("edit-tab");
        },
      },
    ],
  },
  {
    label: "View",
    submenu: [
      {
        label: "Zoom In",
        accelerator: "CmdOrCtrl+numadd",
        click() {
          mainWindow.webContents.send("zoom-in");
        },
      },
      {
        label: "Zoom Out",
        accelerator: "CmdOrCtrl+numsub",
        click() {
          mainWindow.webContents.send("zoom-out");
        },
      },
      {
        label: "Reset Zoom",
        accelerator: "CmdOrCtrl+num0",
        click() {
          mainWindow.webContents.send("reset-zoom");
        },
      },
      {
        type: "separator",
      },
      {
        label: "Toggle Fullscreen",
        accelerator: "F11",
        click() {
          mainWindow.setFullScreen(!mainWindow.fullScreen);
        },
      },
      {
        label: "Toggle Tab Bar",
        accelerator: "CmdOrCtrl+Shift+B",
        click() {
          mainWindow.webContents.send("toggle-tab-bar");
        },
      },
    ],
  },
  {
    label: "Theme",
    submenu: [
      {
        label: "Custom Theme",
        accelerator: "CmdOrCtrl+Shift+T",
        click() {
          // Checks if custom theme window exists
          if (typeof customThemeWindow === "object") {
            // Shows the custom theme window instead of creating new one
            customThemeWindow.show();
          } else {
            // Creates new Browser Window object using createWindow function
            customThemeWindow = createWindow({
              id: "customTheme",
              title: "Theme Creator",
              width: 435,
              height: 350,
              resizable: false,
              mainWindowObject: mainWindow,
              min: true,
              max: false,
              minWidth: 435,
              minHeight: 350,
              maxWidth: 435,
              maxHeight: 425,
            });
            // Loads Custom Theme Window HTML
            customThemeWindow.loadURL(
              url.format({
                pathname: path.join(
                  __dirname,
                  "windows",
                  "customTheme",
                  "customTheme.html"
                ),
                protocol: "file:",
                slashes: true,
              })
            );
            customThemeWindow.once("ready-to-show", () => {
              // Shows the custom theme window
              customThemeWindow.show();
            });
            // Close window event (Hides window when closed, instead of deleting it)
            customThemeWindow.on("close", (e) => {
              e.preventDefault();
              customThemeWindow.hide();
            });
          }
        },
      },
      {
        label: "Manage Themes",
        accelerator: "CmdOrCtrl+T",
        click() {
          // Checks if theme manager window exists
          if (typeof themeManagerWindow === "object") {
            // Shows theme manager window instead of creating new object
            themeManagerWindow.show();
          } else {
            // Creates new Browser Window object using createWindow function
            themeManagerWindow = createWindow({
              id: "themeManager",
              title: "Manage Themes",
              width: 414,
              height: 478,
              resizable: true,
              mainWindowObject: mainWindow,
              min: true,
              max: false,
              minWidth: 300,
              minHeight: 380,
              maxWidth: "",
              maxHeight: "",
            });
            // Loads Theme Manager Window HTML
            themeManagerWindow.loadURL(
              url.format({
                pathname: path.join(
                  __dirname,
                  "windows",
                  "themeManager",
                  "themeManager.html"
                ),
                protocol: "file:",
                slashes: true,
              })
            );
            themeManagerWindow.once("ready-to-show", () => {
              // Shows Theme Manager window
              themeManagerWindow.show();
            });
            // Close window event (Hides window when closed, instead of deleting it)
            themeManagerWindow.on("close", (e) => {
              e.preventDefault();
              themeManagerWindow.hide();
            });
          }
        },
      },
    ],
  },
  {
    label: "Settings",
    submenu: [
      {
        label: "Settings",
        accelerator: "CmdOrCtrl+,",
        click() {
          // Checks settings window exists
          if (typeof settingsWindow === "object") {
            // Shows settings window instead of creating new object
            settingsWindow.show();
          } else {
            // Creates new Browser Window object using createWindow function
            settingsWindow = createWindow({
              id: "settings",
              title: "Settings",
              width: 540,
              height: 515,
              resizable: true,
              mainWindowObject: mainWindow,
              min: true,
              max: false,
              minWidth: 540,
              minHeight: 515,
              maxWidth: "",
              maxHeight: "",
            });
            // Loads settings Window HTML
            settingsWindow.loadURL(
              url.format({
                pathname: path.join(
                  __dirname,
                  "windows",
                  "settings",
                  "settings.html"
                ),
                protocol: "file:",
                slashes: true,
              })
            );
            settingsWindow.once("ready-to-show", () => {
              // Shows settings window
              settingsWindow.show();
            });
            // Close window event (Hides window when closed, instead of deleting it)
            settingsWindow.on("close", (e) => {
              e.preventDefault();
              settingsWindow.hide();
            });
          }
        },
      },
    ],
  },
  {
    label: "About",
    submenu: [
      {
        label: "About",
        click() {
          // Checks if about window exists
          if (typeof aboutWindow === "object") {
            // Shows about window instead of creating new object
            aboutWindow.show();
          } else {
            // Creates new Browser Window object using createWindow function
            aboutWindow = createWindow({
              id: "aboutWindow",
              title: "About",
              width: 435,
              height: 300,
              resizable: false,
              mainWindowObject: mainWindow,
              min: true,
              max: false,
              minWidth: "",
              minHeight: "",
              maxWidth: "",
              maxHeight: "",
            });
            // Loads Theme Manager Window HTML
            aboutWindow.loadURL(
              url.format({
                pathname: path.join(
                  __dirname,
                  "windows",
                  "about",
                  "about.html"
                ),
                protocol: "file:",
                slashes: true,
              })
            );
            aboutWindow.once("ready-to-show", () => {
              // Shows About window
              aboutWindow.show();
            });
            // Close window event (Hides window when closed, instead of deleting it)
            aboutWindow.on("close", (e) => {
              e.preventDefault();
              aboutWindow.hide();
            });
          }
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
          {
            label: "Other Methods...",
            click() {
              shell.openExternal(
                "https://github.com/amanharwara/altus#support"
              );
            },
          },
        ],
      },
      {
        label: "Check For Updates",
        accelerator: "CmdOrCtrl+Shift+U",
        click() {
          // Check is window exists already
          if (typeof checkUpdatesWindow === "object") {
            // Show window instead of creating new object
            checkUpdatesWindow.show();
          } else {
            // Create new browser window object for the window
            checkUpdatesWindow = createWindow({
              id: "checkUpdates",
              title: "Check Updates",
              width: 435,
              height: 340,
              resizable: true,
              mainWindowObject: mainWindow,
              min: false,
              max: false,
              minWidth: 435,
              minHeight: 340,
              maxWidth: "",
              maxHeight: "",
            });
            checkUpdatesWindow.loadURL(
              url.format({
                pathname: path.join(
                  __dirname,
                  "windows",
                  "checkUpdates",
                  "checkUpdates.html"
                ),
                protocol: "file:",
                slashes: true,
              })
            );
            checkUpdatesWindow.once("ready-to-show", () => {
              // Shows About window
              checkUpdatesWindow.show();
            });
            // Close window event (Hides window when closed, instead of deleting it)
            checkUpdatesWindow.on("close", (e) => {
              e.preventDefault();
              checkUpdatesWindow.hide();
            });
          }
        },
      },
      {
        label: "Links",
        submenu: [
          {
            label: "Report Bugs/Issues",
            click: () => {
              shell.openExternal("https://github.com/amanharwara/altus/issues");
            },
          },
          {
            label: "Website",
            click: () => {
              shell.openExternal("https://amanharwara.xyz");
            },
          },
          {
            label: "Repository",
            click: () => {
              shell.openExternal("https://www.github.com/amanharwara/altus");
            },
          },
          {
            label: "Discord Chat",
            click: () => {
              shell.openExternal("https://discord.gg/mGxNGP6");
            },
          },
        ],
      },
    ],
  },
];

// Window State Persistence Data
const windowState = new Store({
  name: "windowState",
  defaults: {
    bounds: {
      x: 0,
      y: 0,
      width: 800,
      height: 600,
    },
    isMaximized: false,
  },
});

// Get tray icon image
let trayIconImage = nativeImage.createFromPath(
  path.join(
    __dirname,
    "/windows/otherAssets/" +
      (process.platform === "linux" ? "tray.png" : "icon.ico")
  )
);

// Using singleInstanceLock for making app single instance
const singleInstanceLock = app.requestSingleInstanceLock();

// Checks for single instance lock
if (!singleInstanceLock) {
  // Quits the second instance
  app.exit(0);
} else {
  // Focus current instance
  app.on("second-instance", () => {
    // Checks if mainWindow object exists
    if (mainWindow) {
      // Checks if main window is minimized
      if (mainWindow.isMinimized()) {
        // Restores the main window
        mainWindow.restore();
      }
      // Focuses the main window
      mainWindow.focus();
    }
  });

  // Sets the default settings
  let settings = new Store({
    name: "settings",
    defaults: {
      settings: defaultSettings,
    },
  });

  app.on("ready", () => {
    // Create the main window object
    mainWindow = new BrowserWindow({
      // Set main window title
      title: `Altus ${app.getVersion()}`,
      // Enable frame if on macOS or if custom titlebar setting is disabled
      frame:
        process.platform !== "darwin"
          ? !Array.from(settings.get("settings")).find(
              (s) => s.id === "customTitlebar"
            ).value
          : true,
      // Show default title bar on macOS and hide it on others
      titleBarStyle: process.platform !== "darwin" ? "hidden" : "default",
      // Set main window background color
      backgroundColor: "#282C34",
      // Set main window icon
      icon: nativeImage.createFromPath(
        path.join(
          __dirname,
          "/windows/otherAssets/icon" +
            (process.platform === "linux" ? ".png" : ".ico")
        )
      ),
      webPreferences: {
        // Enable <webview> tag for embedding WhatsApp
        webviewTag: true,
        // Enable nodeIntegration so window can use node functions
        nodeIntegration: true,
        spellcheck: true,
      },
      // Hides main window until it is ready to show
      show: false,
      minWidth: 800,
      minHeight: 600,
    });

    mainWindow.setBounds(windowState.get("bounds"));

    if (windowState.get("isMaximized")) {
      mainWindow.maximize();
    }

    // Shows window once ready
    mainWindow.once("ready-to-show", () => {
      mainWindow.setFullScreen(false);
      mainWindow.show();
    });

    // Load the main window HTML file
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "windows", "main", "main.html"),
        protocol: "file:",
        slashes: true,
      })
    );

    // Main Window Close Event
    mainWindow.on("close", (e) => {
      // Store window bounds & maximize data
      windowState.set("bounds", mainWindow.getBounds());
      windowState.set("isMaximized", mainWindow.isMaximized());

      if (app.closeToTray) {
        e.preventDefault();
        mainWindow.hide();
      } else {
        // Checks if "app.showExitPrompt" variable is true
        if (app.showExitPrompt) {
          // Stops app from closing in usual manner
          e.preventDefault();
          // Uses a new function to confirm and then closes the app
          confirmExit();
        }
      }
    });

    // Main Window Closed Event
    mainWindow.on("closed", () => {
      // Gets rid of the main window object from memory
      mainWindow = null;
      // Quits app
      app.quit();
    });

    // Creates a new message count badge for the main window if the Badge variable is enabled
    if (Badge)
      new Badge(mainWindow, {
        font: "4px Calibri",
      });

    // Building main menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    // Setting the main menu
    Menu.setApplicationMenu(mainMenu);

    /**
     * Set global settings
     */
    function setGlobalSettings() {
      if (
        settings.get("settings").find((s) => s.id === "trayIcon").value === true
      ) {
        // If tray icon setting is enabled

        // Create context menu for tray icon
        let trayContextMenu = Menu.buildFromTemplate([
          {
            label: "Maximize",
            click() {
              if (mainWindow) {
                // Show the main window
                mainWindow.show();
                // Focus the main window
                mainWindow.focus();
              }
            },
          },
          {
            label: "Minimize to Tray",
            click() {
              // Hide the main window i.e. minimize to tray
              mainWindow.hide();
            },
          },
          {
            label: "Exit",
            click() {
              // Quit the app
              app.exit(0);
            },
          },
        ]);

        // Checks if the tray icon already exists or not
        if (typeof trayIcon !== "object") {
          if (process.platform !== "darwin") {
            // Create tray icon on Windows
            trayIcon = new Tray(trayIconImage);

            // Set tray icon tooltip
            trayIcon.setToolTip("Altus");

            // Set tray icon context menu
            trayIcon.setContextMenu(trayContextMenu);

            // Add double-click event
            trayIcon.on("double-click", () => {
              mainWindow.show();
            });
          } else if (process.platform === "darwin") {
            // Set dock menu on MacOS
            app.dock.setMenu(trayContextMenu);
          }
        }
      } else {
        // If tray icon setting is disabled
        if (trayIcon) {
          // Destroy tray icon programmatically
          trayIcon.destroy();
        }
        // Nullify tray icon variable
        trayIcon = null;
        trayIcon = undefined;
      }

      let exitPromptSetting = settings
        .get("settings")
        .find((s) => s.id === "exitPrompt");
      let tabBarSetting = settings
        .get("settings")
        .find((s) => s.id === "tabBar");

      let closeToTraySetting = settings
        .get("settings")
        .find((s) => s.id === "closeToTray");

      if (exitPromptSetting && exitPromptSetting.value === true) {
        app.showExitPrompt = true;
      } else {
        app.showExitPrompt = false;
      }

      if (tabBarSetting && tabBarSetting.value === true) {
        mainWindow.webContents.send("toggle-tab-bar", true);
      } else {
        mainWindow.webContents.send("toggle-tab-bar", false);
      }

      if (closeToTraySetting && closeToTraySetting.value === true) {
        app.closeToTray = true;
      } else {
        app.closeToTray = false;
      }
    }

    /**
     * Check if all settings are in place and add if not
     */
    function validateGlobalSettings() {
      let _settings = settings.get("settings");
      let wereInvalid = false;
      defaultSettings.forEach((setting, index) => {
        let _index = _settings.findIndex(
          (_setting) => _setting.name === setting.name
        );
        if (_index === -1) {
          _settings.unshift(setting);
          settings.set("settings", _settings);
          wereInvalid = true;
        }
      });
      if (wereInvalid) {
        return false;
      } else {
        return true;
      }
    }

    if (validateGlobalSettings()) {
      setGlobalSettings();
    } else {
      app.relaunch();
      app.exit(0);
    }

    // IPC Functions

    // Send 'zoom-in' message to mainWindow
    ipcMain.on("zoom-in", () => mainWindow.webContents.send("zoom-in"));
    // Send 'zoom-out' message to mainWindow
    ipcMain.on("zoom-out", () => mainWindow.webContents.send("zoom-out"));
    // Send 'reset-zoom' message to mainWindow
    ipcMain.on("reset-zoom", () => mainWindow.webContents.send("reset-zoom"));

    // Opens links in external browser
    ipcMain.on("link-open", (e, link) => shell.openExternal(link));

    // Refresh main window when a theme is added or removed
    ipcMain.on("themes-changed", () =>
      mainWindow.webContents.send("themes-changed", true)
    );

    // Set global settings whenever they are changed
    ipcMain.on("settings-changed", () => setGlobalSettings());

    // Message Indicator
    let trayBadge;

    if (process.platform === "win32") trayBadge = new BadgeGen(mainWindow);

    ipcMain.on("message-indicator", (e, messageCount) => {
      if (
        messageCount > 0 &&
        messageCount !== null &&
        messageCount !== undefined
      ) {
        switch (process.platform) {
          case "darwin":
            app.dock.setBadge("·");
            break;
          case "win32":
            if (
              settings
                .get("settings")
                .find((setting) => setting.id === "notificationCountInTray")
                .value
            ) {
              trayBadge.generate(messageCount).then((imgDataUrl) => {
                const generatedImage = nativeImage.createFromDataURL(
                  imgDataUrl
                );
                if (trayIcon) trayIcon.setImage(generatedImage);
              });
            }
            break;
          default:
            break;
        }
      } else {
        switch (process.platform) {
          case "darwin":
            app.dock.setBadge("");
            break;
          default:
            if (trayIcon) trayIcon.setImage(trayIconImage);
            break;
        }
      }

      if (process.platform === "win32") {
        mainWindow.webContents.send("message-indicator", messageCount);
      }
    });
  });

  // When web contents are created
  app.on("web-contents-created", (e, c) => {
    // Initialize the context menu
    contextMenu({
      window: c,
      showSaveImageAs: true,
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

    // Prevents default Enter (instead Control + Enter)
    c.on("before-input-event", function (event, input) {
      if (
        settings.get("settings").find((s) => s.id === "preventEnter").value ===
        true
      ) {
        if (input.key === "Enter" && !input.shift && !input.control) {
          c.webContents.sendInputEvent({
            keyCode: "Shift+Return",
            type: "keyDown",
          });
          event.preventDefault();
          return;
        }

        if (input.key === "Enter" && input.control) {
          c.webContents.executeJavaScript(
            `document.querySelector('[data-icon="send"]').click()`
          );
          event.preventDefault();
          return;
        }
      }
    });
  });

  // Quits app if all windows are closed
  app.on("window-all-closed", () => {
    app.quit();
  });
}

/**
 * Confirm exiting using a dialog
 */
function confirmExit() {
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
}

function confirmCloseTab(mainWindow) {
  dialog
    .showMessageBox({
      type: "question",
      buttons: ["OK", "Cancel"],
      title: "Close tab",
      message: "Are you sure you want to close the tab?",
    })
    .then((res) => {
      if (res.response == 0) {
        mainWindow.webContents.send("close-tab");
        return;
      }
    });
}
