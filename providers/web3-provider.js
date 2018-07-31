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
var properties_1 = require("../utils/properties");
var errors = __importStar(require("../utils/errors"));
/*
@TODO
utils.defineProperty(Web3Signer, 'onchange', {

});

*/
var Web3Provider = /** @class */ (function (_super) {
    __extends(Web3Provider, _super);
    function Web3Provider(web3Provider, network) {
        var _this = 
        // HTTP has a host; IPC has a path.
        _super.call(this, web3Provider.host || web3Provider.path || '', network) || this;
        errors.checkNew(_this, Web3Provider);
        if (web3Provider) {
            if (web3Provider.sendAsync) {
                _this._sendAsync = web3Provider.sendAsync.bind(web3Provider);
            }
            else if (web3Provider.send) {
                _this._sendAsync = web3Provider.send.bind(web3Provider);
            }
        }
        if (!web3Provider || !_this._sendAsync) {
            errors.throwError('invalid web3Provider', errors.INVALID_ARGUMENT, { arg: 'web3Provider', value: web3Provider });
        }
        properties_1.defineReadOnly(_this, '_web3Provider', web3Provider);
        return _this;
    }
    Web3Provider.prototype.send = function (method, params) {
        var _this = this;
        // Metamask complains about eth_sign (and on some versions hangs)
        if (method == 'eth_sign' && this._web3Provider.isMetaMask) {
            // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
            method = 'personal_sign';
            params = [params[1], params[0]];
        }
        return new Promise(function (resolve, reject) {
            var request = {
                method: method,
                params: params,
                id: 42,
                jsonrpc: "2.0"
            };
            _this._sendAsync(request, function (error, result) {
                if (error) {
                    reject(error);
                    return;
                }
                if (result.error) {
                    // @TODO: not any
                    var error = new Error(result.error.message);
                    error.code = result.error.code;
                    error.data = result.error.data;
                    reject(error);
                    return;
                }
                resolve(result.result);
            });
        });
    };
    return Web3Provider;
}(json_rpc_provider_1.JsonRpcProvider));
exports.Web3Provider = Web3Provider;
