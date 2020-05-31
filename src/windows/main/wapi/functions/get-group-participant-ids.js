const {
  _getGroupParticipants
} = require('./get-group-participants');

module.exports = {
  /**
   * Fetches IDs of group participants
   * @param {string} groupId Group id
   * @param {Function} done Optional callback
   * @returns {Promise.<Array|*>} Yields list of IDs
   */
  async getGroupParticipantIDs(groupId, done) {
    const output = (await _getGroupParticipants(groupId)).map(
      (participant) => participant.id
    );

    if (done !== undefined) done(output);
    return output;
  }
}