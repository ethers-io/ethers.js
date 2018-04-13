'use strict';

var Provider = require('./provider');
var JsonRpcProvider = require('./json-rpc-provider');

var utils = (function() {
    return {
        defineProperty: require('../utils/properties').defineProperty
    }
})();

var errors = require('../utils/errors');

function InfuraProvider(network, apiAccessToken) {
    errors.checkNew(this, InfuraProvider);

    network = Provider.getNetwork(network);

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

utils.defineProperty(InfuraProvider.prototype, 'getSigner', function(address) {
    errors.throwError('INFURA does not support signing', errors.UNSUPPORTED_OPERATION, { operation: 'getSigner' });
});

utils.defineProperty(InfuraProvider.prototype, 'listAccounts', function() {
    return Promise.resolve([]);
});

module.exports = InfuraProvider;
