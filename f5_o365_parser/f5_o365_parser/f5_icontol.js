var F5rest = require('node-rest-client').Client;
var fs = require('fs');
var addressBase = ('https://192.168.2.2/mgmt/tm/security/firewall/address-list/');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var fileValue = fs.readFileSync("./data/ipv4.json", "utf-8");
fileValue = `{ "name": "o365_ipv4_al", "partition": "Common", ${fileValue}}`;
ipv4ALCreate = `{ "name": "o365_ipv4_al", "partition": "Common"}`;

var options = {
    user: "admin",
    password: "Puto!puto1",
    mimetypes: {
        json: ["application/json", "application/json;charset=utf-8"]
    },
    headers: { "Content-Type": "application/json" },
    data: fileValue
};

console.log("Reading JSON File:\n\n");
console.log(options.data);
//options.data = ""
var address = addressBase + "o365_ipv4_al";
var f5rest = new F5rest(options);

f5rest.get(address, function (data, response) {
    console.log(JSON.stringify(data));
    if (data.code == 404) {
        console.log("404 Error From BigIP. Address list doesn't already exist. Creating new address list using IPv4");
        CreateAddressList(options, addressBase, "IPv4");
    }
});


/*f5rest.patch(address, options, function (data, response) {

    console.log(data);

});
*/

function CreateAddressList(opts, address, name) {

    f5rest.post(address, opts, function (data, response) {

        console.log("Creating new Address List in AFM named: " + name + "\n\n");
        console.log("Output of Creation:\n\n" + JSON.stringify(data));

    });
};