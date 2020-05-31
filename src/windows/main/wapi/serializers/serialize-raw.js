module.exports = {
  /**
   * Serializes object into JSON format safely
   * @param {*} obj
   */
  _serializeRawObj: (obj) => {
    if (obj && obj.toJSON) {
      return obj.toJSON();
    }
    return {};
  }
}