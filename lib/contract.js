// "coder" is not MIT... We need to find/make an MIT compatible implementation
var coder = require('../node_modules/web3/lib/solidity/coder.js');

var utils = require('./utils.js');

function defineFrozen(object, name, value) {
    var frozen = JSON.stringify(value);
    Object.defineProperty(object, name, {
        enumerable: true,
        get: function() { return JSON.parse(frozen); }
    });
}

function getKeys(params, key) {
    if (!Array.isArray(params)) { throw new Error('invalid params'); }

    var result = [];

    for (var i = 0; i < params.length; i++) {
        if (typeof(params[i][key]) !== 'string') { throw new Error('invalid abi'); }
        // @TODO: Check type are valid?
        result.push(params[i][key]);
    }

    return result;
}

function Contract(abi) {
    if (!(this instanceof Contract)) { throw new Error('missing new'); }

    //defineProperty(this, 'address', address);

    // Wrap this up as JSON so we can return a "copy" and avoid mutation
    defineFrozen(this, 'abi', abi);

    var methods = [], events = [];
    abi.forEach(function(method) {

        switch (method.type) {
            case 'function':
                methods.push(method.name);
                func = (function() {
                    var inputTypes = getKeys(method.inputs, 'type');
                    var outputTypes = getKeys(method.outputs, 'type');

                    var func = function() {
                        var signature = method.name + '(' + getKeys(method.inputs, 'type').join(',') + ')';
                        var result = {
                            name: method.name,
                            signature: signature,
                        };

                        var params = Array.prototype.slice.call(arguments, 0);

                        if (params.length < inputTypes.length) {
                            throw new Error('missing parameter');
                        } else if (params.length > inputTypes.length) {
                            throw new Error('too many parameters');
                        }

                        signature = '0x' + utils.sha3(signature).slice(0, 4).toString('hex');

                        result.data = signature + coder.encodeParams(inputTypes, params);
                        if (method.constant) {
                            result.type = 'call';
                            result.parse = function(data) {
                                return coder.decodeParams(
                                    outputTypes,
                                    utils.hexOrBuffer(data).toString('hex')
                                )
                            };
                        } else {
                            result.type = 'transaction';
                        }

                        return result;
                    }

                    defineFrozen(func, 'inputs', getKeys(method.inputs, 'name'));
                    defineFrozen(func, 'outputs', getKeys(method.outputs, 'name'));

                    return func;
                })();
                break;

            case 'event':
                events.push(method.name);
                func = (function() {
                    var inputTypes = getKeys(method.inputs, 'type');
                    var func = function() {
                        var signature = method.name + '(' + getKeys(method.inputs, 'type').join(',') + ')';
                        var result = {
                            inputs: method.inputs,
                            name: method.name,
                            type: 'filter',
                            signature: signature,
                            topics: ['0x' + utils.sha3(signature).toString('hex')],
                        };
                        result.parse = function(data) {
                            return coder.decodeParams(
                                inputTypes,
                                utils.hexOrBuffer(data).toString('hex')
                            );
                        };
                        return result;
                    }
                    defineFrozen(func, 'inputs', getKeys(method.inputs, 'name'));
                    return func;
                })();
                break;

            default:
                func = (function() {
                    return function() {
                        return {type: 'unknown'}
                    }
                })();
                break;
        }
        utils.defineProperty(this, method.name, func);
    }, this);

    defineFrozen(this, 'methods', methods);
    defineFrozen(this, 'events', events);
}

module.exports = Contract;
