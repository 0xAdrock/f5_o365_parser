var https = require('https');
var fs = require('fs');

function getXML(response) {
    
    var options = {
        host: 'support.content.office.net',
        port: '443',
        path: '/en-us/static/O365IPAddresses.xml'
    };
    var req = function (response) {
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
            fs.writeFileSync("./data/rawxml.xml", body);
            console.log("Done Writing to file\n\n");
            //processXML(file);

            //console.log("Address:", jsondata.address);
        });
    }
}

module.exports = getXML;
