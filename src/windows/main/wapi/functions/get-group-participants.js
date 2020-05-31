module.exports = {
  /**
   * Fetches group participants
   * @param {string} id Group id
   */
  async _getGroupParticipants(id) {
    const metadata = await WAPI.getGroupMetadata(id);
    return metadata.participants;
  }
}