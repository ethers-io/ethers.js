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
var json_rpc_provider_1 = require("./json-rpc-provider");
var networks_1 = require("../utils/networks");
var properties_1 = require("../utils/properties");
var errors = __importStar(require("../utils/errors"));
var InfuraProvider = /** @class */ (function (_super) {
    __extends(InfuraProvider, _super);
    function InfuraProvider(network, apiAccessToken) {
        var _this = this;
        network = networks_1.getNetwork((network == null) ? 'homestead' : network);
        var host = null;
        switch (network.name) {
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
        _this = _super.call(this, 'https://' + host + '/' + (apiAccessToken || ''), network) || this;
        errors.checkNew(_this, InfuraProvider);
        properties_1.defineReadOnly(_this, 'apiAccessToken', apiAccessToken || null);
        return _this;
    }
    InfuraProvider.prototype._startPending = function () {
        console.log('WARNING: INFURA does not support pending filters');
    };
    InfuraProvider.prototype.getSigner = function (address) {
        errors.throwError('INFURA does not support signing', errors.UNSUPPORTED_OPERATION, { operation: 'getSigner' });
        return null;
    };
    InfuraProvider.prototype.listAccounts = function () {
        return Promise.resolve([]);
    };
    return InfuraProvider;
}(json_rpc_provider_1.JsonRpcProvider));
exports.InfuraProvider = InfuraProvider;
