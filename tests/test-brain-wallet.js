'use strict';
var Wallet = require('../index.js');

module.exports = function(test) {
    var username = new Wallet.utils.Buffer('ricmoo', 'utf8');
    var password = new Wallet.utils.Buffer('password', 'utf8');
    Wallet.summonBrainWallet(username, password).then(function(wallet) {
        test.equal(wallet.address, '0xbed9d2E41BdD066f702C4bDB86eB3A3740101acC', 'wrong wallet generated');
        test.done();
    }, function(error) {
        test.ok(false, 'Failed to generarte brain wallet');
        test.done();
    });
}

module.exports.testSelf = module.exports;
