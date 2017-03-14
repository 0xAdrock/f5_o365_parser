var https = require('https');
var fs = require('fs');

var options = {
    host: 'support.content.office.net',
    port: '443',
    path: '/en-us/static/O365IPAddresses.xml'
};

var getXML = function (response) {
    // Continuously update stream with data
    var body = '';
    response.on('data', function (data) {
        body += data;
    });
    response.on('end', function () {
        // Data received completely
        // Parse the XML received from MS into JSON
        console.log('\n\nDone Reading XML. Now writing to file.\n\n');
        //console.log(body);
        fs.writeFileSync("../data/rawxml.xml", body);
        console.log("Done Writing to file\n\n");
        //console.log("Address:", jsondata.address);
    });
}

var req = https.get(options, getXML);

module.exports = {
    getXML: getXML
};
