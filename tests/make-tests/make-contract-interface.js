'use strict';

var BN = require('bn.js');
var solc = require('solc');
var ethereumVm = require('ethereumjs-vm');
var ethereumUtil = require('ethereumjs-util');
var promiseRationing = require('promise-rationing');
var Web3 = require('web3');

var contracts = require('../../contracts/index.js');

var bigNumber = require('../../utils/bignumber.js');
var convert = require('../../utils/convert.js');

var utils = require('./utils.js');

// Create the indent given a tabstop
function indent(tabs) {
    var indent = new Buffer(tabs * 4);
    indent.fill(32);
    return indent.toString('utf8')
}

function recursiveHexlify(object) {
    if (typeof(object) === 'number') {
        object = new BN(object);
    }

    if (Array.isArray(object)) {
        var result = [];
        object.forEach(function(object) {
            result.push(recursiveHexlify(object));
        });
        return result;

    } else if (BN.isBN(object)) {
        return {type: 'number', value: object.toString(10)};

    } else if (typeof(object) === 'string') {
        return {type: 'string', value: object};

    } else if (typeof(object) === 'boolean') {
        return {type: 'boolean', value: object};

    } else if (Buffer.isBuffer(object)) {
        return {type: 'buffer', value: utils.hexlify(object)};
    }

    throw new Error('unsupported type - ' + object + ' ' + typeof(object));
}

var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));

/**
 *
 *
 */
function getValue(value) {
    if (Buffer.isBuffer(value)) {
        value = utils.hexlify(value);
    } else if (BN.isBN(value)) {
        value = value.toString(10);
    } else if (typeof(value) !== 'string' && typeof(value) !== 'number' && typeof(value) !== 'boolean') {
        throw new Error('invalid type - ' + value + ' ' + typeof(value));
    }
    return value;
}
function createContractOutput(types, values) {
    var source = 'contract Test {\n';
    source    += '    function test() constant returns (' + types.join(', ') + ') {\n';

    var returns = [];
    for (var i = 0; i < types.length; i++) {
        var name = String.fromCharCode(97 + i);

        // Array type; do a deep copy
        if (types[i].indexOf('[') >= 0) {

            // Each count (or optionally empty) array type
            var arrays = types[i].match(/\[[0-9]*\]/g);

            // Allocate the space (only dynamic arrays require new)
            source += indent(2) + types[i] + ' memory ' + name;
            if (arrays[arrays.length - 1] === '[]') {
                source += ' = new ' + types[i] + '(' + values[i].length+ ')';
            }
            source +=';\n';

            var baseType = types[i].substring(0, types[i].indexOf('['));

            function recursiveSet(item, indices) {
                if (Array.isArray(item)) {
                    item.forEach(function(item, index) {
                        var i = indices.slice();
                        i.unshift(index);
                        recursiveSet(item, i);
                    });
                } else {
                    var loc = '';
                    indices.forEach(function(index) {
                        loc = '[' + index + ']' + loc;
                    })

                    item = getValue(item);

                    //if (item instanceof BN) { item = item.toString(10); }
                    source += indent(2) + name + loc + ' = ' + baseType + '(' + item + ');\n';
                }
            }
            recursiveSet(values[i], []);

        // Dynamic type: bytes
        } else if (types[i] === 'bytes') {
            source += indent(2) + 'bytes memory ' + name + ' = new bytes(' + values[i].length + ');\n';
            source += indent(2) + 'assembly {\n'
            source += indent(3) + 'mstore(' + name + ', ' + values[i].length + ')\n';
            for (var j = 0; j < values[i].length; j++) {
                source += indent(3) + 'mstore8(add(' + name + ', ' + (32 + j) + '), ' + values[i][j] + ')\n';
            }
            source += indent(2) + '}\n'
            /*
            var value = '';
            for (var j = 0; j < values[i].length; j++) {
                value += '\\' + 'x' + values[i].slice(j, j + 1).toString('hex');
            }
            source += '        bytes memory ' + name + ' = "' + value + '";\n';
            */

        // Dynamic type: string
        } else if (types[i] === 'string') {
            source += '        string memory ' + name + ' = "' + values[i] + '";\n';

        // Static type; just use the stack
        } else {
            var value = getValue(values[i]);
            source += '        ' + types[i] + ' ' + name + ' = ' + types[i] + '(' + value + ');\n';
        }

        // Track the name to return
        returns.push(name);
    }

    // Return the values
    source += '        return (' + returns.join(', ') + ');\n';

    source    += '    }\n';
    source    += '}\n';

    try {
        var contract = solc.compile(source, 0);
        contract = contract.contracts.Test;
        contract.sourceCode = source;
        return contract;
    } catch (error) {
        console.log('Failed to compile ========');
        console.log({types: types, values: values, contract: contract});
        console.log(source);
        console.log('========');
        process.exit();
    }
}

