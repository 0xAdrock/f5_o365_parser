var getXML = require('./getxml');
var parse = require('./parseandstore');
var file = '../data/rawxml.xml';

getXML();
parse();

console.log("Number of IPv4 Addresses: " + parse.ipv4Addresses.length);
console.log("Number of IPv6 Addresses: " + parse.ipv6Addresses.length);
console.log("Number of URL Addresses: " + parse.domains.length);