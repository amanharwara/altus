module.exports = {
  /**
   * @returns Url of the chat picture.
   * @param {string} id Chat id
   */
  getProfilePicFromServer(id) {
    return Store.WapQuery.profilePicFind(id).then((x) => x.eurl);
  }
}