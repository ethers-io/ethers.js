'use strict';

var Provider = require('./provider');
var JsonRpcProvider = require('./json-rpc-provider');

var utils = (function() {
    return {
        defineProperty: require('ethers-utils/properties.js').defineProperty
    }
})();

function InfuraProvider(network, apiAccessToken) {
    if (!(this instanceof InfuraProvider)) { throw new Error('missing new'); }

    // Legacy constructor (testnet, chainId, apiAccessToken)
    // @TODO: Remove this in the next major release
    if (arguments.length === 3) {
        apiAccessToken = arguments[2];
        network = Provider._legacyConstructor(network, 2, arguments[0], arguments[1]);
    } else {
        apiAccessToken = null;
        network = Provider._legacyConstructor(network, arguments.length, arguments[0], arguments[1]);
    }

    var host = null;
    switch(network.name) {
        case 'homestead':
            host = 'mainnet.infura.io';
            break;
        case 'ropsten':
            host = 'ropsten.infura.io';
            break;
        case 'rinkeby':
            host = 'rinkeby.infura.io';
            break;
        case 'kovan':
            host = 'kovan.infura.io';
            break;
        default:
            throw new Error('unsupported network');
    }

    var url = 'https://' + host + '/' + (apiAccessToken || '');

    JsonRpcProvider.call(this, url, network);

    utils.defineProperty(this, 'apiAccessToken', apiAccessToken || null);
}
JsonRpcProvider.inherits(InfuraProvider);

module.exports = InfuraProvider;
