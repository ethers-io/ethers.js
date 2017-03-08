'use strict';

var Wallet = require('./wallet');
var HDNode = require('./hdnode');
var SigningKey = require('./signing-key');

module.exports = {
    HDNode: HDNode,
    Wallet: Wallet,

    // Do we need to expose this at all?
    _SigningKey: SigningKey,
}

require('ethers-utils/standalone.js')(module.exports);
