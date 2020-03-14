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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var base_provider_1 = require("./base-provider");
var bytes_1 = require("../utils/bytes");
var properties_1 = require("../utils/properties");
var web_1 = require("../utils/web");
var errors = __importStar(require("../errors"));
///////////////////////////////
// The transaction has already been sanitized by the calls in Provider
function getTransactionString(transaction) {
    var result = [];
    for (var key in transaction) {
        if (transaction[key] == null) {
            continue;
        }
        var value = bytes_1.hexlify(transaction[key]);
        if ({ gasLimit: true, gasPrice: true, nonce: true, value: true }[key]) {
            value = bytes_1.hexStripZeros(value);
        }
        result.push(key + '=' + value);
    }
    return result.join('&');
}
function getResult(result) {
    // getLogs, getHistory have weird success responses
    if (result.status == 0 && (result.message === 'No records found' || result.message === 'No transactions found')) {
        return result.result;
    }
    if (result.status != 1 || result.message != 'OK') {
        // @TODO: not any
        var error = new Error('invalid response');
        error.result = JSON.stringify(result);
        throw error;
    }
    return result.result;
}
function getJsonResult(result) {
    if (result.jsonrpc != '2.0') {
        // @TODO: not any
        var error = new Error('invalid response');
        error.result = JSON.stringify(result);
        throw error;
    }
    if (result.error) {
        // @TODO: not any
        var error = new Error(result.error.message || 'unknown error');
        if (result.error.code) {
            error.code = result.error.code;
        }
        if (result.error.data) {
            error.data = result.error.data;
        }
        throw error;
    }
    return result.result;
}
// The blockTag was normalized as a string by the Provider pre-perform operations
function checkLogTag(blockTag) {
    if (blockTag === 'pending') {
        throw new Error('pending not supported');
    }
    if (blockTag === 'latest') {
        return blockTag;
    }
    return parseInt(blockTag.substring(2), 16);
}
var defaultApiKey = "8FG3JMZ9USS4NTA6YKEKHINU56SEPPVBJR";
var EtherscanProvider = /** @class */ (function (_super) {
    __extends(EtherscanProvider, _super);
    function EtherscanProvider(network, apiKey) {
        var _this = _super.call(this, network) || this;
        errors.checkNew(_this, EtherscanProvider);
        var name = 'invalid';
        if (_this.network) {
            name = _this.network.name;
        }
        var baseUrl = null;
        switch (name) {
            case 'homestead':
                baseUrl = 'https://api.etherscan.io';
                break;
            case 'ropsten':
                baseUrl = 'https://api-ropsten.etherscan.io';
                break;
            case 'rinkeby':
                baseUrl = 'https://api-rinkeby.etherscan.io';
                break;
            case 'kovan':
                baseUrl = 'https://api-kovan.etherscan.io';
                break;
            case 'goerli':
                baseUrl = 'https://api-goerli.etherscan.io';
                break;
            default:
                throw new Error('unsupported network');
        }
        properties_1.defineReadOnly(_this, 'baseUrl', baseUrl);
        properties_1.defineReadOnly(_this, 'apiKey', apiKey || defaultApiKey);
        return _this;
    }
    EtherscanProvider.prototype.perform = function (method, params) {
        var _this = this;
        var url = this.baseUrl;
        var apiKey = '';
        if (this.apiKey) {
            apiKey += '&apikey=' + this.apiKey;
        }
        var get = function (url, procFunc) {
            return web_1.fetchJson(url, null, procFunc || getJsonResult).then(function (result) {
                _this.emit('debug', {
                    action: 'perform',
                    request: url,
                    response: result,
                    provider: _this
                });
                return result;
            });
        };
        switch (method) {
            case 'getBlockNumber':
                url += '/api?module=proxy&action=eth_blockNumber' + apiKey;
                return get(url);
            case 'getGasPrice':
                url += '/api?module=proxy&action=eth_gasPrice' + apiKey;
                return get(url);
            case 'getBalance':
                // Returns base-10 result
                url += '/api?module=account&action=balance&address=' + params.address;
                url += '&tag=' + params.blockTag + apiKey;
                return get(url, getResult);
            case 'getTransactionCount':
                url += '/api?module=proxy&action=eth_getTransactionCount&address=' + params.address;
                url += '&tag=' + params.blockTag + apiKey;
                return get(url);
            case 'getCode':
                url += '/api?module=proxy&action=eth_getCode&address=' + params.address;
                url += '&tag=' + params.blockTag + apiKey;
                return get(url, getJsonResult);
            case 'getStorageAt':
                url += '/api?module=proxy&action=eth_getStorageAt&address=' + params.address;
                url += '&position=' + params.position;
                url += '&tag=' + params.blockTag + apiKey;
                return get(url, getJsonResult);
            case 'sendTransaction':
                url += '/api?module=proxy&action=eth_sendRawTransaction&hex=' + params.signedTransaction;
                url += apiKey;
                return get(url).catch(function (error) {
                    if (error.responseText) {
                        // "Insufficient funds. The account you tried to send transaction from does not have enough funds. Required 21464000000000 and got: 0"
                        if (error.responseText.toLowerCase().indexOf('insufficient funds') >= 0) {
                            errors.throwError('insufficient funds', errors.INSUFFICIENT_FUNDS, {});
                        }
                        // "Transaction with the same hash was already imported."
                        if (error.responseText.indexOf('same hash was already imported') >= 0) {
                            errors.throwError('nonce has already been used', errors.NONCE_EXPIRED, {});
                        }
                        // "Transaction gas price is too low. There is another transaction with same nonce in the queue. Try increasing the gas price or incrementing the nonce."
                        if (error.responseText.indexOf('another transaction with same nonce') >= 0) {
                            errors.throwError('replacement fee too low', errors.REPLACEMENT_UNDERPRICED, {});
                        }
                    }
                    throw error;
                });
            case 'getBlock':
                if (params.blockTag) {
                    url += '/api?module=proxy&action=eth_getBlockByNumber&tag=' + params.blockTag;
                    if (params.includeTransactions) {
                        url += '&boolean=true';
                    }
                    else {
                        url += '&boolean=false';
                    }
                    url += apiKey;
                    return get(url);
                }
                return Promise.reject(new Error('getBlock by blockHash not implemeneted'));
            case 'getTransaction':
                url += '/api?module=proxy&action=eth_getTransactionByHash&txhash=' + params.transactionHash;
                url += apiKey;
                return get(url);
            case 'getTransactionReceipt':
                url += '/api?module=proxy&action=eth_getTransactionReceipt&txhash=' + params.transactionHash;
                url += apiKey;
                return get(url);
            case 'call': {
                var transaction = getTransactionString(params.transaction);
                if (transaction) {
                    transaction = '&' + transaction;
                }
                url += '/api?module=proxy&action=eth_call' + transaction;
                //url += '&tag=' + params.blockTag + apiKey;
                if (params.blockTag !== 'latest') {
                    return Promise.reject(new Error('EtherscanProvider does not support blockTag for call'));
                }
                url += apiKey;
                return get(url);
            }
            case 'estimateGas': {
                var transaction = getTransactionString(params.transaction);
                if (transaction) {
                    transaction = '&' + transaction;
                }
                url += '/api?module=proxy&action=eth_estimateGas&' + transaction;
                url += apiKey;
                return get(url);
            }
            case 'getLogs':
                url += '/api?module=logs&action=getLogs';
                try {
                    if (params.filter.fromBlock) {
                        url += '&fromBlock=' + checkLogTag(params.filter.fromBlock);
                    }
                    if (params.filter.toBlock) {
                        url += '&toBlock=' + checkLogTag(params.filter.toBlock);
                    }
                    if (params.filter.blockHash) {
                        try {
                            errors.throwError("Etherscan does not support blockHash filters", errors.UNSUPPORTED_OPERATION, {
                                operation: "getLogs(blockHash)"
                            });
                        }
                        catch (error) {
                            return Promise.reject(error);
                        }
                    }
                    if (params.filter.address) {
                        url += '&address=' + params.filter.address;
                    }
                    // @TODO: We can handle slightly more complicated logs using the logs API
                    if (params.filter.topics && params.filter.topics.length > 0) {
                        if (params.filter.topics.length > 1) {
                            throw new Error('unsupported topic format');
                        }
                        var topic0 = params.filter.topics[0];
                        if (typeof (topic0) !== 'string' || topic0.length !== 66) {
                            throw new Error('unsupported topic0 format');
                        }
                        url += '&topic0=' + topic0;
                    }
                }
                catch (error) {
                    return Promise.reject(error);
                }
                url += apiKey;
                var self = this;
                return get(url, getResult).then(function (logs) {
                    var txs = {};
                    var seq = Promise.resolve();
                    logs.forEach(function (log) {
                        seq = seq.then(function () {
                            if (log.blockHash != null) {
                                return null;
                            }
                            log.blockHash = txs[log.transactionHash];
                            if (log.blockHash == null) {
                                return self.getTransaction(log.transactionHash).then(function (tx) {
                                    txs[log.transactionHash] = tx.blockHash;
                                    log.blockHash = tx.blockHash;
                                    return null;
                                });
                            }
                            return null;
                        });
                    });
                    return seq.then(function () {
                        return logs;
                    });
                });
            case 'getEtherPrice':
                if (this.network.name !== 'homestead') {
                    return Promise.resolve(0.0);
                }
                url += '/api?module=stats&action=ethprice';
                url += apiKey;
                return get(url, getResult).then(function (result) {
                    return parseFloat(result.ethusd);
                });
            default:
                break;
        }
        return _super.prototype.perform.call(this, method, params);
    };
    // @TODO: Allow startBlock and endBlock to be Promises
    EtherscanProvider.prototype.getHistory = function (addressOrName, startBlock, endBlock) {
        var _this = this;
        var url = this.baseUrl;
        var apiKey = '';
        if (this.apiKey) {
            apiKey += '&apikey=' + this.apiKey;
        }
        if (startBlock == null) {
            startBlock = 0;
        }
        if (endBlock == null) {
            endBlock = 99999999;
        }
        return this.resolveName(addressOrName).then(function (address) {
            url += '/api?module=account&action=txlist&address=' + address;
            url += '&startblock=' + startBlock;
            url += '&endblock=' + endBlock;
            url += '&sort=asc' + apiKey;
            return web_1.fetchJson(url, null, getResult).then(function (result) {
                _this.emit('debug', {
                    action: 'getHistory',
                    request: url,
                    response: result,
                    provider: _this
                });
                var output = [];
                result.forEach(function (tx) {
                    ['contractAddress', 'to'].forEach(function (key) {
                        if (tx[key] == '') {
                            delete tx[key];
                        }
                    });
                    if (tx.creates == null && tx.contractAddress != null) {
                        tx.creates = tx.contractAddress;
                    }
                    var item = base_provider_1.BaseProvider.checkTransactionResponse(tx);
                    if (tx.timeStamp) {
                        item.timestamp = parseInt(tx.timeStamp);
                    }
                    output.push(item);
                });
                return output;
            });
        });
    };
    return EtherscanProvider;
}(base_provider_1.BaseProvider));
exports.EtherscanProvider = EtherscanProvider;
