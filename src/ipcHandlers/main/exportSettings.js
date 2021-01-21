const { dialog } = require("electron");
const fs = require("fs");

const exportSettings = (e, settings) => {
  dialog
    .showSaveDialog({
      title: "Export Settings",
      filters: [
        {
          name: "JSON",
          extensions: ["json"],
        },
      ],
    })
    .then((result) => {
      const { filePath, canceled } = result;
      if (!canceled) {
        const data = new Uint8Array(
          Buffer.from(JSON.stringify(settings, null, "\t"))
        );
        fs.writeFile(filePath, data, (err) => {
          if (err) throw err;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = exportSettings;
