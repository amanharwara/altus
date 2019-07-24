const {
    remote
} = require('electron');
const {
    ipcRenderer
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
    const titleEl = document.querySelector('.landing-title');
    if (titleEl && titleEl.innerHTML.includes('Google Chrome 49+')) {
        window.location.reload();
    }

    new MutationObserver(function(mutations) {
        let title = mutations[0].target.innerText;
        let tabID = document.querySelector('*[id*="whatsapp-style"]').id.replace('whatsapp-style-', '');
        let titleRegEx = /([0-9]+)/;
        let number = titleRegEx.exec(title) ? (parseInt(titleRegEx.exec(title)[0]) !== 0 && parseInt(titleRegEx.exec(title)[0]) !== undefined && parseInt(titleRegEx.exec(title)[0]) !== null) ? parseInt(titleRegEx.exec(title)[0]) : null : null;
        ipcRenderer.send('message-indicator', {
            title,
            tabID,
            number
        });
    }).observe(
        document.querySelector('title'), {
            subtree: true,
            childList: true,
            characterData: true
        }
    );

    /* Zoom Functionality */
    // Default page zoom level to 100%;
    document.documentElement.style.zoom = "100%";
    Mousetrap.bind(['command+plus', 'ctrl+plus'], e => {
        let currentZoomLevel = parseInt(document.documentElement.style.zoom.replace("%", ''));
        document.documentElement.style.zoom = `${currentZoomLevel+10}%`;
        let tabID = document.querySelector('*[id*="whatsapp-style"]').id.replace('whatsapp-style-', '');
        ipcRenderer.send('zoom', {
            type: 'in',
            level: parseInt(currentZoomLevel + 10),
            tabID: tabID
        });
    });
    Mousetrap.bind(['command+-', 'ctrl+-'], e => {
        let currentZoomLevel = parseInt(document.documentElement.style.zoom.replace("%", ''));
        document.documentElement.style.zoom = `${currentZoomLevel-10}%`;
        let tabID = document.querySelector('*[id*="whatsapp-style"]').id.replace('whatsapp-style-', '');
        ipcRenderer.send('zoom', {
            type: 'out',
            level: parseInt(currentZoomLevel - 10),
            tabID: tabID
        });
    });
}

document.addEventListener('click', e => {
    if (e.target.tagName == "A") {
        ipcRenderer.send('link-open', e.target.href);
    }
});
