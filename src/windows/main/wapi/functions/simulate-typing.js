module.exports = {
  /**
   * Starts typing
   * @param {string} chatId
   */
  async startTyping(chatId) {
    await Store.ChatStates.sendChatStateComposing(chatId);
  },

  /**
   * Stops typing
   * @param {string} chatId
   */
  async stopTyping(chatId) {
    await Store.ChatStates.sendChatStatePaused(chatId);
  }
}