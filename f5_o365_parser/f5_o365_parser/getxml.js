var request = require('request');
var fs = require('fs');

exports.getXML = function (address, cb) {
    request(address, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            fs.writeFileSync("./data/rawxml.xml", body);
            cb(true); // invoke callback function with the value you want to pass back
        } else {
            cb(new Error('Error returning data'));
        } 
    });
};