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
const HTML = require('../assets/js/elementCodes.js');

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

let themes = new Store({
    name: 'themes'
});

function loadTabsFromStorage() {

    let storedTabs = tabs.get('instances');
    if (storedTabs.length == 0) {
        document.querySelector('.no-tabs').style.display = 'flex';
    } else {
        storedTabs.forEach(tab => {
            addNewInstance(tab);
        });

        document.querySelector('.menu').firstElementChild.classList.add('active');
        document.querySelector('.menu').firstElementChild.click();

        document.querySelectorAll('.menu .item > .close.icon.ui').forEach(e => {
            e.addEventListener('click', () => {
                let id = e.parentElement.getAttribute('data-tab');

                let tabsStore = tabs.get('instances');
                let newTabs = tabsStore.filter(tab => tab.id !== id);

                tabs.set('instances', newTabs);

                document.getElementById(`tab-content-${id}`).remove();
                e.parentElement.remove();

                checkForInstances();
            });
        });
    }

    setWebViewSettingsLoop();
}

$('.ui.modal')
    .modal({
        onApprove: () => {
            let instanceNameValue = document.querySelector('#new-instance-name').value;
            let instanceNotificationsValue = $('.notifcheck').checkbox('is checked');
            let instanceSoundValue = $('.soundcheck').checkbox('is checked');
            let instanceThemeValue = $('.themecheck').dropdown('get value');

            if (instanceNameValue == '') {
                document.querySelector('#new-instance-name').parentElement.classList.add('error');
                return false;
            } else {
                let newInstance = {
                    name: instanceNameValue,
                    id: generateId(),
                    settings: {
                        notifications: instanceNotificationsValue,
                        sound: instanceSoundValue,
                        theme: instanceThemeValue
                    }
                };

                let tabsStore = tabs.get('instances');
                tabsStore.push(newInstance);

                tabs.set('instances', tabsStore);

                addNewInstance(newInstance);
                $('.tab-element.active').removeClass('active');
                $(`#tab-${newInstance.id}`).addClass('active');
                $(`#tab-${newInstance.id}`).click();
            }

        }
    })
    .modal('attach events', '.add-tab-icon', 'show');

$('.ui.checkbox')
    .checkbox();

loadTabsFromStorage();

function generateThemeNames() {
    let nameList = [];

    if (themes.get('themes') && themes.get('themes').length > 0) {
        themes.get('themes').forEach(theme => {
            let name = theme.name;
            let value = theme.name;

            let themeJSON = {
                name: name,
                value: value
            }

            nameList.push(themeJSON);
        });
    } else {
        window.location.reload();
    }

    return nameList;
}

$('.dropdown').dropdown();
$('.dropdown').dropdown({
    values: generateThemeNames()
});

function generateThemeCSS(name) {
    let themesList = themes.get('themes');
    let selectedTheme = themesList.find(x => x.name === name);
    return selectedTheme.css;
}

function setWebViewSettings(webviewElement, tab) {
    webviewElement.addEventListener('dom-ready', () => {
        if (tab.settings.sound == true) {
            webviewElement.setAudioMuted(false);
        } else {
            webviewElement.setAudioMuted(true);
        }

        webviewElement.executeJavaScript(`
                        var styleElem = document.querySelector('#whatsapp-style');
                        if (styleElem) {
                            styleElem.innerHTML = \`${generateThemeCSS(tab.settings.theme)}\`;
                        } else if (!styleElem) {
                            var styleElement = document.createElement('style');
                            styleElement.id = 'whatsapp-style';
                            styleElement.innerHTML = \`${generateThemeCSS(tab.settings.theme)}\`;
                            document.head.appendChild(styleElement);
                        }`);

        var notify;
        if (tab.settings.notifications == true) {
            notify = 'new _Notification(title, options)';
        } else {
            notify = 'undefined';
        }
        webviewElement.executeJavaScript(`
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

function setWebViewSettingsLoop() {
    document.querySelectorAll('.tab').forEach(tabElement => {
        let tabID = tabElement.id.replace('tab-content-', '');
        let tabJSON = tabs.get('instances').find(x => x.id === tabID);
        let webviewElement = document.querySelector(`#${tabElement.id}`).querySelector('webview');

        $(`.${tabID}-theme-value`).dropdown('set selected', tabJSON.settings.theme);
        $(`.${tabID}-theme-value`).dropdown();

        setWebViewSettings(webviewElement, tabJSON);
    });
}

function checkForInstances() {
    let instances = tabs.get('instances');

    if (instances.length == 0 || instances == null || instances == undefined) {
        document.querySelector('.no-tabs').style.display = 'flex';
    } else {
        document.querySelector('.no-tabs').style.display = 'none';
        document.querySelector('.menu').firstElementChild.classList.add('active');
        document.querySelector('.menu').firstElementChild.click();
    }
}

function addNewInstance(instance) {
    let tab = instance;
    let tabElementCode = HTML.tabElement(tab);
    let instanceElementCode = HTML.instanceElement(tab);
    let settingsModalCode = HTML.settingsModalElement(tab);
    let range = document.createRange();
    let tabElement = range.createContextualFragment(tabElementCode);
    let instanceElement = range.createContextualFragment(instanceElementCode);
    let settingsModal = range.createContextualFragment(settingsModalCode);
    document.querySelector('.tabs').insertBefore(tabElement, document.querySelector('.add-tab-icon'));
    document.querySelector('.tab-contents').appendChild(instanceElement);
    document.querySelector('.modals-div').appendChild(settingsModal);

    $(`#tab-${tab.id}`).tab();

    $(`.settings-modal-${tab.id}`)
        .modal({
            onApprove: () => {
                let editedInstance = {
                    name: $(`#${tab.id}-name`).val(),
                    id: `${tab.id}`,
                    settings: {
                        notifications: $(`.${tab.id}-notifications-value`).checkbox('is checked'),
                        sound: $(`.${tab.id}-sound-value`).checkbox('is checked'),
                        theme: $(`.${tab.id}-theme-value`).dropdown('get value')
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

    document.querySelectorAll('.menu .item > .close.icon.ui').forEach(e => {
        e.addEventListener('click', () => {
            let id = e.parentElement.getAttribute('data-tab');

            let tabsStore = tabs.get('instances');
            let newTabs = tabsStore.filter(tab => tab.id !== id);

            tabs.set('instances', newTabs);

            document.getElementById(`tab-content-${id}`).remove();
            e.parentElement.remove();

            checkForInstances();
        });
    });

    $('.dropdown').dropdown();
    $('.dropdown').dropdown({
        values: generateThemeNames()
    });

    setWebViewSettingsLoop();
}

ipcRenderer.on('new-themes-added', e => window.location.reload(true));

// Setting title explicitly
mainTitlebar.updateTitle(`Altus ${app.getVersion()}`);