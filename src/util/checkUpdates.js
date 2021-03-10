const getReleases = require("./getReleases");
const { dialog, app, shell } = require("electron");

const checkUpdates = async () => {
  let response = await getReleases();
  if (response[0]) {
    let releases = await response[1];
    let latest = releases[0];

    if (latest.tag_name !== app.getVersion()) {
      dialog
        .showMessageBox({
          title: "New Update Available",
          message: `New Version: v${latest.tag_name}`,
          detail: "Download?",
          buttons: ["Download", "Open Changelog", "Cancel"],
        })
        .then(({ response }) => {
          if (response === 0) {
            let url;
            switch (process.platform) {
              case "win32":
                url = latest.assets.find((asset) => asset.name.includes("exe"))
                  .browser_download_url;
                shell.openExternal(url);
                break;
              case "darwin":
                url = latest.assets.find((asset) => asset.name.includes("dmg"))
                  .browser_download_url;
                shell.openExternal(url);
                break;
              case "linux":
                url = latest.assets.find((asset) =>
                  asset.name.includes("AppImage")
                ).browser_download_url;
                shell.openExternal(url);
                break;
              default:
                shell.openExternal(latest.html_url);
                break;
            }
          }

          if (response === 1) {
            shell.openExternal(latest.html_url);
          }
        })
        .catch((err) => console.error(err));
    } else {
      dialog.showMessageBox({
        title: "No Update Available.",
        message: "Looks like you're already on the latest version.",
        buttons: ["OK"],
      });
    }
  } else {
    dialog.showErrorBox("Error while checking updates", response[1]);
  }
};

module.exports = checkUpdates;
