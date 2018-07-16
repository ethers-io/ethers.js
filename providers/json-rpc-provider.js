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
// See: https://github.com/ethereum/wiki/wiki/JSON-RPC
var provider_1 = require("./provider");
var address_1 = require("../utils/address");
var bytes_1 = require("../utils/bytes");
var networks_1 = require("../utils/networks");
var properties_1 = require("../utils/properties");
var utf8_1 = require("../utils/utf8");
var web_1 = require("../utils/web");
var types_1 = require("../utils/types");
var errors = __importStar(require("../utils/errors"));
function timer(timeout) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, timeout);
    });
}
function getResult(payload) {
    if (payload.error) {
        // @TODO: not any
        var error = new Error(payload.error.message);
        error.code = payload.error.code;
        error.data = payload.error.data;
        throw error;
    }
    return payload.result;
}
function getLowerCase(value) {
    if (value) {
        return value.toLowerCase();
    }
    return value;
}
var JsonRpcSigner = /** @class */ (function (_super) {
    __extends(JsonRpcSigner, _super);
    function JsonRpcSigner(provider, address) {
        var _this = _super.call(this) || this;
        errors.checkNew(_this, JsonRpcSigner);
        properties_1.defineReadOnly(_this, 'provider', provider);
        // Statically attach to a given address
        if (address) {
            properties_1.defineReadOnly(_this, '_address', address);
        }
        return _this;
    }
    Object.defineProperty(JsonRpcSigner.prototype, "address", {
        get: function () {
            if (!this._address) {
                errors.throwError('no sync sync address available; use getAddress', errors.UNSUPPORTED_OPERATION, { operation: 'address' });
            }
            return this._address;
        },
        enumerable: true,
        configurable: true
    });
    JsonRpcSigner.prototype.getAddress = function () {
        if (this._address) {
            return Promise.resolve(this._address);
        }
        return this.provider.send('eth_accounts', []).then(function (accounts) {
            if (accounts.length === 0) {
                errors.throwError('no accounts', errors.UNSUPPORTED_OPERATION, { operation: 'getAddress' });
            }
            return address_1.getAddress(accounts[0]);
        });
    };
    JsonRpcSigner.prototype.getBalance = function (blockTag) {
        return this.provider.getBalance(this.getAddress(), blockTag);
    };
    JsonRpcSigner.prototype.getTransactionCount = function (blockTag) {
        return this.provider.getTransactionCount(this.getAddress(), blockTag);
    };
    JsonRpcSigner.prototype.sendTransaction = function (transaction) {
        var _this = this;
        var tx = properties_1.shallowCopy(transaction);
        if (tx.from == null) {
            tx.from = this.getAddress().then(function (address) {
                if (!address) {
                    return null;
                }
                return address.toLowerCase();
            });
        }
        return properties_1.resolveProperties(tx).then(function (tx) {
            tx = JsonRpcProvider.hexlifyTransaction(tx);
            return _this.provider.send('eth_sendTransaction', [tx]).then(function (hash) {
                return web_1.poll(function () {
                    return _this.provider.getTransaction(hash).then(function (tx) {
                        if (tx === null) {
                            return undefined;
                        }
                        return _this.provider._wrapTransaction(tx, hash);
                    });
                }, { onceBlock: _this.provider }).catch(function (error) {
                    error.transactionHash = hash;
                    throw error;
                });
            });
        });
    };
    JsonRpcSigner.prototype.signMessage = function (message) {
        var _this = this;
        var data = ((typeof (message) === 'string') ? utf8_1.toUtf8Bytes(message) : message);
        return this.getAddress().then(function (address) {
            // https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign
            return _this.provider.send('eth_sign', [address.toLowerCase(), bytes_1.hexlify(data)]);
        });
    };
    JsonRpcSigner.prototype.unlock = function (password) {
        var provider = this.provider;
        return this.getAddress().then(function (address) {
            return provider.send('personal_unlockAccount', [address.toLowerCase(), password, null]);
        });
    };
    return JsonRpcSigner;
}(types_1.Signer));
exports.JsonRpcSigner = JsonRpcSigner;
var JsonRpcProvider = /** @class */ (function (_super) {
    __extends(JsonRpcProvider, _super);
    function JsonRpcProvider(url, network) {
        var _this = this;
        // One parameter, but it is a network name, so swap it with the URL
        if (typeof (url) === 'string') {
            if (network === null && networks_1.getNetwork(url)) {
                network = url;
                url = null;
            }
        }
        if (network) {
            // The network has been specified explicitly, we can use it
            _this = _super.call(this, network) || this;
        }
        else {
            // The network is unknown, query the JSON-RPC for it
            var ready = new Promise(function (resolve, reject) {
                setTimeout(function () {
                    _this.send('net_version', []).then(function (result) {
                        return resolve(networks_1.getNetwork(parseInt(result)));
                    }).catch(function (error) {
                        reject(error);
                    });
                });
            });
            _this = _super.call(this, ready) || this;
        }
        errors.checkNew(_this, JsonRpcProvider);
        // Default URL
        if (!url) {
            url = 'http://localhost:8545';
        }
        if (typeof (url) === 'string') {
            _this.connection = {
                url: url
            };
        }
        else {
            _this.connection = url;
        }
        return _this;
    }
    JsonRpcProvider.prototype.getSigner = function (address) {
        return new JsonRpcSigner(this, address);
    };
    JsonRpcProvider.prototype.listAccounts = function () {
        return this.send('eth_accounts', []).then(function (accounts) {
            return accounts.map(function (a) { return address_1.getAddress(a); });
        });
    };
    JsonRpcProvider.prototype.send = function (method, params) {
        var request = {
            method: method,
            params: params,
            id: 42,
            jsonrpc: "2.0"
        };
        return web_1.fetchJson(this.connection, JSON.stringify(request), getResult);
    };
    JsonRpcProvider.prototype.perform = function (method, params) {
        switch (method) {
            case 'getBlockNumber':
                return this.send('eth_blockNumber', []);
            case 'getGasPrice':
                return this.send('eth_gasPrice', []);
            case 'getBalance':
                return this.send('eth_getBalance', [getLowerCase(params.address), params.blockTag]);
            case 'getTransactionCount':
                return this.send('eth_getTransactionCount', [getLowerCase(params.address), params.blockTag]);
            case 'getCode':
                return this.send('eth_getCode', [getLowerCase(params.address), params.blockTag]);
            case 'getStorageAt':
                return this.send('eth_getStorageAt', [getLowerCase(params.address), params.position, params.blockTag]);
            case 'sendTransaction':
                return this.send('eth_sendRawTransaction', [params.signedTransaction]);
            case 'getBlock':
                if (params.blockTag) {
                    return this.send('eth_getBlockByNumber', [params.blockTag, false]);
                }
                else if (params.blockHash) {
                    return this.send('eth_getBlockByHash', [params.blockHash, false]);
                }
                return Promise.reject(new Error('invalid block tag or block hash'));
            case 'getTransaction':
                return this.send('eth_getTransactionByHash', [params.transactionHash]);
            case 'getTransactionReceipt':
                return this.send('eth_getTransactionReceipt', [params.transactionHash]);
            case 'call':
                return this.send('eth_call', [JsonRpcProvider.hexlifyTransaction(params.transaction), 'latest']);
            case 'estimateGas':
                return this.send('eth_estimateGas', [JsonRpcProvider.hexlifyTransaction(params.transaction)]);
            case 'getLogs':
                if (params.filter && params.filter.address != null) {
                    params.filter.address = getLowerCase(params.filter.address);
                }
                return this.send('eth_getLogs', [params.filter]);
            default:
                break;
        }
        errors.throwError(method + ' not implemented', errors.NOT_IMPLEMENTED, { operation: method });
        return null;
    };
    JsonRpcProvider.prototype._startPending = function () {
        if (this._pendingFilter != null) {
            return;
        }
        var self = this;
        var pendingFilter = this.send('eth_newPendingTransactionFilter', []);
        this._pendingFilter = pendingFilter;
        pendingFilter.then(function (filterId) {
            function poll() {
                self.send('eth_getFilterChanges', [filterId]).then(function (hashes) {
                    if (self._pendingFilter != pendingFilter) {
                        return null;
                    }
                    var seq = Promise.resolve();
                    hashes.forEach(function (hash) {
                        self._emitted['t:' + hash.toLowerCase()] = 'pending';
                        seq = seq.then(function () {
                            return self.getTransaction(hash).then(function (tx) {
                                self.emit('pending', tx);
                                return null;
                            });
                        });
                    });
                    return seq.then(function () {
                        return timer(1000);
                    });
                }).then(function () {
                    if (self._pendingFilter != pendingFilter) {
                        self.send('eth_uninstallFilter', [filterId]);
                        return;
                    }
                    setTimeout(function () { poll(); }, 0);
                    return null;
                }).catch(function (error) { });
            }
            poll();
            return filterId;
        }).catch(function (error) { });
    };
    JsonRpcProvider.prototype._stopPending = function () {
        this._pendingFilter = null;
    };
    // Convert an ethers.js transaction into a JSON-RPC transaction
    //  - gasLimit => gas
    //  - All values hexlified
    //  - All numeric values zero-striped
    // @TODO: Not any, a dictionary of string to strings
    JsonRpcProvider.hexlifyTransaction = function (transaction) {
        var result = {};
        // Some nodes (INFURA ropsten; INFURA mainnet is fine) don't like extra zeros.
        ['gasLimit', 'gasPrice', 'nonce', 'value'].forEach(function (key) {
            if (transaction[key] == null) {
                return;
            }
            var value = bytes_1.hexStripZeros(bytes_1.hexlify(transaction[key]));
            if (key === 'gasLimit') {
                key = 'gas';
            }
            result[key] = value;
        });
        ['from', 'to', 'data'].forEach(function (key) {
            if (transaction[key] == null) {
                return;
            }
            result[key] = bytes_1.hexlify(transaction[key]);
        });
        return result;
    };
    return JsonRpcProvider;
}(provider_1.Provider));
exports.JsonRpcProvider = JsonRpcProvider;
