const {
    remote,
    ipcRenderer
} = require('electron');

document.getElementById('altus-version').innerHTML = remote.app.getVersion();

document.getElementById('exit').addEventListener('click', function(e) {
    e.preventDefault();
    remote.getCurrentWindow().close();
});

document.querySelectorAll('.website-link').forEach(function(item) {

    item.addEventListener('click', function(e) {
        e.preventDefault();
        ipcRenderer.send('linkOpen', item.href);
    });
});