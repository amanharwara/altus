module.exports = {
  /**
   * Retrieves satus
   * @param {string} to '000000000000@c.us'
   *
   * TODO: Test this function
   */
  async getStatus(id) {
    return await Store.MyStatus.getStatus(id);
  }
}