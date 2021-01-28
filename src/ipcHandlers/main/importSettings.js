const { dialog, BrowserWindow } = require("electron");
const fs = require("fs");

const importSettings = () => {
  dialog
    .showOpenDialog({
      title: "Import Settings",
      filters: [
        {
          name: "JSON",
          extensions: ["json"],
        },
      ],
      properties: ["openFile"],
    })
    .then((result) => {
      if (!result.canceled) {
        fs.readFile(result.filePaths[0], (err, data) => {
          if (!err) {
            const imported = JSON.parse(data.toString());
            BrowserWindow.getFocusedWindow().webContents.send(
              "import-settings",
              imported
            );
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = importSettings;
