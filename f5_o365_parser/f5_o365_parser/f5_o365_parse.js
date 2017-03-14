var https = require('https');
var fs = require('fs');
var ipregex = require('ip-regex');
var lr = require('line-reader');
//var getXML = require('./lib/getxml');
//var parseXML = require('./lib/parseandstore')
var file = './data/rawxml.xml';
var ipv4Addresses = [];
var ipv6Addresses = [];
var domains = [];



//HTTP Request Options
var options = {
    host: 'support.content.office.net',
    port: '443',
    path: '/en-us/static/O365IPAddresses.xml'
};

// Callback function to deal with response
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
        fs.writeFileSync("./data/rawxml.xml", body);
        console.log("Done Writing to file\n\n");
        processXML(file);
        
        //console.log("Address:", jsondata.address);
    });
}



// Now make the request
var req = https.get(options, getXML);
//req.end(processXML(file));

/*

The following function will read the XML line by line. It will first parse out
the data of last update. This will be used in another function to see if we need
to update the address list from Office 365. It will then initerate through the
XML and parse out all the IPv4, IPv6, and DNS names into seperate arrays.
*/

function processXML(xmlfile) {
    console.log("Reading XML\n\n");

    lr.eachLine(xmlfile, function (line, last) {

        var regDate = /"(.*?)"/;
        var regAddress = /\<address\>(.*?)\<\/address\>/;
        var regURL = /https?\:\/\/(.*?)/;
        //console.log(line);

        if (last) {
            console.log("End of File\n\n");
            console.log("Number of IPv4 Addresses: " + ipv4Addresses.length);
            console.log("Number of IPv6 Addresses: " + ipv6Addresses.length);
            console.log("Number of URL Addresses: " + domains.length);
            return false;
        }

        if (line.includes("updated")) {
            var upDate = line.match(regDate);
            var upDateStr = upDate[1];
            console.log(upDateStr);
            console.log("Last Updated: " + upDateStr);
            var upDateStr = Date.parse(upDateStr);
            console.log("Parsed Date: " + upDateStr);
        } else if (line.includes("<address>")) {
            var addressArray = line.match(regAddress);
            var address = addressArray[1];
            //console.log("IPv6 Address: " + address);
            if (ipregex.v4().test(address)) {
                //console.log("IPv4 Address: " + address);
                ipv4Addresses.push(address);
            } else if (ipregex.v6().test(address)) {
                //console.log("IPv6 Address: " + address);
                ipv6Addresses.push(address);
            } else {
                console.log("Domain Address " + address + " ignored");
                if (address.includes("http")) {
                    console.log("Found URL with HTTP in it " + address);
                    var urlArray = address.match(regURL);
                    console.log("urlArray: " + urlArray + " Length: " + urlArray.length);
                    var url = urlArray[1];
                    domains.push(address);
                } else {
                    domains.push(address);
                }
            }
        }

    });


}

