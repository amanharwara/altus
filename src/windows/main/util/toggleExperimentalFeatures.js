/**
 * Toggle experimental features in a whatsapp instance
 * @param {Element} whatsapp The whatsapp webview element for the specific tab
 * @param {object} exp
 * @param {boolean} exp.value Whether experimental features are on/off
 * @param {string[]} exp.features List of experimental features to enable
 * @param {string} exp.id ID of whatsapp tab
 */
function toggleExperimentalFeatures(whatsapp, exp) {
    remote.webContents.fromId(whatsapp.getWebContentsId()).send('set-experimental-features', exp);
}

module.exports = {
    toggleExperimentalFeatures
}