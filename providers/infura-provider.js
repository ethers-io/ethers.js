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

    // Legacy constructor (testnet, apiAccessToken)
    // @TODO: Remove this in the next major release
    network = Provider._legacyConstructor(network, 1, arguments[0]);

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

utils.defineProperty(InfuraProvider.prototype, '_startPending', function() {
    console.log('WARNING: INFURA does not support pending filters');
});

utils.defineProperty(InfuraProvider.prototype, '_stopPending', function() {
});

module.exports = InfuraProvider;
