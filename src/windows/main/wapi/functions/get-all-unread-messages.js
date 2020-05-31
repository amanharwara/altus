const {
  getAllChatsWithNewMessages
} = require('./get-chats-with-new-messages');

module.exports = {
  /**
   * Retrieves undread messages
   * x.ack === -1
   * TODO: Test this fn, seems incorrect, should not be async
   */
  getAllUnreadMessages() {
    const _partials = JSON.stringify(
      getAllChatsWithNewMessages()
      .map((c) => WAPI.getChat(c.id._serialized))
      .map((c) => c.msgs._models.filter((x) => x.ack === -1))
      .flatMap((x) => x) || []
    );

    const partials = JSON.parse(_partials);
    return partials;
  }
}