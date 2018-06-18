"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var net_1 = __importDefault(require("net"));
var json_rpc_provider_1 = require("./json-rpc-provider");
var properties_1 = require("../utils/properties");
var errors = __importStar(require("../utils/errors"));
var IpcProvider = /** @class */ (function (_super) {
    __extends(IpcProvider, _super);
    function IpcProvider(path, network) {
        var _this = this;
        if (path == null) {
            errors.throwError('missing path', errors.MISSING_ARGUMENT, { arg: 'path' });
        }
        _this = _super.call(this, 'ipc://' + path, network) || this;
        errors.checkNew(_this, IpcProvider);
        properties_1.defineReadOnly(_this, 'path', path);
        return _this;
    }
    // @TODO: Create a connection to the IPC path and use filters instead of polling for block
    IpcProvider.prototype.send = function (method, params) {
        // This method is very simple right now. We create a new socket
        // connection each time, which may be slower, but the main
        // advantage we are aiming for now is security. This simplifies
        // multiplexing requests (since we do not need to multiplex).
        var _this = this;
        var payload = JSON.stringify({
            method: method,
            params: params,
            id: 42,
            jsonrpc: "2.0"
        });
        return new Promise(function (resolve, reject) {
            var stream = net_1.default.connect(_this.path);
            stream.on('data', function (data) {
                try {
                    resolve(JSON.parse(data.toString('utf8')).result);
                    // @TODO: Better pull apart the error
                    stream.destroy();
                }
                catch (error) {
                    reject(error);
                    stream.destroy();
                }
            });
            stream.on('end', function () {
                stream.destroy();
            });
            stream.on('error', function (error) {
                reject(error);
                stream.destroy();
            });
            stream.write(payload);
            stream.end();
        });
    };
    return IpcProvider;
}(json_rpc_provider_1.JsonRpcProvider));
exports.IpcProvider = IpcProvider;
