const { BrowserWindow } = require("electron");

const handleWhatsappLinks = (argv) => {
  let arg = argv.find((arg) => arg.includes("whatsapp"));
  let url = "https://web.whatsapp.com/";

  if (arg.includes("send/?phone")) {
    url += arg.split("://")[1].replace("/", "");
  } else if (arg.includes("chat/?code")) {
    url += "accept?code=" + arg.split("=")[1];
  }

  BrowserWindow.getAllWindows()[0].webContents.executeJavaScript(`
  document.querySelector('.active webview').src = "${url}";
  `);
};

module.exports = handleWhatsappLinks;
