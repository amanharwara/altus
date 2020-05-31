module.exports = {
  /**
   * Checks if given chat has new messages
   * @param {Chat} chat Chat object
   */
  hasUndreadMessages(chat) {
    return chat.unreadCount > 0;
  }
}