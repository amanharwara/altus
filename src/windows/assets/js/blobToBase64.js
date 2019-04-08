module.exports = {
    convert: function(blob, callback) {
        var reader = new FileReader();
        reader.onload = function() {
            var dataUrl = reader.result;
            var base64 = dataUrl.split(',')[1];
            callback(blob, base64);
        };
        reader.readAsDataURL(blob);
    }
}