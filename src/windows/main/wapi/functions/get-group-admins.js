const {
  _getGroupParticipants
} = require('./get-group-participants');
module.exports = {
  /**
   * Retrieves group admins
   * @param {string} id Group id
   * @param {Function} done Optional callback
   */
  async getGroupAdmins(id, done) {
    const output = (await _getGroupParticipants(id))
      .filter((participant) => participant.isAdmin)
      .map((admin) => admin.id);

    if (done !== undefined) done(output);
    return output;
  }
}