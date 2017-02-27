'use strict';

var Provider = require('./provider.js');

var EtherscanProvider = require('./etherscan-provider.js');
var FallbackProvider = require('./fallback-provider.js');
var InfuraProvider = require('./infura-provider.js');
var JsonRpcProvider = require('./json-rpc-provider.js');

function getDefaultProvider(testnet) {
    return new FallbackProvider([
        new InfuraProvider(testnet),
        new EtherscanProvider(testnet),
    ]);
}

module.exports = {
    EtherscanProvider: EtherscanProvider,
    FallbackProvider: FallbackProvider,
    InfuraProvider: InfuraProvider,
    JsonRpcProvider: JsonRpcProvider,

    isProvder: Provider.isProvider,

    getDefaultProvider:getDefaultProvider,

    Provider: Provider,
}

require('ethers-utils/standalone.js')({
    providers: module.exports
});

