'use strict';

/*
var contracts = require('ethers-contracts');
var HDNode = require('ethers-hdnode');
//var providers = require('providers');
var utils = require('ethers-utils');
var Wallet = require('ethers-wallet');
*/

var contracts = require('./contracts/index.js');
//var HDNode = require('./hdnode/index.js');
var providers = require('./providers/index.js');
var utils = require('./utils/index.js');
var wallet = require('./wallet/index.js');

module.exports = {
    Wallet: wallet.Wallet,

    HDNode: wallet.HDNode,

    Contract: contracts.Contract,
    Interface: contracts.Interface,

    providers: providers,

    utils: {
        bigNumberify: utils.bigNumberify,

        etherSymbol: utils.etherSymbol,

        formatEther: utils.formatEther,
        parseEther: utils.parseEther,

        getAddress: utils.getAddress,
        getContractAddress: utils.getContractAddress,

        toUtf8Bytes: utils.toUtf8Bytes,
        toUtf8String: utils.toUtf8String,

        keccak256: utils.keccak256,
        sha256: utils.sha256,

        randomBytes: utils.randomBytes,
    },

    _utils: utils,
    _SigningKey: wallet._SigningKey,
};

require('ethers-utils/standalone.js')(module.exports);
