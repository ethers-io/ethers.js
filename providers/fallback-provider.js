'use strict';

var inherits = require('inherits');

var Provider = require('./provider.js');

var utils = (function() {
    return {
        defineProperty: require('../utils/properties.js').defineProperty,
    };
})();


function FallbackProvider(providers) {
    if (providers.length === 0) { throw new Error('no providers'); }

    var network = {};
    ['chainId', 'ensAddress', 'name', 'testnet'].forEach(function(key) {
        for (var i = 1; i < providers.length; i++) {
            if (providers[0][key] !== providers[i][key]) {
                throw new Error('incompatible providers - ' + key + ' mismatch');
            }
        }
        network[key] = providers[0][key];
    });

    if (!(this instanceof FallbackProvider)) { throw new Error('missing new'); }
    Provider.call(this, network);

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
                return resolve(result);
            }, function (error) {
                if (!firstError) { firstError = error; }
                next();
            }).catch(function(error) { });
        }
        next();
    });
});

module.exports = FallbackProvider;
