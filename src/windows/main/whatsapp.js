const {
    remote,
    ipcRenderer
} = require('electron');

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
    const titleEl = document.querySelector('.landing-title');
    if (titleEl && titleEl.innerHTML.includes('Google Chrome 49+')) {
        window.location.reload();
    }

    new MutationObserver(function(mutations) {
        let title = mutations[0].target.innerText;
        let titleRegEx = /([0-9]+)/;
        let number = titleRegEx.exec(title) ? (parseInt(titleRegEx.exec(title)[0]) !== 0 && parseInt(titleRegEx.exec(title)[0]) !== undefined && parseInt(titleRegEx.exec(title)[0]) !== null) ? parseInt(titleRegEx.exec(title)[0]) : null : null;
        ipcRenderer.send('message-indicator', number);
    }).observe(
        document.querySelector('title'), {
            subtree: true,
            childList: true,
            characterData: true
        }
    );
}