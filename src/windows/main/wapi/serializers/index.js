const {
    _serializeChatObj
} = require('./serialize-chat');
const {
    _serializeRawObj
} = require('./serialize-raw');
const {
    _serializeMessageObj
} = require('./serialize-message');
const {
    _serializeContactObj
} = require('./serialize-contact');
const {
    _serializeNumberStatusObj
} = require('./serialize-number-status');
const {
    _serializeProfilePicThumb
} = require('./serialize-profile-pic-thumb');

module.exports = {
    _serializeChatObj,
    _serializeRawObj,
    _serializeMessageObj,
    _serializeContactObj,
    _serializeNumberStatusObj,
    _serializeProfilePicThumb,
}