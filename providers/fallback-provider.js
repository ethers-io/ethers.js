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
var base_provider_1 = require("./base-provider");
var errors = __importStar(require("../errors"));
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
            ((check.ensAddress === network.ensAddress) ||
                (check.ensAddress == null && network.ensAddress == null))) {
            return;
        }
        errors.throwError('provider mismatch', errors.INVALID_ARGUMENT, { arg: 'networks', value: networks });
    });
    return result;
}
var FallbackProvider = /** @class */ (function (_super) {
    __extends(FallbackProvider, _super);
    function FallbackProvider(providers) {
        var _this = this;
        if (providers.length === 0) {
            throw new Error('no providers');
        }
        // All networks are ready, we can know the network for certain
        var ready = checkNetworks(providers.map(function (p) { return p.network; }));
        if (ready) {
            _this = _super.call(this, providers[0].network) || this;
        }
        else {
            // The network won't be known until all child providers know
            var ready_1 = Promise.all(providers.map(function (p) { return p.getNetwork(); })).then(function (networks) {
                if (!checkNetworks(networks)) {
                    errors.throwError('getNetwork returned null', errors.UNKNOWN_ERROR, {});
                }
                return networks[0];
            });
            _this = _super.call(this, ready_1) || this;
        }
        errors.checkNew(_this, FallbackProvider);
        // Preserve a copy, so we don't get mutated
        _this._providers = providers.slice(0);
        return _this;
    }
    Object.defineProperty(FallbackProvider.prototype, "providers", {
        get: function () {
            // Return a copy, so we don't get mutated
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
                    return resolve(result);
                }).catch(function (error) {
                    if (!firstError) {
                        firstError = error;
                    }
                    setTimeout(next, 0);
                });
            }
            next();
        });
    };
    return FallbackProvider;
}(base_provider_1.BaseProvider));
exports.FallbackProvider = FallbackProvider;
