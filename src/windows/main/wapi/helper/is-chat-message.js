module.exports = {
  /**
   * @returns true if is a chat messae, false otherwise
   * @param {Message} message
   */
  isChatMessage(message) {
    if (message.isSentByMe) {
      return false;
    }
    if (message.isNotification) {
      return false;
    }
    if (!message.isUserCreatedType) {
      return false;
    }
    return true;
  }
}