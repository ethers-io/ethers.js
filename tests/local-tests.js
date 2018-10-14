// These are test cases that cannot be run on Travis CI, but running them locally can
// help prevent certain bugs from getting committed.

var assert = require('assert');

var ethers = require('..');

var wallet = new ethers.Wallet("0x0123456789012345678901234567890123456789012345678901234567890123");

describe("Local JSON-RPC", function() {

    // https://github.com/ethers-io/ethers.js/issues/306
    it ("sends a transaction", function() {
        this.timeout(10000);

        var provider = new ethers.providers.JsonRpcProvider();
        var signer = provider.getSigner(1);

        return signer.sendTransaction({
            to: wallet.address,
            value: 1
        }).then(function(tx) {
            console.log(tx);
            return tx.wait().then(() => {
                console.log("Mined", provider);
            });
        }, function(error) {
            console.log(error);
            assert.ok(false, "throws an error");
        });

    });

    it("sends a wallet transactin", function() {
        this.timeout(10000);

        var provider = new ethers.providers.JsonRpcProvider();
        var signer = wallet.connect(provider);

        return signer.sendTransaction({
            to: provider.getSigner(1).getAddress(),
            value: 2
        }).then(function(tx) {
            console.log(tx);
            return tx.wait().then(() => {
                console.log("Mined");
            });
        }, function(error) {
            console.log(error);
            assert.ok(false, "throws an error");
        });
    });
});