var Address = '0xbe764deeec446f1c6e9d4c891b0f87148a2f9a00';

var Output = [];

function web3Promise(method, params) {
    return new Promise(function(resolve, reject) {
        params.push(function(error, result) {
            if (error) {
                console.log(error);
                return reject(error);
            }
            resolve(result);
        });

        web3.eth[method].apply(web3, params);
    });
}

function sendTransaction(transaction) {
    var address =  '0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e';
    transaction.from = address;

    console.log('Sending...');

    return Promise.all([
        web3Promise('getGasPrice', []),
        web3Promise('getTransactionCount', [address, 'pending'])
    ]).then(function(result) {
        transaction.gasPrice = '0x' + result[0].toString(16);
        transaction.gas = "0x55d4a80";
        //transaction.nonce = result[1];
        return web3Promise('sendTransaction', [transaction]);
    });
}

function makeTests() {

    function _check(name, types, values, normalizedValues) {
        if (!normalizedValues) { normalizedValues = values; }

        var contract = createContractOutput(types, values);
        var transaction = { data: '0x' + contract.bytecode };

        return sendTransaction(transaction).then(function(hash) {
            console.log('Transaction', hash);

            return new Promise(function(resolve, reject) {
                function check() {
                    web3Promise('getTransaction', [hash]).then(function(transaction) {
                        if (transaction.blockHash) {
                            console.log('Done', hash);
                            resolve(transaction);
                            return;
                        }
                        console.log('Waiting', hash);
                        setTimeout(check, 1000);
                    }, function(error) {
                        reject(error);
                    })
                }
                check();
            });

        }).then(function(transaction) {
            return new web3Promise('call', [{
                to: transaction.creates,
                data: '0xf8a8fd6d',
            }]);

        }).then(function(result) {
            console.log('Result', result);

            var output = {
                bytecode: '0x' + contract.bytecode,
                result: result,
                interface: contract.interface,
                name: name,
                runtimeBytecode: '0x' + contract.runtimeBytecode,
                source: contract.sourceCode,
                types: JSON.stringify(types),
                values: JSON.stringify(recursiveHexlify(values)),
                normalizedValues: JSON.stringify(recursiveHexlify(normalizedValues)),
            };
            return output;
        });
    }

    var promiseFuncs = [];

    function check(name, types, values, normalizedValues) {
        promiseFuncs.push(function(resolve, reject) {
            _check(name, types, values, normalizedValues).then(function(result) {
                resolve(result);
            }, function(error) {
                reject(error);
            });
        });
    };

    // Test cases: https://github.com/ethereum/solidity.js/blob/master/test/coder.decodeParam.js
    check('sol-1', ['int'], [new BN(1)]);
    check('sol-2', ['int'], [new BN(16)]);

    check('sol-3', ['int'], [new BN(-1)]);
    check('sol-4', ['int256'], [new BN(1)]);
    check('sol-5', ['int256'], [new BN(16)]);
    check('sol-6', ['int256'], [new BN(-1)]);
    check('sol-7', ['int8'], [new BN(16)]);
    check('sol-8', ['int32'], [new BN(16)]);
    check('sol-9', ['int64'], [new BN(16)]);
    check('sol-10', ['int128'], [new BN(16)]);

    check('sol-11', ['uint'], [new BN(1)]);
    check('sol-12', ['uint'], [new BN(16)]);
    check('sol-13', ['uint'], [new BN(-1)], [new BN('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)]);
    check('sol-14', ['uint256'], [new BN(1)]);
    check('sol-15', ['uint256'], [new BN(16)]);
    check('sol-16', ['uint256'], [new BN(-1)], [new BN('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)]);
    check('sol-17', ['uint8'], [new BN(16)]);
    check('sol-18', ['uint32'], [new BN(16)]);
    check('sol-19', ['uint64'], [new BN(16)]);
    check('sol-20', ['uint128'], [new BN(16)]);

    check('sol-21', ['int', 'int'], [new BN(1), new BN(2)]);
    check('sol-22', ['int', 'int'], [new BN(1), new BN(2)]);
    check('sol-23', ['int[2]', 'int'], [[new BN(12), new BN(22)], new BN(3)]);
    check('sol-24', ['int[2]', 'int[]'], [[new BN(32), new BN(42)], [new BN(3), new BN(4), new BN(5)]]);

    check('sol-25',
        ['bytes32'],
        [new Buffer('6761766f66796f726b0000000000000000000000000000000000000000000000', 'hex')]
    );
    check('sol-26',
        ['bytes'],
        [new Buffer('6761766f66796f726b', 'hex')]
    );

    check('sol-27',
        ['string'],
        ['\uD835\uDF63']
    );

    check('sol-28',
        ['address', 'string', 'bytes6[4]', 'int'],
        [
            "0x97916ef549947a3e0d321485a31dd2715a97d455",
            "foobar2",
            [
                new Buffer("a165ab0173c6", 'hex'),
                new Buffer("f0f37bee9244", 'hex'),
                new Buffer("c8dc0bf08d2b", 'hex'),
                new Buffer("c8dc0bf08d2b", 'hex')
            ],
            34
        ]
    );

    check('sol-29',
        ['bytes32'],
        [new Buffer('731a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b', 'hex')]
    );
    check('sol-30',
        ['bytes'],
        [new Buffer('731a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b', 'hex')]
    );

    check('sol-31',
        ['bytes32[2]'],
        [[
            new Buffer('731a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b', 'hex'),
            new Buffer('731a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b', 'hex')
        ]]
    );

    check('sol-32',
        ['bytes'],
        [new Buffer('131a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b' +
                    '231a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b' +
                    '331a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b', 'hex')]
    );

    // Some extra checks for width and sign tests
    check('sol-33', ['uint32'], [14], [new BN(14)]);
    check('sol-34', ['uint32'], [14], [new BN(14)]);
    check('sol-35', ['uint32'], [-14], [new BN(0xfffffff2)]);
    check('sol-36', ['int32'], [14], [new BN(14)]);
    check('sol-37', ['int32'], [-14], [new BN(-14)]);

    check('sol-38', ['int8'], [new BN(1)], [new BN(1)]);
    check('sol-39', ['int8'], [new BN(-1)], [new BN(-1)]);
    check('sol-40', ['int8'], [new BN(189)], [new BN(-67)]);
    check('sol-41', ['int8'], [new BN(-189)], [new BN(67)]);
    check('sol-42', ['int8'], [new BN(257)], [new BN(1)]);

    check('sol-43', ['uint8'], [new BN(343)], [new BN(87)]);
    check('sol-44', ['uint8'], [new BN(-1)], [new BN(255)]);

    check('sol-45', ['uint56[5]'], [[new BN(639), new BN(227), new BN(727), new BN(325), new BN(146)]]);

    function randomTypeValue(seed, onlyStatic) {
        switch (utils.randomNumber(seed + '-type', 0, (onlyStatic ? 5: 8))) {

            // Fixed-size bytes
            case 0:
                var size = utils.randomNumber(seed + '-type-0', 1, 33);
                return {
                    type: 'bytes' + size,
                    value: function(extraSeed) {
                        var value = new Buffer(utils.randomBytes(seed + '-' + extraSeed + '-type-0-value', size));
                        return {
                            value: value,
                            normalized: value
                        }
                    }
                }

            // uint and int
            case 1:
                var signed = (utils.randomNumber(seed + '-type-1a', 0, 2) === 0);
                var type =  (!signed ? 'u': '') + 'int';
                var size = 32;
                if (utils.randomNumber(seed + '-type-1b', 0, 4) > 0) {
                    size = utils.randomNumber(seed + '-type-1c', 1, 33)
                    type += (8 * size);
                }

                return {
                    type: type,
                    value: function(extraSeed) {
                        var mask = '';
                        for (var i = 0; i < size; i++) { mask += 'ff'; }

                        var value = utils.randomNumber(seed + '-' + extraSeed + '-type-1d', -500, 1000);
                        var normalized = (new BN(value)).toTwos(size * 8).and(new BN(mask, 16));
                        if (signed) {
                            normalized = normalized.fromTwos(size * 8);
                        }
                        return {
                            value: value,
                            normalized: normalized
                        };
                    }
                }

            // address
            case 2:
                return {
                    type: 'address',
                    value: function(extraSeed) {
                        var value = utils.randomHexString(seed + '-' + extraSeed + '-type-2', 20);
                        return {
                            value: value,
                            normalized: value
                        };
                    }
                }

            // bool
            case 3:
                return {
                    type: 'bool',
                    value: function(extraSeed) {
                        var value = (utils.randomNumber(seed + '-' + extraSeed + '-type-3', 0, 2) === 0);
                        return {
                            value: value,
                            normalized: value
                        };
                    }
                }

            // fixed-length array of subtype
            case 4:
                // @TODO: Support random(0, 6)... Why is that even possible?
                var size = utils.randomNumber(seed + '-type-4a', 1, 6);

                var subTypeValue = randomTypeValue(seed + '-type-4b', true);
                return {
                    type: subTypeValue.type + '[' + size + ']',
                    value: function(extraSeed) {
                        var values = [];
                        var normalized = [];
                        for (var i = 0; i < size; i++) {
                            var value = subTypeValue.value(seed + '-' + extraSeed + '-4c-' + i);
                            values.push(value.value);
                            normalized.push(value.normalized);
                        }
                        return {
                            value: values,
                            normalized: normalized
                        };
                    }
                }

            // bytes
            case 5:
                return {
                    type: 'bytes',
                    value: function(extraSeed) {
                        var size = utils.randomNumber(seed + '-type-5b', 0, 100);
                        var value = new Buffer(utils.randomBytes(seed + '-' + extraSeed + '-type-5a', size));
                        return {
                            value: value,
                            normalized: value
                        };
                    },
                    skip: 0
                }

            // string
            case 6:
                var text = 'abcdefghijklmnopqrstuvwxyz\u2014ABCDEFGHIJKLMNOPQRSTUVWXYZFOOBARfoobar'
                return {
                    type: 'string',
                    value: function(extraSeed) {
                        var size = utils.randomNumber(seed + '-' + extraSeed + '-type-6', 0, 60);
                        var value = text.substring(0, size);
                        return {
                            value: value,
                            normalized: value
                        };
                    }
                }

            // variable-sized array of subtype
            case 7:
                // @TODO: bug in solidity or VM prevents this from being 0
                var size = utils.randomNumber(seed + '-type-7a', 1, 6);
                var subTypeValue = randomTypeValue(seed + '-type-7b', true);
                return {
                    type: subTypeValue.type + '[]',
                    value: function(extraSeed) {
                        var values = [];
                        var normalized = [];
                        for (var i = 0; i < size; i++) {
                            var value = subTypeValue.value(seed + '-' + extraSeed + '-7c-' + i);
                            values.push(value.value);
                            normalized.push(value.normalized);
                        }
                        return {
                            value: values,
                            normalized: normalized
                        };
                    }
                }
        }
    }

    // @TODO: Test 0 arguments

    // Create a bunch of random test cases
    for (var i = 0; i < 2000; i++) {
        var count = utils.randomNumber('count-' + i, 1, 4);
        var types = [], values = [], normalized = [];;
        for (var j = 0; j < count; j++) {
            var type = randomTypeValue('type-' + i + '-' + j);
            types.push(type.type);
            var value = type.value();
            values.push(value.value);
            normalized.push(value.normalized);
        }
        check('random-' + i, types, values, normalized);
    }

    // Bug in solidity or in the VM, not sure, but this fails
    // check('', ['uint8[4][]'], [ [] ]);

    promiseRationing.all(promiseFuncs, 100).then(function(result) {
        utils.saveTestcase('contract-interface', result);
    }, function(error) {
        console.log('ERROR', error);
    });
}

makeTests();
