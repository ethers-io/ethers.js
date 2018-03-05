'use strict';

// See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI

var throwError = require('../utils/throw-error');

var utils = (function() {
    var convert = require('../utils/convert');
    var properties = require('../utils/properties');
    var utf8 = require('../utils/utf8');

    return {
        defineFrozen: properties.defineFrozen,
        defineProperty: properties.defineProperty,

        coder: require('../utils/abi-coder').defaultCoder,

        arrayify: convert.arrayify,
        concat: convert.concat,
        isHexString: convert.isHexString,

        toUtf8Bytes: utf8.toUtf8Bytes,

        keccak256: require('../utils/keccak256'),
    };
})();

function parseParams(params) {
    var names = [];
    var types = [];

    params.forEach(function(param) {
        if (param.components != null) {
            if (param.type.substring(0, 5) !== 'tuple') {
                throw new Error('internal error; report on GitHub');
            }
            var suffix = '';
            var arrayBracket = param.type.indexOf('[');
            if (arrayBracket >= 0) { suffix = param.type.substring(arrayBracket); }

            var result = parseParams(param.components);
            names.push({ name: (param.name || null), names: result.names });
            types.push('tuple(' + result.types.join(',') + ')' + suffix)
        } else {
            names.push(param.name || null);
            types.push(param.type);
        }
    });

    return {
        names: names,
        types: types
    }
}

function populateDescription(object, items) {
    for (var key in items) {
        utils.defineProperty(object, key, items[key]);
    }
    return object;
}

/**
 *  - bytecode (optional; only for deploy)
 *  - type ("deploy")
 */
function DeployDescription() { }

/**
 *  - name
 *  - signature
 *  - sighash
 *  - 
 *  - 
 *  - 
 *  - 
 *  - type: ("call" | "transaction")
 */
function FunctionDescription() { }

/**
 *  - anonymous
 *  - name
 *  - signature
 *  - parse
 *  - topics
 *  - inputs
 *  - type ("event")
 */
function EventDescription() { }

function Indexed(value) {
    utils.defineProperty(this, 'indexed', true);
    utils.defineProperty(this, 'hash', value);
}

function Result() {}

