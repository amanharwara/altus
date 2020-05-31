const jsSHA = require('../jssha');

module.exports = {
  /**
   * Retrieves given file hash (SHA-256 -> Base64)
   * @param {Blob} data
   */
  async getFileHash(data) {
    let buffer = await data.arrayBuffer();
    var sha = new jsSHA('SHA-256', 'ARRAYBUFFER');
    sha.update(buffer);
    return sha.getHash('B64');
  }
}