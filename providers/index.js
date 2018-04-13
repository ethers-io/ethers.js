'use strict';

var Provider = require('./provider');

var EtherscanProvider = require('./etherscan-provider');
var FallbackProvider = require('./fallback-provider');
var IpcProvider = require('./ipc-provider');
var InfuraProvider = require('./infura-provider');
var JsonRpcProvider = require('./json-rpc-provider');
var Web3Provider = require('./web3-provider');

function getDefaultProvider(network) {
    return new FallbackProvider([
        new InfuraProvider(network),
        new EtherscanProvider(network),
    ]);
}

var exports = {
    EtherscanProvider: EtherscanProvider,
    FallbackProvider: FallbackProvider,
    InfuraProvider: InfuraProvider,
    JsonRpcProvider: JsonRpcProvider,
    Web3Provider: Web3Provider,

    isProvider: Provider.isProvider,

    networks: Provider.networks,

    getDefaultProvider:getDefaultProvider,

    Provider: Provider,
}

// Only available in node, so we do not include it in browsers
if (IpcProvider) {
    exports.IpcProvider = IpcProvider;
}

module.exports = exports;
