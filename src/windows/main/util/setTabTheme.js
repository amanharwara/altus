/**
 * Set theme of a tab
 * @param {Element} whatsapp The whatsapp webview element for the specific tab
 */
function setTabTheme(whatsapp, theme) {
    remote.webContents.fromId(whatsapp.getWebContentsId()).send('theme', {
        theme,
        tabId: whatsapp.id.replace("whatsapp-", "")
    });
}

module.exports = {
    setTabTheme
}