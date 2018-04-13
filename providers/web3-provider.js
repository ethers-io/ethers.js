'use strict';

var Provider = require('./provider');
var JsonRpcProvider = require('./json-rpc-provider');

var utils = (function() {
    return {
        defineProperty: require('../utils/properties').defineProperty,
    }
})();

var errors = require('../utils/errors');

/*
@TODO
utils.defineProperty(Web3Signer, 'onchange', {

});
*/

function Web3Provider(web3Provider, network) {
    errors.checkNew(this, Web3Provider);

    // HTTP has a host; IPC has a path.
    var url = web3Provider.host || web3Provider.path || 'unknown';

    if (network == null) { network = 'homestead'; }

    JsonRpcProvider.call(this, url, network);
    utils.defineProperty(this, '_web3Provider', web3Provider);
}
JsonRpcProvider.inherits(Web3Provider);

utils.defineProperty(Web3Provider.prototype, 'send', function(method, params) {

    // Metamask complains about eth_sign (and on some versions hangs)
    if (method == 'eth_sign' && this._web3Provider.isMetaMask) {
        // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
        method = 'personal_sign';
        params = [ params[1], params[0] ];
    }

    var provider = this._web3Provider;
    return new Promise(function(resolve, reject) {
        var request = {
            method: method,
            params: params,
            id: 42,
            jsonrpc: "2.0"
        };
        provider.sendAsync(request, function(error, result) {
            if (error) {
                reject(error);
                return;
            }
            if (result.error) {
                var error = new Error(result.error.message);
                error.code = result.error.code;
                error.data = result.error.data;
                reject(error);
                return;
            }
            resolve(result.result);
        });
    });
});

module.exports = Web3Provider;
