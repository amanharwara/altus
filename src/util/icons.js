const { nativeImage } = require("electron");
const path = require("path");

const mainIcon = nativeImage.createFromPath(
  path.join(
    __dirname,
    "../icons/icon" + (process.platform === "linux" ? ".png" : ".ico")
  )
);

const mainNotifIcon = nativeImage.createFromPath(
  path.join(__dirname, "../icons/icon-notif.png")
);

const trayIcon = nativeImage.createFromPath(
  path.join(
    __dirname,
    "../icons/" + (process.platform === "linux" ? "tray.png" : "icon.ico")
  )
);

const trayNotifIcon = nativeImage.createFromPath(
  path.join(__dirname, "../icons/tray-notification.png")
);

module.exports = { mainIcon, mainNotifIcon, trayIcon, trayNotifIcon };
