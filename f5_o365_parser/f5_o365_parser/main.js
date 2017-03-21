var https = require('https');
var fs = require('fs');
var ipregex = require('ip-regex');
var lr = require('line-reader');

var file = './data/rawxml.xml';
var ipv4Array = [];
var ipv6Array = [];
var dnsArray = [];
var ipv4Addresses = `"addresses": [`;
var ipv6Addresses = `"addresses": [`;
var domains = `"addresses": [`;

/* Finishes the formatting of the JSON to F5 iControl format for use by
the f5_icontrol module.
*/

function finishedJSON(ipv4, ipv6, dns) {
    //console.log("Pre-modification Lengths: \n\n");
    //console.log("IPv4: " + ipv4.length);
    //console.log("IPv6: " + ipv6.length);
    //console.log("Type IPv4: " + typeof ipv4);
    //console.log("Type IPv6: " + typeof ipv6);
    ipv4 = ipv4.trim();
    ipv6 = ipv6.trim();
    //dns = domains.trim();
    ipv4 = ipv4.slice(0, -1);
    ipv6 = ipv6.slice(0, -1);
    //dns = dns.slice(0, -1);
    ipv4 = ipv4 + "]";
    ipv6 = ipv6 + "]";
    fs.writeFileSync("./data/ipv4.json", ipv4);
    fs.writeFileSync("./data/ipv6.json", ipv6);
    fs.writeFileSync("./data/domain.json", dns);
};

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
            //console.log("Number of IPv4 Addresses: " + ipv4Addresses.length);
            //console.log("Number of IPv6 Addresses: " + ipv6Addresses.length);
            //console.log("Number of URL Addresses: " + domains.length);
            //console.log("\n\nJSON of Array\n\n")
            //console.log(JSON.stringify(domains));
            //console.log("\n\n\n\n");
            //console.log("IPv4 Addresses Formatted:\n\n");
            //console.log(ipv4Addresses);
            removeDup();
            finishedJSON(ipv4Addresses, ipv6Addresses, domains);

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
                ipv4Array.push(address);
                //ipv4Addresses = ipv4Addresses + `{ "name": "${address}" }, `;
            } else if (ipregex.v6().test(address)) {
                //console.log("IPv6 Address: " + address);
                ipv6Array.push(address);
                //ipv6Addresses = ipv6Addresses + `{ "name": "${address}" }. `;
            } else {
                //console.log("Domain Address " + address + " ignored");
                if (address.includes("http")) {
                    //console.log("Found URL with HTTP in it " + address);
                    var urlArray = address.match(regURL);
                    //console.log("urlArray: " + urlArray + " Length: " + urlArray.length);
                    var url = urlArray[1];
                    dnsArray.push(address);
                } else {
                    dnsArray.push(address);
                }
            }
        }

    });


}
/*

Since Microsoft sucks, we need to look for duplicates in the converted XML and remove them. This breaks the iControl call to AFM to create the address list. Thanks MS

*/

function removeDup() {

    require('uniq')(ipv4Array);
    require('uniq')(ipv6Array);
    require('uniq')(dnsArray);

    ipv4Array.forEach(function (ipv4) {

        //console.log("Building IPv4 JSON");
        ipv4Addresses = ipv4Addresses + `{ "name": "${ipv4}" }, `;

    });

    ipv6Array.forEach(function (ipv6) {

        //console.log("Building IPv6 JSON");
        ipv6Addresses = ipv6Addresses + `{ "name": "${ipv6}" }, `;

    });

    dnsArray.forEach(function (dns) {

        //console.log("Building DNS JSON");
        domains = domains + `{ "name": "${dns}" }, `;

    });

}