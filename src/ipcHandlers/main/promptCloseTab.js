const { dialog, BrowserWindow } = require("electron");

const promptCloseTab = (e, id) => {
  dialog
    .showMessageBox({
      type: "question",
      buttons: ["OK", "Cancel"],
      title: "Close Tab",
      message: "Are you sure you want to close the tab?",
    })
    .then((res) => {
      if (res.response == 0) {
        BrowserWindow.getFocusedWindow().webContents.send("close-tab", id);
        return;
      }
    });
};

module.exports = promptCloseTab;
