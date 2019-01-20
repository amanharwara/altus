const {
    remote
} = require('electron');
const Mousetrap = require('mousetrap');

// Fix for "WhatsApp works with Chrome 36+" issue . DO NOT REMOVE
var ses = remote.session.defaultSession;

ses.flushStorageData();
ses.clearStorageData({
    storages: ['appcache', 'serviceworkers', 'cachestorage', 'websql', 'indexdb'],
});

window.navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
        registration.unregister();
    }
});

window.onload = () => {
    const titleEl = document.querySelector('.window-title');
    if (titleEl && titleEl.innerHTML.includes('Google Chrome 36+')) {
        window.location.reload();
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