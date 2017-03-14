var F5rest = require('node-rest-client').Client;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var options = {
    user: "admin",
    password: "Puto!puto1",
    mimetypes: {
        json: ["application/json", "application/json;charset=utf-8"]
    }
};
var f5rest = new F5rest(options);
f5rest.get("https://192.168.2.2/mgmt/tm/net/self/", function (data, response) {
    // console.log(data);
    console.log("Logging Response Data\n\n");
    console.log(response);

});