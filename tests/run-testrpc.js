'use strict';

// Temporary test case for TestRPC woes; this will go away in the future and
// is meant to help test loosely compliant backends
//
// See: https://github.com/ethers-io/ethers.js/issues/45
//
// Please run `npm install ethereumjs-testrpc` before using this testcase

var TestRPC = require("ethereumjs-testrpc");

var providers = require('../providers');
var Wallet = require('../wallet/wallet');

var port = 18545;

var privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';

var server = TestRPC.server({
    accounts: [ { secretKey: privateKey } ]
});

server.listen(port, function(err, blockchain) {

    var provider = new providers.JsonRpcProvider('http://localhost:' + port, 'unspecified');

    var wallet = new Wallet(privateKey, provider);

    var sendPromise = wallet.sendTransaction({
        to: wallet.address,
        value: 1,
        gasLimit: 21000,
        gasPrice: 100000000000
    });

    sendPromise.then(function(tx) {
        console.log('Send', tx);
        return provider.getTransaction(tx.hash).then(function(tx) {
            console.log('Get', tx);
        });
    }).catch(function (error) {
        console.log(error);

    }).then(function() {
        server.close();
    });
});

