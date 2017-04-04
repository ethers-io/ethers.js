'use strict';

var inherits = require('inherits');

var Provider = require('./provider.js');

var utils = (function() {
    return {
        defineProperty: require('ethers-utils/properties.js').defineProperty,
    };
})();


function FallbackProvider(providers) {
    if (providers.length === 0) { throw new Error('no providers'); }

    for (var i = 1; i < providers.length; i++) {
        if (providers[0].chainId !== providers[i].chainId) {
            throw new Error('incompatible providers - chainId mismatch');
        }

        if (providers[0].testnet !== providers[i].testnet) {
            throw new Error('incompatible providers - testnet mismatch');
        }
    }

    if (!(this instanceof FallbackProvider)) { throw new Error('missing new'); }
    Provider.call(this, providers[0].testnet, providers[0].chainId);

    providers = providers.slice(0);
    Object.defineProperty(this, 'providers', {
        get: function() {
            return providers.slice(0);
        }
    });
}
inherits(FallbackProvider, Provider);


utils.defineProperty(FallbackProvider.prototype, 'perform', function(method, params) {
    var providers = this.providers;
    return new Promise(function(resolve, reject) {
        var firstError = null;
        function next() {
            if (!providers.length) {
                reject(firstError);
                return;
            }

            var provider = providers.shift();
            provider.perform(method, params).then(function(result) {
                resolve(result);
            }, function (error) {
                if (!firstError) { firstError = error; }
                next();
            });
        }
        next();
    });
});

module.exports = FallbackProvider;
