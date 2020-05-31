function getActiveChat() {
    return window.WAPI.getAllChatIds().map(id => window.WAPI.getChat(id)).find(chat => chat.active)
}

module.exports = {
    getActiveChat
}