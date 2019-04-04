function tabElement(tab) {
    return `<a class="item tab-element" id="tab-${tab.id}" data-tab="${tab.id}">
                <i class="whatsapp icon"></i> <span>${tab.name}</span> <i class="cog icon ui"></i> <i class="close icon ui"></i>
            </a>`;
}

function instanceElement(tab) {
    return `<div class="ui bottom attached tab segment" id="tab-content-${tab.id}" data-tab="${tab.id}">
    <webview preload="./js/whatsapp.js" id="whatsapp-${tab.id}" src="https://web.whatsapp.com/" useragent="${window.navigator.userAgent.replace(/(altus|Electron)([^\s]+\s)/g, '')}" partition="persist:${tab.id}"></webview>
</div>`;
}

function settingsModalElement(tab) {
    return `<div class="ui mini modal settings-modal-${tab.id}">
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
                        <div class="ui field">
                            <label>Theme</label>
                            <div class="ui selection dropdown ${tab.id}-theme-value">
                                <input type="hidden" name="theme">
                                <i class="dropdown icon"></i>
                                <div class="default text">Theme</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="actions">
                    <div class="ui positive button">EDIT</div>
                </div>
            </div>`;
}

module.exports = {
    tabElement,
    instanceElement,
    settingsModalElement
}