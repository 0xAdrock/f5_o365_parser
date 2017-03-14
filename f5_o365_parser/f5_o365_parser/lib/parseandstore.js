/*

The following function will read the XML line by line. It will first parse out
the data of last update. This will be used in another function to see if we need
to update the address list from Office 365. It will then initerate through the
XML and parse out all the IPv4, IPv6, and DNS names into seperate arrays.
*/
var lr = require('line-reader');
var ipregex = require('ip-regex');
var ipv4Addresses = [];
var ipv6Addresses = [];
var domains = [];
var file = '../data/rawxml.xml';

console.log("Reading XML\n\n");

lr.eachLine(file, function (line, last) {

    var regDate = /"(.*?)"/;
    var regAddress = /\<address\>(.*?)\<\/address\>/;
    //console.log(line);

    if (last) {
        console.log("End of File");
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
            //console.log("Domain Address " + address + " ignored");
        }
    }

});

console.log("Number of IPv4 Addresses: " + ipv4Addresses.length);
console.log("Number of IPv6 Addresses: " + ipv6Addresses.length);

module.exports = {
    ipv4Addresses: ipv4Addresses,
    ipv6Addresses: ipv6Addresses,
    domains: domains
};