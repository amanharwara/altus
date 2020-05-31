module.exports = {
  /**
   * Fetches all chat IDs from store
   * @param done Callback (optional)
   * @returns {string[]} List of chat id's
   */
  getAllChatIds(done) {
    const chatIds = window.Store.Chat.map(
      (chat) => chat.id._serialized || chat.id
    );

    if (done !== undefined) done(chatIds);
    return chatIds;
  }
}