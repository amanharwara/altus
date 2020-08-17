/**
 * Set theme of a tab
 * @param {Element} whatsapp The whatsapp webview element for the specific tab
 * @param {boolean} enabled Whether utility bar is enabled or not.
 */
function setUtilityBar(whatsapp, enabled) {
    remote.webContents.fromId(whatsapp.getWebContentsId()).send('utility-bar', enabled);
}

module.exports = {
    setUtilityBar
}