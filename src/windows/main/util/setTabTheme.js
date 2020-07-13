/**
 * Set theme of a tab
 * @param {Element} whatsapp The whatsapp webview element for the specific tab
 * @param {string} theme The name of theme that is supposed to be applied
 */
function setTabTheme(whatsapp, theme) {
    remote.webContents.fromId(whatsapp.getWebContentsId()).send('theme', theme);
}

module.exports = {
    setTabTheme
}