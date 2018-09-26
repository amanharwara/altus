const { ipcRenderer } = require('electron');

var _Notification = window.Notification;
var ProxyNotification = function(title, options) {
    var _notification = new _Notification(title, options);
    this.title = _notification.title;
    this.dir = _notification.dir;
    this.lang = _notification.lang;
    this.body = _notification.body;
    this.tag = _notification.tag;
    this.icon = _notification.icon;
    var that = this;
    _notification.onclick = function(event) {
        if (that.onclick != undefined) that.onclick(event);
    };
    _notification.onshow = function(event) {
        if (that.onshow != undefined) that.onshow(event);
    };
    _notification.onerror = function(event) {
        if (that.onerror != undefined) that.onerror(event);
    };
    _notification.onclose = function(event) {
        if (that.onclose != undefined) that.onclose(event);
    };
    this.close = function() {
        _notification.close();
    };
    this.addEventListener = function(type, listener, useCapture) {
        _notification.addEventListener(type, listener, useCapture);
    };
    this.removeEventListener = function(type, listener, useCapture) {
        _notification.removeEventListener(type, listener, useCapture);
    };
    this.dispatchEvent = function(event) {
        _notification.dispatchEvent(event);
    };
}

ProxyNotification.permission = _Notification.permission;
ProxyNotification.requestPermission = _Notification.requestPermission;
window.Notification = ProxyNotification;

window.onclick = function(e) {
    if (e.target.tagName == "A") {
        ipcRenderer.send('linkOpen', e.target.href);
    }
}