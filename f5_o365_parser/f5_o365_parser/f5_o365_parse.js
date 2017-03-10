var https = require('https');
var xml2js = require('xml2js');
var util = require('util');
var fs = require("fs");



//HTTP Request Options
var options = {
    host: 'support.content.office.net',
    port: '443',
    path: '/en-us/static/O365IPAddresses.xml'
};

// Callback function to deal with response
var callback = function (response) {
    // Continuously update stream with data
    var body = '';
    response.on('data', function (data) {
        body += data;
    });
    response.on('end', function () {
        // Data received completely
        // Parse the XML received from MS
        parser = new xml2js.Parser();
        parser.parseString(body, function (err, result) {
            //var jsondata = JSON.parse(result);
            fs.writeFile("./addresslist.json", util.inspect(result, false, null));
            //console.log("Address:", jsondata.address);
            console.log('Done');
        });
    });
}

// Now make the request
var req = https.get(options, callback);
req.end();