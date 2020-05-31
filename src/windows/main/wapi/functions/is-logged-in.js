module.exports = {
  /**
   * @param {Function} done Optional callback
   * @returns {boolean} true if logged in, false otherwise
   */
  isLoggedIn(done) {
    // Contact always exists when logged in
    const isLogged =
      window.Store.Contact && window.Store.Contact.checksum !== undefined;

    if (done !== undefined) done(isLogged);
    return isLogged;
  }
}