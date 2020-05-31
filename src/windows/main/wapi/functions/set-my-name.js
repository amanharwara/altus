module.exports = {
  /**
   * Sets current user profile name
   * @param {string} name
   */
  async setMyName(name) {
    if (!Store.Versions.default[11].BinaryProtocol) {
      Store.Versions.default[11].BinaryProtocol = new Store.bp(11);
    }
    return await Store.Versions.default[11].setPushname(name);
  }
}