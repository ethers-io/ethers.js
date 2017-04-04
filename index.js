'use strict';

/*
var contracts = require('ethers-contracts');
var HDNode = require('ethers-hdnode');
//var providers = require('providers');
var utils = require('ethers-utils');
var Wallet = require('ethers-wallet');
*/

var contracts = require('./contracts/index.js');
var providers = require('./providers/index.js');
var utils = require('./utils/index.js');
var wallet = require('./wallet/index.js');

module.exports = {
    Wallet: wallet.Wallet,

    HDNode: wallet.HDNode,

    Contract: contracts.Contract,
    Interface: contracts.Interface,

    providers: providers,

    utils: utils,

    _SigningKey: wallet._SigningKey,
};

require('ethers-utils/standalone.js')(module.exports);
