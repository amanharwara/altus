module.exports = {
  /**
   * Loads all earlier messages of given chat id
   * @param {string} id Chat id
   * @param {Funciton} done Optional callback
   */
  async loadAllEarlierMessages(id, done) {
    const found = WAPI.getChat(id);
    while (!found.msgs.msgLoadState.noEarlierMsgs) {
      console.log('Loading...');
      await found.loadEarlierMsgs();
    }
    console.log('done');
    return true;
  },

  /**
   * SYNC version
   * Loads all earlier messages of given chat id
   * @param {string} id Chat id
   * @param {Funciton} done Optional callback
   */
  asyncLoadAllEarlierMessages(id, done) {
    loadAllEarlierMessages(id);
    done();
  }
}