module.exports = {
  /**
   * Loads earlier chat messages from server
   * @param {string} id Chat id
   * @param {Function} done Optional callback
   */
  loadChatEarlierMessages(id, done) {
    const found = WAPI.getChat(id);
    if (done !== undefined) {
      found.loadEarlierMsgs().then(function () {
        done();
      });
    } else {
      found.loadEarlierMsgs();
    }
  }
}