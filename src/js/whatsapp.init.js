const { ipcRenderer } = require('electron');
const Mousetrap = require('mousetrap');
window.onclick = function(e) {
    if (e.target.tagName == "A") {
        ipcRenderer.send('linkOpen', e.target.href);
    }
}

/* Mac Copy/Paste Fix */
Mousetrap.bind(['command+c', 'ctrl+c'], function(e) {
    document.execCommand('copy');
});
Mousetrap.bind(['command+v', 'ctrl+v'], function(e) {
    document.execCommand('paste');
});
Mousetrap.bind(['command+x', 'ctrl+x'], function(e) {
    document.execCommand('cut');
});
Mousetrap.bind(['command+a', 'ctrl+a'], function(e) {
    document.execCommand('selectAll');
});