'use strict';


/*
var contracts = require('ethers-contracts');
var HDNode = require('ethers-hdnode');
//var providers = require('providers');
var utils = require('ethers-utils');
var Wallet = require('ethers-wallet');
*/

var contracts = require('./contracts/index.js');
var HDNode = require('./hdnode/index.js');
//var providers = require('providers');
var utils = require('./utils/index.js');
var Wallet = require('./wallet/index.js');

module.exports = {
    Wallet: Wallet,

    HDNode: HDNode,

    Contract: contracts.Contract,
    Interface: contracts.Interface,

//    providers: providers,


    utils: {
        bigNumberify: utils.bigNumberify,

        etherSymbol: utils.etherSymbol,

        formatEther: utils.formatEther,
        parseEther: utils.parseEther,

        getAddress: utils.getAddress,
        getContractAddress: utils.getContractAddress,

        keccak256: utils.keccak256,
        sha256: utils.sha256,

        randomBytes: utils.randomBytes,
    },

    _utils: utils,
    _SigningKey: Wallet._SigningKey,
};

