module.exports = {
  /**
   * Clears chat messages
   * @param {string} id Chat id
   */
  async clearChat(id) {
    return await Store.ChatUtil.sendClear(Store.Chat.get(id), true);
  }
}