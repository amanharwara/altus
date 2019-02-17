const customTitlebar = require('custom-electron-titlebar');
const {
    app,
    process
} = require('electron').remote;
const {
    ipcRenderer
} = require('electron');
const Store = require('electron-store');
const generateId = require('uuid/v4');

// Create main window titlebar
const mainTitlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#21252B'),
    icon: '../assets/icons/icon.ico',
    itemBackgroundColor: customTitlebar.Color.fromHex('#3d444e'),
});

let tabs = new Store({
    name: 'tabs',
    defaults: {
        instances: []
    }
});

function loadTabsFromStorage() {
    let storedTabs = tabs.get('instances');
    if (storedTabs.length == 0) {
        document.querySelector('.no-tabs').style.display = 'flex';
    } else {
        storedTabs.forEach(tab => {
            let tabElementCode = `<a class="item" id="tab-${tab.id}" data-tab="${tab.id}">
                <i class="whatsapp icon"></i> ${tab.name} <i class="cog icon ui"></i> <i class="close icon ui"></i>
            </a>`;
            let instanceElementCode = `<div class="ui bottom attached tab segment" id="${tab.id}" data-tab="${tab.id}">
    <webview preload="./js/whatsapp.js" id="whatsapp-${tab.id}" src="https://web.whatsapp.com/" useragent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36" partition="persist:${tab.id}"></webview>
</div>`;
            let settingsModalCode = `<div class="ui mini modal settings-modal-${tab.id}">
                <i class="close icon"></i>
                <div class="header">
                    Edit Settings for "${tab.name}"
                </div>
                <div class="content">
                    <div class="ui form">
                        <div class="ui field">
                            <label>Name</label>
                            <input type="text" placeholder="Name of instance" id="${tab.id}-name" value="${tab.name}">
                        </div>
                        <div class="ui inline field">
                            <div class="ui toggle checkbox ${tab.id}-notifications-value">
                                <label>Enable Notifications</label>
                                <input type="checkbox" tabindex="0" class="hidden">
                            </div>
                        </div>
                        <div class="ui inline field">
                            <div class="ui toggle checkbox ${tab.id}-sound-value">
                                <label>Enable Sound</label>
                                <input type="checkbox" tabindex="0" class="hidden">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="actions">
                    <div class="ui positive button">EDIT</div>
                </div>
            </div>`;

            let range = document.createRange();
            let tabElement = range.createContextualFragment(tabElementCode);
            let instanceElement = range.createContextualFragment(instanceElementCode);
            let settingsModal = range.createContextualFragment(settingsModalCode);

            document.querySelector('.tabs').insertBefore(tabElement, document.querySelector('.add-tab-icon'));
            document.querySelector('.tab-contents').appendChild(instanceElement);
            document.querySelector('.modals-div').appendChild(settingsModal);

            $('.menu .item')
                .tab({
                    onFirstLoad: () => {
                        let webview = document.querySelector(`#${tab.id}`).querySelector('webview');
                        webview.addEventListener('dom-ready', () => {
                            if (tab.settings.sound == true) {
                                webview.setAudioMuted(false);
                            } else {
                                webview.setAudioMuted(true);
                            }

                            var notify;
                            if (tab.settings.notifications == true) {
                                notify = 'new _Notification(title, options)';
                            } else {
                                notify = 'undefined';
                            }
                            webview.executeJavaScript(`
var _Notification = window.Notification;
var ProxyNotification = function (title, options) {
    var _notification = ${notify};
    this.title = _notification.title;
    this.dir = _notification.dir;
    this.lang = _notification.lang;
    this.body = _notification.body;
    this.tag = _notification.tag;
    this.icon = _notification.icon;
    var that = this;
    _notification.onclick = function (event) {
        if (that.onclick != undefined) that.onclick(event);
    };
    _notification.onshow = function (event) {
        if (that.onshow != undefined) that.onshow(event);
    };
    _notification.onerror = function (event) {
        if (that.onerror != undefined) that.onerror(event);
    };
    _notification.onclose = function (event) {
        if (that.onclose != undefined) that.onclose(event);
    };
    this.close = function () {
        _notification.close();
    };
    this.addEventListener = function (type, listener, useCapture) {
        _notification.addEventListener(type, listener, useCapture);
    };
    this.removeEventListener = function (type, listener, useCapture) {
        _notification.removeEventListener(type, listener, useCapture);
    };
    this.dispatchEvent = function (event) {
        _notification.dispatchEvent(event);
    };
}
ProxyNotification.permission = _Notification.permission;
ProxyNotification.requestPermission = _Notification.requestPermission;
window.Notification = ProxyNotification;
`);
                        });
                    }
                });

            $(`.settings-modal-${tab.id}`)
                .modal({
                    onApprove: () => {
                        let editedInstance = {
                            name: $(`#${tab.id}-name`).val(),
                            id: `${tab.id}`,
                            settings: {
                                notifications: $(`.${tab.id}-notifications-value`).checkbox('is checked'),
                                sound: $(`.${tab.id}-sound-value`).checkbox('is checked')
                            }
                        }
                        let tabsStore = tabs.get('instances');
                        let findTab = tabsStore.find(x => x.id === tab.id);
                        let newTabIndex = tabsStore.indexOf(findTab);
                        tabsStore[newTabIndex] = editedInstance;
                        tabs.set('instances', tabsStore);
                        window.location.reload();
                    }
                })
                .modal('attach events', `#tab-${tab.id} .cog.icon`, 'show');

            if (tab.settings.notifications == true) {
                $(`.${tab.id}-notifications-value`).checkbox('check');
            } else {
                $(`.${tab.id}-notifications-value`).checkbox('uncheck');
            }

            if (tab.settings.sound == true) {
                $(`.${tab.id}-sound-value`).checkbox('check');
            } else {
                $(`.${tab.id}-sound-value`).checkbox('uncheck');
            }
        });

        document.querySelector('.menu').firstElementChild.classList.add('active');
        document.querySelector('.menu').firstElementChild.click();

        document.querySelectorAll('.menu .item > .close.icon.ui').forEach(e => {
            e.addEventListener('click', () => {
                let id = e.parentElement.getAttribute('data-tab');

                let tabsStore = tabs.get('instances');
                let newTabs = tabsStore.filter(tab => tab.id !== id);

                tabs.set('instances', newTabs);

                window.location.reload();
            });
        });
    }
}

$('.ui.modal')
    .modal({
        onApprove: () => {
            let instanceNameValue = document.querySelector('#new-instance-name').value;
            let instanceNotificationsValue = $('.notifcheck').checkbox('is checked');
            let instanceSoundValue = $('.soundcheck').checkbox('is checked');

            let newInstance = {
                name: instanceNameValue,
                id: generateId(),
                settings: {
                    notifications: instanceNotificationsValue,
                    sound: instanceSoundValue
                }
            };

            let tabsStore = tabs.get('instances');
            tabsStore.push(newInstance);

            tabs.set('instances', tabsStore);

            window.location.reload();
        }
    })
    .modal('attach events', '.add-tab-icon', 'show');

$('.ui.checkbox')
    .checkbox();

loadTabsFromStorage();

ipcRenderer.on('settings-changed', e => window.location.reload(true));

// Setting title explicitly
mainTitlebar.updateTitle(`Altus ${app.getVersion()}`);