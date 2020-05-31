const {
  hasUndreadMessages
} = require('./has-unread-messages');

module.exports = {
  /**
   * Retrieves chats with undread/new messages
   * @param {*} done
   * @returns {Chat[]} chat list
   */
  getAllChatsWithNewMessages(done) {
    const chats = window.Store.Chat.filter(hasUndreadMessages).map((chat) =>
      WAPI._serializeChatObj(chat)
    );

    if (done !== undefined) done(chats);
    return chats;
  }
}