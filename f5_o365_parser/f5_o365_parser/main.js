var getXML = require('./lib/getxml');
var parse = require('./lib/parseandstore');
var file = '../data/rawxml.xml';

getXML.getXML();
var data = parse(file);