const { ipcRenderer } = require('electron');

window.onclick = function(e) {
    if (e.target.tagName == "A") {
        ipcRenderer.send('linkOpen', e.target.href);
    }
}

/* Mac Copy/Paste Fix */
var isCtrl = false;
var isCmd = false;
window.onkeyup = function(e) {
    if (e.which == 17) isCtrl = false;
    if (e.which == 91) isCmd = false;
}
window.onkeydown = function(e) {
    if (e.which == 17) isCtrl = true;
    if (e.which == 91) isCmd = false;
    if (e.which == 67 && (isCtrl || isCmd)) document.execCommand('copy');
    if (e.which == 86 && (isCtrl || isCmd)) document.execCommand('paste');
}