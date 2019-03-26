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
var errors = __importStar(require("../errors"));
// Provider for connecting to Nodesmith's hosted JSON RPC endpoints
var NodesmithProvider = /** @class */ (function (_super) {
    __extends(NodesmithProvider, _super);
    function NodesmithProvider(apiKey, network) {
        var _this = this;
        var standardNetwork = networks_1.getNetwork(network || 'homestead');
        var supportedNetworks = {
            homestead: 'mainnet',
            ropsten: 'ropsten',
            rinkeby: 'rinkeby',
            goerli: 'goerli',
            kovan: 'kovan'
        };
        if (Object.keys(supportedNetworks).indexOf(standardNetwork.name) < 0) {
            errors.throwError('unsupported network', errors.INVALID_ARGUMENT, {
                argument: "network",
                value: network
            });
        }
        if (!apiKey) {
            errors.throwError('missing required api key. Get one at https://nodesmith.io', errors.INVALID_ARGUMENT, {
                argument: "apiKey",
                value: apiKey
            });
        }
        var networkName = supportedNetworks[standardNetwork.name];
        var url = "https://ethereum.api.nodesmith.io/v1/" + networkName + "/jsonrpc?apiKey=" + apiKey;
        _this = _super.call(this, url, standardNetwork) || this;
        properties_1.defineReadOnly(_this, 'apiKey', apiKey);
        errors.checkNew(_this, NodesmithProvider);
        return _this;
    }
    NodesmithProvider.prototype._startPending = function () {
        errors.warn('WARNING: NODESMITH does not support pending filters');
    };
    NodesmithProvider.prototype.getSigner = function (address) {
        return errors.throwError('NODESMITH does not support signing', errors.UNSUPPORTED_OPERATION, { operation: 'getSigner' });
    };
    return NodesmithProvider;
}(json_rpc_provider_1.JsonRpcProvider));
exports.NodesmithProvider = NodesmithProvider;
