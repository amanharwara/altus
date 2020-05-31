module.exports = {
  /**
   * Revokes group invite link
   * @param {string} chatId
   */
  async revokeGroupInviteLink(chatId) {
    var chat = Store.Chat.get(chatId);
    if (!chat.isGroup) return false;
    await Store.GroupInvite.revokeGroupInvite(chat);
    return true;
  }
}