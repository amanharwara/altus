module.exports = {
  /**
   * Registers a callback to be called when a the acknowledgement state of a message changes.
   * @param callback - function - Callback function to be called when a message acknowledgement changes.
   * @returns {boolean}
   */
  addOnNewAcks() {
    window.WAPI.waitNewAcknowledgements = function (callback) {
      Store.Msg.on('change:ack', callback);
      return true;
    };
  }
}