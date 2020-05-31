const {
  base64ToFile
} = require('../helper/base64-to-file');
const {
  sendSticker
} = require('./send-sticker');

module.exports = {
  /**
   * Sends image as sticker to given chat id
   * @param {string} imageBase64 Image as base64
   * @param {string} chatId chat id
   * @param {*} metadata sharp metadata: (https://sharp.pixelplumbing.com/api-input#metadata)
   */
  async sendImageAsSticker(imageBase64, chatId, metadata) {
    const mediaBlob = base64ToFile(
      'data:image/webp;base64,' + imageBase64,
      'file.webp'
    );
    const encrypted = await window.WAPI.encryptAndUploadFile(
      'sticker',
      mediaBlob
    );

    return await sendSticker(encrypted, chatId, metadata);
  }
}