const fs = require('fs');
const fetch = require('node-fetch');
const webview = document.querySelector('webview');
const {
    ipcRenderer
} = require('electron');
const url = require("url");
const path = require('path');

var themePref, persistThemePref, notificationPref, messagePreviewPref, soundPref, trayPref;

function getSetPrefs() {
    if (localStorage.getItem('theme-preference')) {
        themePref = localStorage.getItem('theme-preference');
    } else {
        localStorage.setItem('theme-preference', JSON.stringify({
            name: 'default-theme',
            css: ''
        }));
    }

    if (localStorage.getItem('toggle-tray-preference')) {
        trayPref = localStorage.getItem('toggle-tray-preference');
    } else {
        localStorage.setItem('toggle-tray-preference', true);
    }

    if (localStorage.getItem('persist-theme-preference')) {
        persistThemePref = localStorage.getItem('persist-theme-preference');
    } else {
        localStorage.setItem('persist-theme-preference', true);
    }

    if (localStorage.getItem('toggle-notifications-preference')) {
        notificationPref = localStorage.getItem('toggle-notifications-preference');
    } else {
        localStorage.setItem('toggle-notifications-preference', true);
    }

    if (localStorage.getItem('toggle-message-preview-preference')) {
        messagePreviewPref = localStorage.getItem('toggle-message-preview-preference');
    } else {
        localStorage.setItem('toggle-message-preview-preference', true);
    }

    if (localStorage.getItem('toggle-sound-preference')) {
        soundPref = localStorage.getItem('toggle-sound-preference');
    } else {
        localStorage.setItem('toggle-sound-preference', true);
    }
}

getSetPrefs();

ipcRenderer.on('sendPreferencesBool', function(e, bool) {
    if (bool) {
        ipcRenderer.send('preferences', {
            theme: JSON.parse(localStorage.getItem('theme-preference')),
            persistTheme: JSON.parse(localStorage.getItem('persist-theme-preference')),
            toggleNotifications: JSON.parse(localStorage.getItem('toggle-notifications-preference')),
            toggleMessagePreview: JSON.parse(localStorage.getItem('toggle-message-preview-preference')),
            toggleSound: JSON.parse(localStorage.getItem('toggle-sound-preference')),
            toggleTray: JSON.parse(localStorage.getItem('toggle-tray-preference'))
        });
    }
});

ipcRenderer.on('notification-process-1', function(e, notification) {
    var notifications = localStorage.getItem('toggle-notifications-preference');
    var messagePreview = localStorage.getItem('toggle-message-preview-preference');
    if (notifications == "true") {
        ipcRenderer.send('notification', {
            title: notification.title,
            body: messagePreview == "true" ? notification.body : "New Message",
            icon: notification.icon
        });
    }
});

ipcRenderer.on('settingsChanged', function(e, f) {
    window.location.reload(true);
});

ipcRenderer.on('muteSound', function(e, muted) {
    webview.setAudioMuted(!muted);
});

ipcRenderer.on('theme:change', function(event, data) {
    if (data.name == "dark-theme") {
        var darkTheme;
        fetch('https://raw.githubusercontent.com/ShadyThGod/shadythgod.github.io/master/css/altus-dark-theme.css')
            .then(res => res.text())
            .then(function(body) {
                darkTheme = body;
                webview.executeJavaScript(`
                        var styleElem = document.querySelector("#whatsappStyle");
                        if (styleElem) {
                            styleElem.innerHTML = \`${darkTheme}\`;
                        } else if (!styleElem) {
                            var styleElement = document.createElement('style');
                            styleElement.id = 'whatsappStyle';
                            styleElement.innerHTML = \`${darkTheme}\`;
                            document.head.appendChild(styleElement);
                        }`);
                localStorage.setItem('theme-preference', JSON.stringify({
                    name: 'dark-theme',
                    css: darkTheme
                }));
            });
    } else if (data.name == 'default-theme') {
        webview.executeJavaScript(`
                var styleElem = document.querySelector("#whatsappStyle");
                if (styleElem) {
                    styleElem.parentNode.removeChild(styleElem);
                }
                `);
        localStorage.setItem('theme-preference', JSON.stringify({
            name: 'default-theme',
            css: ''
        }));
    } else if (data.name !== 'default-theme' && data.name !== 'dark-theme') {
        webview.executeJavaScript(`
                var styleElem = document.querySelector('#whatsappStyle');
                if (styleElem) {
                    styleElem.innerHTML = \`${data.css}\`;
                } else if (!styleElem) {
                    var styleElement = document.createElement('style'); 
                    styleElement.id = 'whatsappStyle'; 
                    styleElement.innerHTML = \`${data.css}\`;
                    document.head.appendChild(styleElement);
                }
                `);
        localStorage.setItem('theme-preference', JSON.stringify({
            name: data.name,
            css: data.css
        }));
    }
});

webview.addEventListener('dom-ready', function() {
    console.log(notificationPref);
    var notify;
    if (notificationPref == true || notificationPref == "true") {
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