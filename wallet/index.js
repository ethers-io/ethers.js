'use strict';

var Wallet = require('./wallet');
var HDNode = require('./hdnode');
var SigningKey = require('./signing-key');

module.exports = {
    HDNode: HDNode,
    Wallet: Wallet,

    SigningKey: SigningKey,
    _SigningKey: SigningKey,
}

require('ethers-utils/standalone.js')(module.exports);
