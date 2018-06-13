'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var provider_1 = require("./provider");
var errors = __importStar(require("../utils/errors"));
// Returns:
//  - true is all networks match
//  - false if any network is null
//  - throws if any 2 networks do not match
function checkNetworks(networks) {
    var result = true;
    var check = null;
    networks.forEach(function (network) {
        // Null
        if (network == null) {
            result = false;
            return;
        }
        // Have nothing to compre to yet
        if (check == null) {
            check = network;
            return;
        }
        // Matches!
        if (check.name === network.name &&
            check.chainId === network.chainId &&
            check.ensAddress === network.ensAddress) {
            return;
        }
        errors.throwError('provider mismatch', errors.INVALID_ARGUMENT, { arg: 'providers', networks: networks });
    });
    return result;
}
var FallbackProvider = /** @class */ (function (_super) {
    __extends(FallbackProvider, _super);
    function FallbackProvider(providers) {
        //if (!(this instanceof FallbackProvider)) { throw new Error('missing new'); }
        var _this = this;
        if (providers.length === 0) {
            throw new Error('no providers');
        }
        var ready = checkNetworks(providers.map(function (p) { return p.network; }));
        if (ready) {
            _this = _super.call(this, providers[0].network) || this;
        }
        else {
            _this = _super.call(this, null) || this;
            // We re-assign the ready function to make sure all networks actually match
            _this.ready = Promise.all(providers.map(function (p) { return p.getNetwork(); })).then(function (networks) {
                if (!checkNetworks(networks)) {
                    errors.throwError('getNetwork returned null', errors.UNKNOWN_ERROR, {});
                }
                return networks[0];
            });
        }
        _this._providers = providers.slice(0);
        return _this;
    }
    Object.defineProperty(FallbackProvider.prototype, "providers", {
        get: function () {
            return this._providers.slice(0);
        },
        enumerable: true,
        configurable: true
    });
    FallbackProvider.prototype.perform = function (method, params) {
        // Creates a copy of the providers array
        var providers = this.providers;
        return new Promise(function (resolve, reject) {
            var firstError = null;
            function next() {
                if (!providers.length) {
                    reject(firstError);
                    return;
                }
                var provider = providers.shift();
                provider.perform(method, params).then(function (result) {
                    resolve(result);
                }, function (error) {
                    if (!firstError) {
                        firstError = error;
                    }
                    next();
                });
            }
            next();
        });
    };
    return FallbackProvider;
}(provider_1.Provider));
exports.FallbackProvider = FallbackProvider;
