
var assert = require('assert');

var utils = require('./utils');
var ethers = utils.getEthers(__filename);

describe("Package Version", function() {
    var url = "http://registry.npmjs.org/ethers"
    it("is not already published", function() {
        return ethers.utils.fetchJson(url).then(function(data) {
            console.log(data);
            assert.ok(Object.keys(data.versions).indexOf(ethers.version) === -1);
        });
    });
});

/*
describe("Test package path resolution:", function() {
    var Tests = {
        "..": [
            "Wallet"
        ],
        "../contracts": [
        ],
        "../contracts/contract": [
        ],
        "../contracts/interface": [
        ],
        "../providers": [
        ],
        "../providers/InfuraProvider": [
        ],
        "../providers/JsonRpcProvider": [
        ],
        "../providers/FallbackProvider": [
        ],
        "../providers/IpcProvider": [
        ],
        "../providers/Provider": [
        ],
        "../wallet": [
        ],
    };
    for (var key in Tests) {
        it(key, function() {
            var test = require(key);
        });
    }
});
*/
