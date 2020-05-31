module.exports = {
  /**
   * Fetches all chat objects from store
   * @param done Callback (optional)
   * @returns {Chat[]} Array of chat objects
   */
  getAllChats(done) {
    const chats = window.Store.Chat.map((chat) => WAPI._serializeChatObj(chat));

    if (done !== undefined) done(chats);
    return chats;
  }
}