'use strict';
var ethersWallet = require('../wallet/index.js');

var ethereumUtil = require('ethereumjs-util');

var utils = require('./utils.js');

module.exports = function(test) {
    for (var i = 0; i < 10000; i++) {
        var privateKey = utils.randomBuffer(32);
        var ethereumLib = '0x' + ethereumUtil.privateToAddress(privateKey).toString('hex');
        var ethers = (new ethersWallet(privateKey)).address;
        test.equal(ethers, ethereumUtil.toChecksumAddress(ethereumLib), 'wrong address');
    }
    test.done();
}

module.exports.testSelf = module.exports;

