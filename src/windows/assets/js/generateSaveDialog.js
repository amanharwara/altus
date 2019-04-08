const {
    dialog
} = require('electron').remote;
const fs = require('fs');

function show(blob, base64) {
    let filters = [];

    switch (blob.type) {
        case 'image/jpeg':
            filters.push({
                name: 'Images',
                extensions: ['jpeg', 'jpg']
            });
            break;
        case 'audio/ogg':
            filters.push({
                name: 'Audio',
                extensions: ['ogg']
            })
            break;
        default:
            filters.push({
                name: '*',
                extensions: ['*']
            })
            break;
    }

    dialog.showSaveDialog({
        title: "Save As",
        filters: filters
    }, filename => {
        if (filename === undefined) {
            return;
        }
        //Create fs-readable Buffer from blobBase64
        let buff = new Buffer.from(base64, 'base64');
        //Write to file using fs.writeFile
        fs.writeFile(filename, buff, err => {
            if (err) console.log("Error: " + err.message);
        });
    });
}

module.exports = {
    show
}