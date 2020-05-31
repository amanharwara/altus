module.exports = {
  /**
   * Retrieves current user object
   */
  getMe(done) {
    const rawMe = window.Store.Contact.get(window.Store.Conn.me);

    if (done !== undefined) done(rawMe.all);
    return rawMe.all;
  }
}