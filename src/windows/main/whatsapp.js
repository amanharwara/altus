const {
    remote,
    ipcRenderer
} = require('electron');

const {
    getAPI
} = require('./wapi');

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

    window.Notification = '';

    new MutationObserver(mutations => {
        // Check when WhatsApp is done loading
        if (mutations[0].removedNodes && mutations[0].removedNodes[0].id === 'startup') {
            getAPI();
            // Custom Notification
            window.WAPI.waitNewMessages(false, (message) => {
                let wID = document.querySelector('style[id^="whatsapp-style"]').id.replace('whatsapp-style-', '');
                if (window.NotificationSetting) {
                    if (!document.hasFocus()) {
                        ipcRenderer.send('new-message', {
                            message,
                            wID
                        });
                    }
                } else {
                    console.log("Notifications are turned OFF");
                }
            });
            // Online Marker Styling
            let mStyle = document.createElement('style');
            mStyle.innerHTML = `
            .is-online {
                overflow: visible; 
            }
            .is-online::after {
                content: '';
                width: 1rem;
                height: 1rem;
                display: inline-block;
                background: #07bc4c;
                border-radius: 50%;
                margin-left: 0.25rem;
                z-index: 200;
                position: absolute;
                top: 60%;
                left: 1%;
            }`;
            document.head.appendChild(mStyle);
            // Online Status
            window.WAPI.getAllChats(chats => {
                // Get all chats
                let allChatIDs = chats.map(chat => chat.id._serialized);
                // Subscribe to all chats' presence update
                allChatIDs.forEach(id => window.WAPI.getChat(id).presence.subscribe());
                // Presence Updates
                window.presenceInterval = setInterval(() => {
                    allChatIDs.forEach(id => {
                        let el = getChatElement(id);
                        let chat = window.WAPI.getChat(id);
                        let isOnline = chat.presence.isOnline;
                        if (isOnline) {
                            el.classList.add('is-online');
                        } else {
                            el.classList.remove('is-online');
                        }
                    });
                }, 2000);
            });
        }
    }).observe(document.querySelector('#app'), {
        subtree: true,
        childList: true
    });
}

ipcRenderer.on('open-chat', (e, id) => {
    let ocAPI = new window.Store.OpenChat();
    ocAPI.openChat(id);
});

function getChatElement(id) {
    let chatElement;
    document.querySelectorAll('#pane-side>*>*>*>*').forEach(chatEl => {
        let elID = chatEl[Object.keys(chatEl).filter(k => /Event/.test(k))[0]].children.props.contact.id._serialized;
        if (id === elID) {
            chatElement = chatEl;
        }
    });
    return chatElement;
}