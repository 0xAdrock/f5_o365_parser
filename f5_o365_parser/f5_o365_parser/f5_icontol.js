var F5rest = require('node-rest-client').Client;
var fs = require('fs');
var address = ('https://192.168.1.21/mgmt/tm/security/firewall/address-list/test_al');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var options = {
    user: "admin",
    password: "admin",
    mimetypes: {
        json: ["application/json", "application/json;charset=utf-8"]
    },
    headers: { "Content-Type": "application/json" },
    data: {
        "addresses": [{ "name": "192.168.1.100" }, { "name": "10.0.1.0/24" }, { "name": "254.254.254.254" }]
    }

};
var f5rest = new F5rest(options);
f5rest.get(address, function (data, response) {
    data = JSON.stringify(data);
    console.log(data + "\n\n\n\n");
    //console.log("Logging Response Data\n\n");
    //console.log(response);
    fs.writeFileSync("./data/f5_return.json", data);

});


f5rest.patch(address, options, function (data, response) {

    console.log(data);

});
