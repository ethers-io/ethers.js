'use strict';

var contracts = require('ethers-contracts');
var providers = require('ethers-providers');
var utils = require('ethers-utils');
var wallet = require('ethers-wallet');

module.exports = {
    SigningKey: wallet.SigningKey,
    Wallet: wallet.Wallet,

    HDNode: wallet.HDNode,

    Contract: contracts.Contract,
    Interface: contracts.Interface,

    providers: providers,

    utils: utils,

    _SigningKey: wallet.SigningKey,
};

require('ethers-utils/standalone.js')(module.exports);