function Interface(abi) {
    if (!(this instanceof Interface)) { throw new Error('missing new'); }

    if (typeof(abi) === 'string') {
        try {
            abi = JSON.parse(abi);
        } catch (error) {
            throwError('invalid abi', { input: abi });
        }
    }

    utils.defineFrozen(this, 'abi', abi);

    var methods = {}, events = {}, deploy = null;

    utils.defineProperty(this, 'functions', methods);
    utils.defineProperty(this, 'events', events);

    function addMethod(method) {

        switch (method.type) {
            case 'constructor':
                var func = (function() {
                    var inputParams = parseParams(method.inputs);

                    var func = function(bytecode) {
                        if (!utils.isHexString(bytecode)) {
                            throwError('invalid bytecode', { input: bytecode });
                        }

                        var params = Array.prototype.slice.call(arguments, 1);
                        if (params.length < inputParams.types.length) {
                            throwError('missing parameter');
                        } else if (params.length > inputParams.types.length) {
                            throwError('too many parameters');
                        }

                        var result = {
                            bytecode: bytecode + utils.coder.encode(inputParams.names, inputParams.types, params).substring(2),
                            type: 'deploy'
                        }

                        return populateDescription(new DeployDescription(), result);
                    }

                    utils.defineFrozen(func, 'inputs', inputParams);
                    utils.defineProperty(func, 'payable', (method.payable == null || !!method.payable))

                    return func;
                })();

                if (!deploy) { deploy = func; }

                break;

            case 'function':
                var func = (function() {
                    var inputParams = parseParams(method.inputs);
                    var outputParams = parseParams(method.outputs);

                    var signature = '(' + inputParams.types.join(',') + ')';
                    signature = signature.replace(/tuple/g, '');
                    signature = method.name + signature;

                    var sighash = utils.keccak256(utils.toUtf8Bytes(signature)).substring(0, 10);
                    var func = function() {
                        var result = {
                            name: method.name,
                            signature: signature,
                            sighash: sighash,
                            type: ((method.constant) ? 'call': 'transaction')
                        };

                        var params = Array.prototype.slice.call(arguments, 0);

                        if (params.length < inputParams.types.length) {
                            throwError('missing parameter');
                        } else if (params.length > inputParams.types.length) {
                            throwError('too many parameters');
                        }

                        result.data = sighash + utils.coder.encode(inputParams.names, inputParams.types, params).substring(2);
                        result.parse = function(data) {
                            return utils.coder.decode(
                                outputParams.names,
                                outputParams.types,
                                utils.arrayify(data)
                            );
                        };

                        return populateDescription(new FunctionDescription(), result);
                    }

                    utils.defineFrozen(func, 'inputs', inputParams);
                    utils.defineFrozen(func, 'outputs', outputParams);

                    utils.defineProperty(func, 'payable', (method.payable == null || !!method.payable))

                    utils.defineProperty(func, 'signature', signature);
                    utils.defineProperty(func, 'sighash', sighash);

                    return func;
                })();

                // Expose the first (and hopefully unique named function
                if (method.name && methods[method.name] == null) {
                    utils.defineProperty(methods, method.name, func);
                }

                // Expose all methods by their signature, for overloaded functions
                if (methods[func.signature] == null) {
                    utils.defineProperty(methods, func.signature, func);
                }

                break;

            case 'event':
                var func = (function() {
                    var inputParams = parseParams(method.inputs);

                    var signature = '(' + inputParams.types.join(',') + ')';
                    signature = signature.replace(/tuple/g, '');
                    signature = method.name + signature;

                    var result = {
                        anonymous: (!!method.anonymous),
                        name: method.name,
                        signature: signature,
                        type: 'event'
                    };

                    result.parse = function(topics, data) {
                        if (data == null) {
                            data = topics;
                            topics = null;
                        }

                        // Strip the signature off of non-anonymous topics
                        if (topics != null && !method.anonymous) { topics = topics.slice(1); }

                        var inputNamesIndexed = [], inputNamesNonIndexed = [];
                        var inputTypesIndexed = [], inputTypesNonIndexed = [];
                        var inputDynamic = [];
                        method.inputs.forEach(function(input, index) {
                            var type = inputParams.types[index];
                            var name = inputParams.names[index];

                            if (input.indexed) {
                                if (type === 'string' || type === 'bytes' || type.indexOf('[') >= 0 || type.substring(0, 5) === 'tuple') {
                                    inputTypesIndexed.push('bytes32');
                                    inputDynamic.push(true);
                                } else {
                                    inputTypesIndexed.push(type);
                                    inputDynamic.push(false);
                                }
                                inputNamesIndexed.push(name);
                            } else {
                                inputNamesNonIndexed.push(name);
                                inputTypesNonIndexed.push(type);
                                inputDynamic.push(false);
                            }
                        });

                        if (topics != null) {
                            var resultIndexed = utils.coder.decode(
                                inputNamesIndexed,
                                inputTypesIndexed,
                                utils.concat(topics)
                            );
                        }

                        var resultNonIndexed = utils.coder.decode(
                            inputNamesNonIndexed,
                            inputTypesNonIndexed,
                            utils.arrayify(data)
                        );

                        var result = new Result();
                        var nonIndexedIndex = 0, indexedIndex = 0;
                        method.inputs.forEach(function(input, index) {
                            if (input.indexed) {
                                if (topics == null) {
                                    result[index] = new Indexed(null);

                                } else if (inputDynamic[index]) {
                                    result[index] = new Indexed(resultIndexed[indexedIndex++]);
                                } else {
                                    result[index] = resultIndexed[indexedIndex++];
                                }
                            } else {
                                result[index] = resultNonIndexed[nonIndexedIndex++];
                            }
                            if (input.name) { result[input.name] = result[index]; }
                        });

                        result.length = method.inputs.length;

                        return result;
                    };

                    var func =  populateDescription(new EventDescription(), result)
                    utils.defineFrozen(func, 'topics', [ utils.keccak256(utils.toUtf8Bytes(signature)) ]);
                    utils.defineFrozen(func, 'inputs', inputParams);
                    return func;
                })();

                // Expose the first (and hopefully unique) event name
                if (method.name && events[method.name] == null) {
                    utils.defineProperty(events, method.name, func);
                }

                // Expose all events by their signature, for overloaded functions
                if (methods[func.signature] == null) {
                    utils.defineProperty(methods, func.signature, func);
                }

                break;

            case 'fallback':
                // Nothing to do for fallback
                break;

            default:
                console.log('WARNING: unsupported ABI type - ' + method.type);
                break;
        }
    };

    this.abi.forEach(addMethod, this);

    // If there wasn't a constructor, create the default constructor
    if (!deploy) {
        addMethod({type: 'constructor', inputs: []});
    }

    utils.defineProperty(this, 'deployFunction', deploy);
}

module.exports = Interface;
