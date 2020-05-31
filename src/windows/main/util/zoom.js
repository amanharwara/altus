/**
 * Zoom In/Out or Reset Zoom of WhatsApp element
 * @param {('in'|'out'|'reset')} type
 * @param {Element} whatsAppElement WhatsApp Element (Should be 'webview' element)
 */
function zoom(type, whatsAppElement) {
    let currentZoomFactor = remote.webContents.fromId(whatsAppElement.getWebContentsId()).zoomFactor;
    switch (type) {
        case 'in':
            remote.webContents.fromId(whatsAppElement.getWebContentsId()).zoomFactor = currentZoomFactor + 0.1;
            break;

        case 'out':
            remote.webContents.fromId(whatsAppElement.getWebContentsId()).zoomFactor = currentZoomFactor - 0.1;
            break;

        case 'reset':
            remote.webContents.fromId(whatsAppElement.getWebContentsId()).zoomFactor = 1;
            break;

        default:
            remote.webContents.fromId(whatsAppElement.getWebContentsId()).zoomFactor = 1;
            break;
    }
}

module.exports = {
    zoom
}