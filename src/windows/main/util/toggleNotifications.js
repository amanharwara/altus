/**
 * Toggle notifications of a tab (Requires tab to be refreshed)
 * @param {Element} whatsAppElement The whatsapp webview element for the specific tab
 * @param {boolean} setting Enable = true | Disable = false
 * @param {boolean} firstStart Whether the function is being run at the start of the app
 */
function toggleNotifications(whatsAppElement, setting, firstStart) {
  let whatsapp = whatsAppElement;
  if (firstStart) {
    whatsapp.addEventListener("dom-ready", () => {
      remote.webContents
        .fromId(whatsapp.getWebContentsId())
        .send("toggle-notification", setting);
    });
  } else {
    remote.webContents
      .fromId(whatsapp.getWebContentsId())
      .send("toggle-notification", setting);
  }
}

module.exports = {
  toggleNotifications,
};
