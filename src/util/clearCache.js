const fs = require("fs");
const path = require("path");

/** @typedef {import("../types").TabType} TabType */
/** @typedef {import("electron").BrowserWindow} BrowserWindow */

const rmDirIfExists = (path) => {
  if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true });
  }
};

/**
 * @param {string} tabId
 * @param {string} partitionsDir
 */
const clearTabCache = (tabId, partitionsDir) => {
  const tabDir = path.join(partitionsDir, tabId);
  const cacheDir = path.join(tabDir, "Cache");
  const codeCacheDir = path.join(tabDir, "Code Cache");
  rmDirIfExists(cacheDir);
  rmDirIfExists(codeCacheDir);
};

/**
 * @param {string} tabId
 * @param {string} userDataPath
 * @param {TabType[]} tabs
 * @param {BrowserWindow} mainWindow
 */
const clearCache = (tabId, userDataPath, tabs, mainWindow) => {
  const globalCacheDir = path.join(userDataPath, "Cache");
  const globalCodeCacheDir = path.join(userDataPath, "Code Cache");
  const partitionsDir = path.join(userDataPath, "Partitions");
  if (tabId) {
    clearTabCache(tabId, partitionsDir);
    mainWindow.webContents.send("cleared-tab-cache");
    return;
  } else {
    rmDirIfExists(globalCacheDir);
    rmDirIfExists(globalCodeCacheDir);
    tabs.forEach(({ id }) => {
      clearTabCache(id, partitionsDir);
    });
    mainWindow.webContents.send("cleared-all-cache");
  }
};

module.exports = clearCache;
