const {
  getAllChatsWithNewMessages
} = require('./get-chats-with-new-messages');

module.exports = {
  /**
   * Retrieves all new messages
   * TODO: Test, seems to be written incorrectly
   */
  getAllNewMessages() {
    const _newMessages = JSON.stringify(
      getAllChatsWithNewMessages()
      .map((c) => WAPI.getChat(c.id._serialized))
      .map((c) => c.msgs._models.filter((x) => x.isNewMsg)) || []
    );

    return JSON.parse(_newMessages);
  }
}