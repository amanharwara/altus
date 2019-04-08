const {
    remote
} = require('electron');
const {
    ipcRenderer
} = require('electron');
const Mousetrap = require('mousetrap');
const dialog = require('../../assets/js/generateSaveDialog.js');
const blobToBase64 = require('../../assets/js/blobToBase64.js');
const HTML = require('../../assets/js/elementCodes.js')

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

    //Downloads Issue Fix
    //Define Mutation Observer for Context Menu
    let contextMenuObserver = new MutationObserver(function(mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type == 'childList') {
                if (mutation.addedNodes[0] !== undefined) {
                    //Checks if the context menu has been changed.
                    if (mutation.addedNodes[0].classList.contains('_1RQfk')) {
                        //Checks if download button exists
                        if (document.querySelector('.Pm0Ov._34D8D._1dl8f[title="Download"]')) {
                            //Defining src variable which will be later assigned
                            let src;
                            //Checks if the hover menu selector icon exists
                            if (document.querySelector('._1UyGF')) {
                                //Goes two levels up from the hover menu selector icon
                                let parent = document.querySelector('._1UyGF').parentElement.parentElement;
                                //Define audioElement and imageElement variables
                                let audioElement, imageElement;
                                // Check if image and get source
                                if (parent.querySelector('img._1JVSX')) {
                                    //Gets the image element and assign it to imageElement variable
                                    imageElement = parent.querySelector('img._1JVSX');
                                    //Gets the image objectURL from the image element
                                    src = imageElement.src;
                                } else if (parent.querySelector('._1sLSi audio')) {
                                    //Check if audio and get source
                                    audioElement = parent.querySelector('._1sLSi audio');
                                    src = audioElement.src;
                                }
                            }
                            //Remove the original Download button
                            document.querySelector('.Pm0Ov._34D8D._1dl8f[title="Download"]').remove();
                            //Create custom Download button
                            let downloadButtonHTML = HTML.downloadButtonElement(src);
                            let range = document.createRange();
                            let downloadButton = range.createContextualFragment(downloadButtonHTML);
                            document.querySelector('._2imug').appendChild(downloadButton);
                            //Listen to click events on the Download button
                            document.querySelector('.Pm0Ov._34D8D._1dl8f[title="Download"]').addEventListener('click', async e => {
                                //Defining blob variable which will be assigned later
                                let blob;
                                //Create a Blob() object from objectURL i.e src and then assign it to blob variable
                                await fetch(document.querySelector('.Pm0Ov._34D8D._1dl8f[title="Download"]').getAttribute('data-src')).then(r => r.blob()).then(b => blob = b);
                                //Convert blob to base64 and assign it to blobBase64 variable
                                let blobBase64 = blobToBase64.convert(blob, (blob, blobBase64) => {
                                    //Show save dialog
                                    dialog.show(blob, blobBase64);
                                });
                            });
                            //Hover listeners (non-functional, only for looks)
                            document.querySelector('.download-button').addEventListener('mouseenter', e => {
                                document.querySelector('.download-button').classList.add('_1exov');
                            });
                            document.querySelector('.download-button').addEventListener('mouseleave', e => {
                                document.querySelector('.download-button').classList.remove('_1exov');
                            });
                        }
                    }
                }
            }
        }
    });

    //Start observing the '.app-wrapper-web' for changes
    contextMenuObserver.observe(document.querySelector('.app-wrapper-web'), {
        childList: true,
        subtree: true
    })
}

document.addEventListener('click', e => {
    if (e.target.tagName == "A") {
        ipcRenderer.send('link-open', e.target.href);
    }
});

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