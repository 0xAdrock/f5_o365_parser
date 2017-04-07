var F5rest = require('node-rest-client').Client;
var fs = require('fs');
var config = ('./data/config.json');
var exports = module.exports = {};
//Ignore Self Signed Cert
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var f5rest = new F5rest(config.icontrol);

exports.testExist = function (address, jsonData) {
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
    });
};


/*f5rest.patch(address, options, function (data, response) {

    console.log(data);

});
*/

exports.CreateAddressList = function (address, name) {
    f5rest.post(address, config.icontrol, function (data, response) {

        console.log("Creating new Address List in AFM named: " + name + "\n\n");
        console.log("Output of Creation:\n\n" + JSON.stringify(data));

    });
};

exports.ModifyAddressList = function (address, name) {

    f5rest.patch(address, options, function (data, response) {

        console.log("Modifying Address List in AFM named: " + name + "\n\n");
        console.log("Output of Modification:\n\n" + JSON.stringify(data));

    });

};


/*
function CreateAddressList(opts, address, name) {

    f5rest.post(address, opts, function (data, response) {

        console.log("Creating new Address List in AFM named: " + name + "\n\n");
        console.log("Output of Creation:\n\n" + JSON.stringify(data));

    });
};
*/

/*
function ModifyAddressList(opts, address, name) {
    f5rest.patch(address, opts, function (data, response) {

        console.log("Modifying Address List in AFM named: " + name + "\n\n");
        console.log("Output of Modification:\n\n" + JSON.stringify(data));

    });
};
*/