exports.createJSON = function (arrayValue, alName, cb) {
    switch (alName) {
        case "o365_ipv4_al":
            var jsonData = `{ "name": "${ipv4ALName}", "partition": "Common", "addresses": [`;
            break;
        case "o365_ipv6_al":
            var jsonData = `{ "name": "${ipv6ALName}", "partition": "Common", "addresses": [`;
            break;
        case "o365_dns_al":
            var jsonData = `{ "name": "${dnsALName}", "partition": "Common", "addresses": [`;
            break;
        default:
            cb(new Error('Error returning data: Address List Name invalid'));
            break;
    }

    arrayValue.forEach(function (arrayValue) {

        console.log(`Building JSON for ${alName}`);
        arrayValue = arrayValue + `{ "name": "${arrayValue}" }, `;

    });
}