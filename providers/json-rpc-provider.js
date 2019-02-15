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
var base_provider_1 = require("./base-provider");
var abstract_signer_1 = require("../abstract-signer");
var errors = __importStar(require("../errors"));
var address_1 = require("../utils/address");
var bytes_1 = require("../utils/bytes");
var networks_1 = require("../utils/networks");
var properties_1 = require("../utils/properties");
var utf8_1 = require("../utils/utf8");
var web_1 = require("../utils/web");
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
var _constructorGuard = {};
var JsonRpcSigner = /** @class */ (function (_super) {
    __extends(JsonRpcSigner, _super);
    function JsonRpcSigner(constructorGuard, provider, addressOrIndex) {
        var _this = _super.call(this) || this;
        errors.checkNew(_this, JsonRpcSigner);
        if (constructorGuard !== _constructorGuard) {
            throw new Error('do not call the JsonRpcSigner constructor directly; use provider.getSigner');
        }
        properties_1.defineReadOnly(_this, 'provider', provider);
        // Statically attach to a given address
        if (addressOrIndex) {
            if (typeof (addressOrIndex) === 'string') {
                properties_1.defineReadOnly(_this, '_address', address_1.getAddress(addressOrIndex));
            }
            else if (typeof (addressOrIndex) === 'number') {
                properties_1.defineReadOnly(_this, '_index', addressOrIndex);
            }
            else {
                errors.throwError('invalid address or index', errors.INVALID_ARGUMENT, { argument: 'addressOrIndex', value: addressOrIndex });
            }
        }
        else {
            properties_1.defineReadOnly(_this, '_index', 0);
        }
        return _this;
    }
    JsonRpcSigner.prototype.getAddress = function () {
        var _this = this;
        if (this._address) {
            return Promise.resolve(this._address);
        }
        return this.provider.send('eth_accounts', []).then(function (accounts) {
            if (accounts.length <= _this._index) {
                errors.throwError('unknown account #' + _this._index, errors.UNSUPPORTED_OPERATION, { operation: 'getAddress' });
            }
            _this._address = address_1.getAddress(accounts[_this._index]);
            return _this._address;
        });
    };
    JsonRpcSigner.prototype.getBalance = function (blockTag) {
        return this.provider.getBalance(this.getAddress(), blockTag);
    };
    JsonRpcSigner.prototype.getTransactionCount = function (blockTag) {
        return this.provider.getTransactionCount(this.getAddress(), blockTag);
    };
    JsonRpcSigner.prototype.sendUncheckedTransaction = function (transaction) {
        var _this = this;
        transaction = properties_1.shallowCopy(transaction);
        var fromAddress = this.getAddress().then(function (address) {
            if (address) {
                address = address.toLowerCase();
            }
            return address;
        });
        // The JSON-RPC for eth_sendTransaction uses 90000 gas; if the user
        // wishes to use this, it is easy to specify explicitly, otherwise
        // we look it up for them.
        if (transaction.gasLimit == null) {
            var estimate = properties_1.shallowCopy(transaction);
            estimate.from = fromAddress;
            transaction.gasLimit = this.provider.estimateGas(estimate);
        }
        return Promise.all([
            properties_1.resolveProperties(transaction),
            fromAddress
        ]).then(function (results) {
            var tx = results[0];
            var hexTx = JsonRpcProvider.hexlifyTransaction(tx);
            hexTx.from = results[1];
            return _this.provider.send('eth_sendTransaction', [hexTx]).then(function (hash) {
                return hash;
            }, function (error) {
                if (error.responseText) {
                    // See: JsonRpcProvider.sendTransaction (@TODO: Expose a ._throwError??)
                    if (error.responseText.indexOf('insufficient funds') >= 0) {
                        errors.throwError('insufficient funds', errors.INSUFFICIENT_FUNDS, {
                            transaction: tx
                        });
                    }
                    if (error.responseText.indexOf('nonce too low') >= 0) {
                        errors.throwError('nonce has already been used', errors.NONCE_EXPIRED, {
                            transaction: tx
                        });
                    }
                    if (error.responseText.indexOf('replacement transaction underpriced') >= 0) {
                        errors.throwError('replacement fee too low', errors.REPLACEMENT_UNDERPRICED, {
                            transaction: tx
                        });
                    }
                }
                throw error;
            });
        });
    };
    JsonRpcSigner.prototype.sendTransaction = function (transaction) {
        var _this = this;
        return this.sendUncheckedTransaction(transaction).then(function (hash) {
            return web_1.poll(function () {
                return _this.provider.getTransaction(hash).then(function (tx) {
                    if (tx === null) {
                        return undefined;
                    }
                    return _this.provider._wrapTransaction(tx, hash);
                });
            }, { fastRetry: 250, onceBlock: _this.provider }).catch(function (error) {
                error.transactionHash = hash;
                throw error;
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
}(abstract_signer_1.Signer));
exports.JsonRpcSigner = JsonRpcSigner;
var allowedTransactionKeys = {
    chainId: true, data: true, gasLimit: true, gasPrice: true, nonce: true, to: true, value: true
};
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
    JsonRpcProvider.prototype.getSigner = function (addressOrIndex) {
        return new JsonRpcSigner(_constructorGuard, this, addressOrIndex);
    };
    JsonRpcProvider.prototype.listAccounts = function () {
        return this.send('eth_accounts', []).then(function (accounts) {
            return accounts.map(function (a) { return address_1.getAddress(a); });
        });
    };
    JsonRpcProvider.prototype.send = function (method, params) {
        var _this = this;
        var request = {
            method: method,
            params: params,
            id: 42,
            jsonrpc: "2.0"
        };
        return web_1.fetchJson(this.connection, JSON.stringify(request), getResult).then(function (result) {
            _this.emit('debug', {
                action: 'send',
                request: request,
                response: result,
                provider: _this
            });
            return result;
        });
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
                return this.send('eth_sendRawTransaction', [params.signedTransaction]).catch(function (error) {
                    if (error.responseText) {
                        // "insufficient funds for gas * price + value"
                        if (error.responseText.indexOf('insufficient funds') > 0) {
                            errors.throwError('insufficient funds', errors.INSUFFICIENT_FUNDS, {});
                        }
                        // "nonce too low"
                        if (error.responseText.indexOf('nonce too low') > 0) {
                            errors.throwError('nonce has already been used', errors.NONCE_EXPIRED, {});
                        }
                        // "replacement transaction underpriced"
                        if (error.responseText.indexOf('replacement transaction underpriced') > 0) {
                            errors.throwError('replacement fee too low', errors.REPLACEMENT_UNDERPRICED, {});
                        }
                    }
                    throw error;
                });
            case 'getBlock':
                if (params.blockTag) {
                    return this.send('eth_getBlockByNumber', [params.blockTag, !!params.includeTransactions]);
                }
                else if (params.blockHash) {
                    return this.send('eth_getBlockByHash', [params.blockHash, !!params.includeTransactions]);
                }
                return Promise.reject(new Error('invalid block tag or block hash'));
            case 'getTransaction':
                return this.send('eth_getTransactionByHash', [params.transactionHash]);
            case 'getTransactionReceipt':
                return this.send('eth_getTransactionReceipt', [params.transactionHash]);
            case 'call':
                return this.send('eth_call', [JsonRpcProvider.hexlifyTransaction(params.transaction, { from: true }), params.blockTag]);
            case 'estimateGas':
                return this.send('eth_estimateGas', [JsonRpcProvider.hexlifyTransaction(params.transaction, { from: true })]);
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
                        // @TODO: This should be garbage collected at some point... How? When?
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
    // NOTE: This allows a TransactionRequest, but all values should be resolved
    //       before this is called
    JsonRpcProvider.hexlifyTransaction = function (transaction, allowExtra) {
        // Check only allowed properties are given
        var allowed = properties_1.shallowCopy(allowedTransactionKeys);
        if (allowExtra) {
            for (var key in allowExtra) {
                if (allowExtra[key]) {
                    allowed[key] = true;
                }
            }
        }
        properties_1.checkProperties(transaction, allowed);
        var result = {};
        // Some nodes (INFURA ropsten; INFURA mainnet is fine) don't like leading zeros.
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
}(base_provider_1.BaseProvider));
exports.JsonRpcProvider = JsonRpcProvider;
