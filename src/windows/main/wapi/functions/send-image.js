const {
  sendFile
} = require('./send-file');

module.exports = {
  /**
   * Sends image to given chat if
   * @param {string} imgBase64 base64 encoded file
   * @param {string} chatid Chat id
   * @param {string} filename
   * @param {string} caption
   * @param {Function} done Optional callback
   */
  sendImage(imgBase64, chatid, filename, caption, done) {
    return sendFile(imgBase64, chatid, filename, caption, done);
  }
}