module.exports = {
  /**
   * Retrieves all groups
   * @param {Function} done callback
   * @returns {Array} List of chats
   */
  getAllGroups(done) {
    const groups = window.Store.Chat.filter((chat) => chat.isGroup);

    if (done !== undefined) done(groups);
    return groups;
  }
}