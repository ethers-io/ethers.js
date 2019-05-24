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
var bytes_1 = require("../utils/bytes");
var networks_1 = require("../utils/networks");
var properties_1 = require("../utils/properties");
var errors = __importStar(require("../errors"));
var defaultProjectId = "7d0d81d0919f4f05b9ab6634be01ee73";
var InfuraProvider = /** @class */ (function (_super) {
    __extends(InfuraProvider, _super);
    function InfuraProvider(network, projectId) {
        var _this = this;
        var standard = networks_1.getNetwork((network == null) ? 'homestead' : network);
        if (projectId == null) {
            projectId = defaultProjectId;
        }
        var host = null;
        switch (standard.name) {
            case 'homestead':
                host = 'mainnet.infura.io';
                break;
            case 'ropsten':
                host = 'ropsten.infura.io';
                break;
            case 'rinkeby':
                host = 'rinkeby.infura.io';
                break;
            case 'goerli':
                host = 'goerli.infura.io';
                break;
            case 'kovan':
                host = 'kovan.infura.io';
                break;
            default:
                errors.throwError('unsupported network', errors.INVALID_ARGUMENT, {
                    argument: "network",
                    value: network
                });
        }
        // New-style Project ID
        if (bytes_1.isHexString("0x" + projectId, 16)) {
            _this = _super.call(this, 'https://' + host + '/v3/' + projectId, standard) || this;
            properties_1.defineReadOnly(_this, 'apiAccessToken', null);
            properties_1.defineReadOnly(_this, 'projectId', projectId);
            // Legacy API Access Token
        }
        else {
            errors.warn("The legacy INFURA apiAccesToken API is deprecated; please upgrade to a Project ID instead (see INFURA dshboard; https://infura.io)");
            _this = _super.call(this, 'https://' + host + '/' + projectId, standard) || this;
            properties_1.defineReadOnly(_this, 'apiAccessToken', projectId);
            properties_1.defineReadOnly(_this, 'projectId', null);
        }
        errors.checkNew(_this, InfuraProvider);
        return _this;
    }
    InfuraProvider.prototype._startPending = function () {
        errors.warn('WARNING: INFURA does not support pending filters');
    };
    InfuraProvider.prototype.getSigner = function (address) {
        return errors.throwError('INFURA does not support signing', errors.UNSUPPORTED_OPERATION, { operation: 'getSigner' });
    };
    InfuraProvider.prototype.listAccounts = function () {
        return Promise.resolve([]);
    };
    return InfuraProvider;
}(json_rpc_provider_1.JsonRpcProvider));
exports.InfuraProvider = InfuraProvider;
