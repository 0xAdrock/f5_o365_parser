//var fs = require('fs');
var ipregex = require('ip-regex');
var lr = require('line-reader');
//var file = './data/rawxml.xml';

var ipv4Addresses = [];
var ipv6Addresses = [];
var domains = [];

exports.processXML = function (file, cb) {
    console.log("Reading XML\n\n");

    lr.eachLine(file, function (line, last) {

        var regDate = /"(.*?)"/;
        var regAddress = /\<address\>(.*?)\<\/address\>/;
        var regURL = /https?\:\/\/(.*?)/;
        //console.log(line);

        if (last) {
            console.log("End of File\n\n");
            //var addresses
            cb(null, {
                ipv4: ipv4Addresses,
                ipv6: ipv6Addresses,
                dns: domains
            });
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
                if (address.includes("http")) {
                    //console.log("Found URL with HTTP in it " + address);
                    var urlArray = address.match(regURL);
                    //console.log("urlArray: " + urlArray + " Length: " + urlArray.length);
                    var url = urlArray[1];
                    domains.push(address);
                } else {
                    domains.push(address);
                }
            }
        }
    });
};