var request = require('request');

/**
 * Downloads data from url (field.url)
 * 
 * @param {*} field the download info
 * @param {*} cb callback with data (only fires if success)
 */
function download(field, cb) {
    console.log("INIT_URL::" + field.url)
    request.get(field.url, { encoding: null }, function (err, res, body) {
        
        // if error cancel
        if (err) {
            console.log("ERROR::error!")
            field.status = "error"
            return
        }

        // if status<>200 end/cancel
        if (res.statusCode !== 200) {
            console.log("ERROR::status = " + res.statusCode)
            // check for iteration
            if (field.iteration > 0)
                field.status = field.path + field.filename + " completed - " + field.bytes + " bytes downloaded"
            else
                field.status = "status: " + res.statusCode
            return
        }

        if (field != undefined) {
            field.bytes = field.bytes + body.length
            field.status = field.bytes + " bytes downloaded"
        }
        cb(body)// returns data
    });
}

module.exports = {
    download: download
}

