var https = require('https');
var fs = require('fs');
var ipregex = require('ip-regex');
var lr = require('line-reader');
var F5rest = require('node-rest-client').Client;
var config = ('./data/config.json');
var file = './data/rawxml.xml';
var getXML = './getxml.js';
var ipv4Array = [];
var ipv6Array = [];
var dnsArray = [];
var ipv4Addresses = `"addresses": [`;
var ipv6Addresses = `"addresses": [`;
var domains = `"addresses": [`;
var addlists = ["o365_ipv4_al", "o365_ipv6_al", "o365_dns_al"];
var addressBase = "https://192.168.1.21/mgmt/tm/security/firewall/address-list/";
var body;
//HTTP Request Options
var options = {
    host: 'support.content.office.net',
    port: '443',
    path: '/en-us/static/O365IPAddresses.xml'
};

/* Finishes the formatting of the JSON to F5 iControl format for use by
the f5_icontrol module.


Need to modify how this runs. Not all at once for each item, but called as needed
*/

function finishedJSON(ipv4, ipv6, dns) {
    ipv4 = ipv4.trim();
    ipv6 = ipv6.trim();
    dns = domains.trim();
    ipv4 = ipv4.slice(0, -1);
    ipv6 = ipv6.slice(0, -1);
    dns = dns.slice(0, -1);
    ipv4 = ipv4 + "]";
    ipv6 = ipv6 + "]";
    //fs.writeFileSync("./data/ipv4.json", ipv4);
    //fs.writeFileSync("./data/ipv6.json", ipv6);
    //fs.writeFileSync("./data/domain.json", dns);
};


// Callback function to deal with response
var getXML = function (response) {
    // Continuously update stream with data
    //var body = '';
    response.on('data', function (data) {
        body += data;
    });
    response.on('end', function () {
        // Data received completely
        // Parse the XML received from MS into JSON
        console.log('\n\nDone Reading XML. Now writing to file.\n\n');
        fs.writeFileSync("./data/rawxml.xml", body);
        console.log("Done Writing to file\n\n");
        //console.log("Contents: \n\n" + body);
        processXML(file);
    });
}



// Now make the request
var req = https.get(options, getXML);
//processXML(body);


/*

The following function will read the XML line by line. It will first parse out
the data of last update. This will be used in another function to see if we need
to update the address list from Office 365. It will then initerate through the
XML and parse out all the IPv4, IPv6, and DNS names into seperate arrays.
*/

function processXML(xml) {
    console.log("Reading XML\n\n");
    //console.log("Contents: \n\n" + xml);

    lr.eachLine(xml, function (line, last) {
        
        var regDate = /"(.*?)"/;
        var regAddress = /\<address\>(.*?)\<\/address\>/;
        var regURL = /https?\:\/\/(.*?)/;
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
/*
addlists.forEach(function (names) {
    
    if (names == "o365_ipv4_al") {
        var fileName = "./data/ipv4.json";
    } else if (names == "o365_ipv6_al") {
        var fileName = "./data/ipv6.json";
    } else {
        var fileName = "./data/domain.json";
    }
   
    console.log("Names: " + names);
    console.log("Looping Through JSON:\n\n");
    var address = addressBase + names;
    console.log("Address: " + address);
    icontrol.testExist(address, (err, result) => {
        console.log("Address for Request: " + addressBase + names);
        if (result) {
            icontrol.ModifyAddressList(address, names);
        } else {
            icontrol.CreateAddressList(address, names);
        }
    });
});
 */
var checkALExists = function (err, address, alname, cb) {
    f5rest.get(address, config.icontrol, function (data, response) {
        console.log("JSON Data:\n\n");
        console.log(JSON.stringify(data));
        data = `{ "name": "o365_ipv4_al", "partition": "Common", ${data}}`;
        if (data.code == 404) {
            console.log("404 Error From BigIP. Address list doesn't already exist. Creating new address list using IPv4");
            return false;
            //CreateAddressList(options, addressBase, "IPv4");
        } else {
            console.log("Address List Exists. Modifying List");
            return true;
        }
    }
});
