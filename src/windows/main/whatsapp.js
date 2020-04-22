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

    // Message Indicator
    // Using MutationObserver to check for changes in the title of the WhatsApp page and sending an IPC message to the main process
    new MutationObserver(function (mutations) {
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

    // Mouse wheel event listener for zoom
    document.body.addEventListener('wheel', e => {
        // Mouse wheel delta value. (+1 when scroll up | -1 when scroll down)
        const delta = Math.sign(e.deltaY);

        if (e.ctrlKey) {
            switch (delta) {
                case -1:
                    ipcRenderer.send('zoom-in');
                    break;

                case +1:
                    ipcRenderer.send('zoom-out');
                    break;

                default:
                    break;
            }
        }
    });

    // Open links in external browser
    document.body.addEventListener('click', e => {
        if (e.target.tagName === 'A') {
            ipcRenderer.send('link-open', e.target.href);
        }
    });
}