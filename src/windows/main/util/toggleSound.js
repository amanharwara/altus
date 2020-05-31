/**
 * Toggle sound of a tab
 * @param {Element} whatsAppElement The whatsapp webview element for the specific tab
 * @param {boolean} setting Enable = true | Disable = false
 * @param {boolean} firstStart Whether the function is being run at the start of the app
 */
function toggleSound(whatsAppElement, setting, firstStart) {
    let whatsapp = whatsAppElement;
    if (firstStart) {
        whatsapp.addEventListener('dom-ready', () => {
            if (setting) {
                remote.webContents.fromId(whatsapp.getWebContentsId()).audioMuted = false;
            } else {
                remote.webContents.fromId(whatsapp.getWebContentsId()).audioMuted = true;
            }
        });
    } else {
        if (setting) {
            remote.webContents.fromId(whatsapp.getWebContentsId()).audioMuted = false;
        } else {
            remote.webContents.fromId(whatsapp.getWebContentsId()).audioMuted = true;
        }
    }
}

module.exports = {
    toggleSound
}