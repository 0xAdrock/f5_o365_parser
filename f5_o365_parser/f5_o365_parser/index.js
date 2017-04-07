var parse = require('./parseandstore').processXML;
var getxml = require('./getxml').getXML;
var f5 = require('./f5_icontrol');
var uniq = require('uniq');
var createJSON = require('./buildjson').createJSON;
var address = "https://support.content.office.net/en-us/static/O365IPAddresses.xml"
var file = './data/rawxml.xml';
var addlists = ["o365_ipv4_al", "o365_ipv6_al", "o365_dns_al"];

//Time to get the XML

console.log("Calling XML Module");
getxml(address, function (err, res) {
    if (err) {
        console.log(err);
    }
    console.log("Got XML. File written to: " + file + "\n\n Parsing File");
    parse(file, function (err, json) {
        if (err) {
            console.log(err);
        } else {
            console.log("Got Addresses. Removing duplicate addresses");
            uniq(json.ipv4);
            uniq(json.ipv6);
            uniq(json.dns);
            console.log("Duplicates Removed\n\n Converting to JSON\n\n");
            console.log("Building JSON\n\n");
            console.log("Bulding IPv4 JSON Package\n\n");
            createJSON(json.ipv4, addlists[0], function (err, jsonData) {

                if (err) {
                    console.log(err);
                }
                var ipv4JSON = 

            });
        }
    });
});