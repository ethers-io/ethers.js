'use strict';

var version = require('./package.json').version;

var contracts = require('./contracts');
var providers = require('./providers');
var utils = require('./utils');
var wallet = require('./wallet');

module.exports = {
    Wallet: wallet.Wallet,

    HDNode: wallet.HDNode,
    SigningKey: wallet.SigningKey,

    Contract: contracts.Contract,
    Interface: contracts.Interface,

    networks: providers.networks,
    providers: providers,

    utils: utils,

    version: version,
};
