/**
 * Escape HTML, quotes, etc in strings
 * @param {string} s String
 */
module.exports.escape = function(s) {
    return s.replace(
        /[^0-9A-Za-z ]/g,
        c => "&#" + c.charCodeAt(0) + ";"
    );
};