module.exports = {
  /**
   * Returns an object with all of your host device details
   */
  getHost() {
    return Store.Me.attributes;
  }
}