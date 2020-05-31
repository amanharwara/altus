module.exports = {
  /**
   * Sets current user status
   * @param {string} status
   */
  setMyStatus(status) {
    return Store.MyStatus.setMyStatus(status);
  }
}