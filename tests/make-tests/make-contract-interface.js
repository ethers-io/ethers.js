'use strict';

// See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI

var crypto = require('crypto');
var fs = require('fs');

var BN = require('bn.js');
var promiseRationing = require('promise-rationing');
var Web3 = require('web3');

var getAddress = require('../../utils/address.js').getAddress;
var arrayify = require('../../utils/convert').arrayify;

var utils = require('../utils.js');


function addLog(message) {
    fs.appendFileSync('make-contract-interface.log', message + '\n');
}

function id(text) {
    return crypto.createHash('sha256').update(text).digest().toString('hex').substring(0, 10).toUpperCase();
}

process.on('unhandledRejection', function(reason, p){
    console.log('Error: Unhandled promise rejection');
    console.log(reason);
});



var compile = (function() {
    var soljson = require('../soljson.js');
    var _compile = soljson.cwrap("compileJSONCallback", "string", ["string", "number", "number"]);

    function compile(source) {
        return JSON.parse(_compile(JSON.stringify({sources: { "demo.sol": source }}), 0));
    }
    compile.version = JSON.parse(compile('contract Foo { }').contracts['demo.sol:Foo'].metadata).compiler.version
    return compile;
})();

// Create the indent given a tabstop
function indent(tabs) {
    var indent = Buffer.alloc(tabs * 4);
    indent.fill(32);
    return indent.toString('utf8')
}

function recursiveHexlify(object) {
    if (object.type === 'tuple') {
        var result = [];
        object.value.forEach(function(object) {
            result.push(recursiveHexlify(object));
        });
        return {type: 'tuple', value: result};
    }

    if (object.type && object.value != null) {
        object = object.value;
    }

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

var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8549'));

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
        console.dir(value, { depth: null });
        throw new Error('invalid type - ' + value + ' ' + typeof(value));
    }
    return value;
}



function getName(depth) {
    return String.fromCharCode(97 + depth);
}

function getStructName(types) {
    return 'Struct' + id('struct(' + types.join(',') + ')');
}

function getStructSource(types) {
    var source = '';
    types.forEach(function(type, index) {
        var name = getName(index);
        source += indent(2) + type + ' ' + name + ';\n';
    });
    return (indent(1) + 'struct ' + getStructName(types) + ' {\n' + source + indent(1) + '}\n');
}

function populate(name, value, depth, info) {

    value.localName = name;
    if (value.type === 'tuple') {
        info.pragmas['experimental ABIEncoderV2'] = true;

        var source = '';
        var types = [];
        value.value.forEach(function(value, index) {
            var localName = getName(index);
            populate(name + '.' + localName, value, depth + 1, info);

            types.push(value.name);
        });

        if (!value.struct) {
            value.struct = getStructSource(types);
        }

        info.structs[value.struct] = true;

    } else if (Array.isArray(value.value)) {

        if (value.type.substring(value.type.length - 2) === '[]') {
            info.inits.push(indent(2) + value.localName + ' = new ' + value.name + '(' + value.value.length + ');\n');
            value.dynamic = true;
        }

        value.value.forEach(function(value, index) {
            populate(name + '[' + String(index) + ']', value, depth + 1, info);

            if (value.dynamic) {
                info.pragmas['experimental ABIEncoderV2'] = true;
            }
        });

    } else {
        if (value.type === 'string' || value.type === 'bytes') {
            value.dynamic = true;
        }
    }
}

function createContractSource(values, info, comments) {

    var pragmas = { 'solidity ^0.4.18': true };

    var _getName = -1;
    var getName = function() {
        _getName++;
        return String.fromCharCode(97 + parseInt(_getName / 26)) + String.fromCharCode(97 + (_getName % 26));
    }

    var source = '';

    var returnTypes = [];
    values.forEach(function(value, index) {
        returnTypes.push(value.name + ' ' + value.localName);
    });

    var temp = false;

    function dumpValue(value) {

        // Tuple
        if (value.type === 'tuple') {
            value.value.forEach(function(value) {
                dumpValue(value);
            });

        // Array type; do a deep copy
        } else if (value.type.indexOf('[') >= 0) {
            value.value.forEach(function(value) {
                dumpValue(value);
            });

        // Dynamic type: bytes
        } else if (value.type === 'bytes') {
            if (!temp) {
                source += indent(2) + 'bytes memory temp ';
                temp = true;
            } else {
                source += indent(2) + 'temp ';
            }
            source += '= new bytes(' + value.value.length + ');\n';

            source += indent(2) + value.localName + ' = temp;\n';
            source += indent(2) + 'assembly {\n'
            source += indent(3) + 'mstore(temp, ' + value.value.length + ')\n';
            for (var i = 0; i < value.value.length; i++) {
                source += indent(3) + 'mstore8(add(temp, ' + (32 + i) + '), ' + value.value[i] + ')\n';
            }
            source += indent(2) + '}\n'

        // Dynamic type: string
        } else if (value.type === 'string') {
            source += indent(2) + value.localName + ' = "' + value.value + '";\n';

        // Static type; just use the stack
        } else {
            var v = value.value;
            if (Buffer.isBuffer(v)) { v = '0x' + v.toString('hex'); }
            source += indent(2) + value.localName + ' = ' + value.type + '(' + v + ');\n';
        }
    }

    // Recursively (if necessary) set the parameter value
    values.forEach(function(value) {
        dumpValue(value);
    });

    // Pragmas
    var sourcePragma = '';
    Object.keys(info.pragmas).forEach(function(pragma) {
        sourcePragma += 'pragma ' + pragma + ';\n';
    });
    if (sourcePragma.length) { sourcePragma += '\n'; }

    // Structs
    var sourceStructs = '';
    Object.keys(info.structs).forEach(function(struct) {
        sourceStructs += struct + '\n';
    });

    // Initialization code
    var sourceInit = '';
    info.inits.forEach(function(init) {
        sourceInit += init;
    });
    if (sourceInit.length) { sourceInit += '\n'; }

    var sourceComments = '';
    comments.forEach(function(comment) { sourceComments += '// ' + comment + '\n'; });
    if (sourceComments.length) { sourceComments += ' \n'; }

    return [
        sourceComments,
        sourcePragma,
        'contract Test {\n',
        sourceStructs,
        (indent(1) + 'function test() pure returns (' + returnTypes.join(', ') + ') {\n'),
        sourceInit,
        source,
        (indent(1) + '}\n'),
        '}\n',
    ].join('');
}

function compileContract(source, ignoreErrors) {
    try {
        var contracts = compile(source);
        contracts.errors.forEach(function(error) {
            console.log(error);
        });
        var contract = contracts.contracts['demo.sol:Test'];
        if (!contract && ignoreErrors) {
            addLog(source);
            contracts.errors.forEach(function(error) {
                addLog(error);
            });
            addLog('======');
            return null;
        }
        contract.sourceCode = source;
        contract.version = JSON.parse(contract.metadata).compiler.version;
        return contract;
    } catch (error) {
        console.log(error);
        console.log('Failed to compile ========');
        //console.log({types: types, values: values, contract: contract});
        console.log(source);
        console.log('========');
        process.exit();
    }
}

//var Address = '0xbe764deeec446f1c6e9d4c891b0f87148a2f9a00';

//var Output = [];

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


function _check(name, values, info) {
    var test = JSON.stringify(values);

    // Recursively augment the values
    if (!info.inits) { info.inits = []; }
    if (!info.structs) { info.structs = { }; }
    if (!info.pragmas) { info.pragmas = { }; }
    info.pragmas[ 'solidity ^0.4.18'] = true;

    values.forEach(function(value, index) {
        populate('r' + index, value, 0, info)
    });

    function getTypes(result, value) {
        value.forEach(function(value) {
            if (value.type === 'tuple') {
                result.push('tuple(' + getTypes([], value.value).join(',') + ')');
            } else {
                result.push(value.type);
            }
        });
        return result;
    }

    var types = getTypes([], values);

    var source = createContractSource(values, info, [
        ('Test: ' + name),
        ('Comnpiler: ' + compile.version),
        test
    ]);
// MOO
//console.log(source);
//return Promise.resolve();

    var contract = compileContract(source, true);
    if (!contract) {
        console.log('Skipping:', test)
        return Promise.resolve();
    }

    if (!contract) { throw new Error('invalid version'); }

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
            version: contract.version,
//            normalizedValues: JSON.stringify(recursiveHexlify(normalizedValues)),
        };

        return output;
    });
}

function makeTests() {

    var promiseFuncs = [];

    function check(name, types, values, normalizedValues) {
        if (normalizedValues == null) { normalizedValues = values; }
        promiseFuncs.push(function(resolve, reject) {
            var test = [ ];
            types.forEach(function(type, index) {
                test.push({
                    type: type,
                    normalizedValue: normalizedValues[index],
                    value: values[index]
                });
            });
            _check(name, test).then(function(result) {
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
        [Buffer.from('6761766f66796f726b0000000000000000000000000000000000000000000000', 'hex')]
    );
    check('sol-26',
        ['bytes'],
        [Buffer.from('6761766f66796f726b', 'hex')]
    );

    check('sol-27',
        ['string'],
        ['\uD835\uDF63']
    );

    check('sol-28',
        ['address', 'string', 'bytes6[4]', 'int'],
        [
            getAddress("0x97916ef549947a3e0d321485a31dd2715a97d455"),
            "foobar2",
            [
                Buffer.from("a165ab0173c6", 'hex'),
                Buffer.from("f0f37bee9244", 'hex'),
                Buffer.from("c8dc0bf08d2b", 'hex'),
                Buffer.from("c8dc0bf08d2b", 'hex')
            ],
            34
        ]
    );

    check('sol-29',
        ['bytes32'],
        [Buffer.from('731a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b', 'hex')]
    );
    check('sol-30',
        ['bytes'],
        [Buffer.from('731a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b', 'hex')]
    );

    check('sol-31',
        ['bytes32[2]'],
        [[
            Buffer.from('731a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b', 'hex'),
            Buffer.from('731a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b', 'hex')
        ]]
    );

    check('sol-32',
        ['bytes'],
        [Buffer.from('131a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b' +
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
                        var value = Buffer.from(utils.randomBytes(seed + '-' + extraSeed + '-type-0-value', size));
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
                        var value = getAddress(utils.randomHexString(seed + '-' + extraSeed + '-type-2', 20));
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
                        var value = Buffer.from(utils.randomBytes(seed + '-' + extraSeed + '-type-5a', size));
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
            var value = type.value('test-' + j);
            values.push(value.value);
            normalized.push(value.normalized);
        }
        check('random-' + i, types, values, normalized);
    }

    // Bug in solidity or in the VM, not sure, but this fails
    // check('', ['uint8[4][]'], [ [] ]);

    promiseRationing.all(promiseFuncs, 100).then(function(result) {
        //utils.saveTestcase('contract-interface', result);
    }, function(error) {
        console.log('ERROR', error);
    });
}

function makeTestsAbi2() {

    var promiseFuncs = [];

    function check(name, values, info) {
        promiseFuncs.push(function(resolve, reject) {
            _check(name, values, info).then(function(result) {
                resolve(result);
            }, function(error) {
                reject(error);
            });
        });
    };

    var address = '0x0123456789012345678901234567890123456789';
    var longText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

/*
    // Some hand-coded (white-box test cases)
    check('abi2-basic-test', [
        { type: 'address', value: '0x1234567890123456789012345678901234567890' }
    ]);

    check('abi2-empty', [
        { type: 'tuple', value: [ ] },
    ]);

    check('abi2-deeper', [
        { type: 'tuple', value: [
            { type: 'tuple', value: [
                { type: 'uint256', value: 0x22222222222 }
            ] }
        ] }
    ]);

    check('abi2-same-struct', [
        { type: 'tuple', value: [
            { type: 'uint256', value: 18 },
            { type: 'int256', value: -18 },
        ] },
        { type: 'tuple', value: [
            { type: 'uint256', value: 18 },
            { type: 'int256', value: -18 },
        ] },
        { type: 'tuple', value: [
            { type: 'tuple', value: [
                { type: 'tuple', value: [
                    { type: 'uint256', value: 18 },
                    { type: 'int256', value: -18 },
                ] },
            ] }
        ] },
    ]);

    check('abi2-dynamic', [
        { type: 'uint256[]', value: [
            { type: 'uint256', value: 0x123456 },
            { type: 'uint256', value: 0x789abc },
        ] }
    ]);

    check('abi2-nested-dynamic', [
        { type: 'uint256[][]', value: [
            { type: 'uint256[]', value: [
                { type: 'uint256', value: 0x123456 },
                { type: 'uint256', value: 0x789abc },
                { type: 'uint256', value: 0xdef123 },
            ] },
            { type: 'uint256[]', value: [
                { type: 'uint256', value: 0x666666 },
            ] },
        ] }
    ]);

    check('abi2-string-array', [
        { type: 'string[]', value: [
            { type: 'string', value: "Hello" },
            { type: 'string', value: "World" },
        ] }
    ]);



    check('abi2-single', [
        { name: 'StructA', type: 'tuple', value: [
            { type: 'uint256', value: 0x11111111111 }
        ] },
    ]);

    check('abi2-pair', [
        { name: 'StructA', type: 'tuple', value: [
            { type: 'address', value: address },
            { type: 'uint256', value: 0x22222222222 }
        ] },
    ]);

    check('abi2-deeper', [
        { name: 'StructA', type: 'tuple', value: [
            { name: 'StructB', type: 'tuple', value: [
                { type: 'uint256', value: 0x22222222222 }
            ] }
        ] }
    ]);

    check('abi2-very-deep', [
        { name: 'StructA', type: 'tuple', value: [
            { type: 'address', value: address },
            { name: 'StructB', type: 'tuple', value: [
                { type: 'uint32', value: 45 },
                { type: 'uint32', value: 46 },
                { name: 'StructC', type: 'tuple', value: [
                    { type: 'uint32', value: 45 },
                    { type: 'uint256', value: 0x22222222222 },
                    { type: 'tuple', name: 'StructD', value: [
                        { type: 'bool', value: true }
                    ] }
                ] }
            ] },
            { type: 'uint256', value: 0x55559876 },
        ] }
    ]);

    check('abi2-string', [
        { type: 'tuple', name: 'StructA', value: [
            { type: 'string', value: "Hello World" }
        ] }
    ]);

    check('abi2-empty-string', [
        { type: 'tuple', name: 'StructA', value: [
            { type: 'string', value: "" }
        ] }
    ]);

    check('abi2-long-string', [
        { type: 'tuple', name: 'StructA', value: [
            { type: 'string', value: longText }
        ] }
    ]);
*/

    // Procedurally generated test cases (handles some black-box testing)

    function randomTestPart(seed, info) {
        switch (utils.randomNumber(seed + '-type', 0, 7)) {
            case 0:
                return {
                    type: 'address',
                    name: 'address',
                    value: function(extra) {
                        return {
                            type: 'address',
                            name: 'address',
                            value: getAddress(utils.randomHexString(seed + '-address-' + extra, 20, 20))
                        }
                    }
                };
            case 1:
                var sign = (utils.randomNumber(seed + '-number-sign', 0, 2) == 0);
                var type = ((sign ? '': 'u') + 'int');
                var size = utils.randomNumber(seed + '-number-size', 0, 33) * 8;
                if (size !== 0) {
                    type += String(size);
                } else {
                    size = 256;
                }

                return {
                    type: type,
                    name: type,
                    value: function(extra) {
                        var value = new BN(utils.randomHexString(seed + '-number-value-' + extra, 1, size / 8).substring(2), 16);
                        if (sign) {
                            var signBit = (new BN(1)).shln(size - 1);
                            if (!signBit.and(value).isZero()) {
                                value = value.maskn(size - 1).mul(new BN(-1));
                            }
                        }
                        return {
                            type: type,
                            name: type,
                            value: value
                        }
                    }
                }
            case 2:
                return {
                    type: 'bytes',
                    name: 'bytes',
                    value: function(extra) {
                        return {
                            type: 'bytes',
                            name: 'bytes',
                            value: Buffer.from(utils.randomBytes(seed + '-bytes-' + extra, 0, 64))
                        }
                    }
                };
            case 3:
               return {
                   type: 'string',
                   name: 'string',
                   value: function(extra) {
                       return {
                           type: 'string',
                           name: 'string',
                           value: longText.substring(0, utils.randomNumber(seed + '-string-' + extra, 0, longText.length))
                       }
                   }
               };
            case 4:
               var count = utils.randomNumber(seed + '-bytes-count', 1, 33);
               return {
                   type: 'bytes' + String(count),
                   name: 'bytes' + String(count),
                   value: function(extra) {
                       return {
                           type: 'bytes' + String(count),
                           name: 'bytes' + String(count),
                           value: Buffer.from(utils.randomBytes(seed + '-bytes-value-' + extra, count, count))
                       };
                   }
               };
            case 5:
               var subtype = randomTestPart(seed + '-array-subtype', info);
               var count = utils.randomNumber(seed + '-array-count', 0, 4);
               var size = String(count);
               if (count === 0) {
                   count = utils.randomNumber(seed + '-array-size', 0, 4);
                   size = '';
               }

               var type = subtype.type + '[' + size + ']';
               var name = (subtype.name + '[' + size + ']');

               return {
                   type: type,
                   name: name,
                   value: function() {
                       var result = [];
                       for (var i = 0; i < count; i++) {
                           result.push(subtype.value('-array-value-' + i));
                       }
                       return {
                           type: type,
                           name: name,
                           value: result
                       };
                   }
               };

            case 6:
               var subtypes = [];
               var subtypeTypes = [];
               var subtypeNames = [];
               var count = utils.randomNumber(seed + '-tuple-size', 1, 4);
               for (var i = 0; i < count; i++) {
                   var subtype = randomTestPart(seed + '-tuple-subtype-' + i, info);
                   subtypes.push(subtype);
                   subtypeTypes.push(subtype.type);
                   subtypeNames.push(subtype.name);
               }

               var type = 'tuple(' + subtypeTypes.join(',') + ')';
               var name = getStructName(subtypeNames);
               var struct = getStructSource(subtypeNames);
               info.structs[struct] = true;

               return {
                   type: type,
                   name: name,
                   struct: struct,
                   value: function(extra) {
                       var result = [];
                       subtypes.forEach(function(subtype) {
                           result.push(subtype.value(seed + '-tuple-subvalue-' + i));
                       });
                       return {
                           type: 'tuple',
                           name: name,
                           struct: struct,
                           value: result
                       };
                   }
               };

            default:
                throw new Error('invalid case');
        }
    }

    for (var i = 0; i < 2000; i++) {
        //i = 917
        var test = [];
        var info = { pragmas: { 'experimental ABIEncoderV2': true }, structs: {} };
        var count = utils.randomNumber('count-' + i, 1, 5);
        for (var j = 0; j < count; j++) {
            var part = randomTestPart('test-' + i + '-' + j, info)
            test.push(part.value('part-' + j));
        }
        console.dir(test, { depth: null });
        check('random-' + i, test, info);
        //break;
    }

    promiseRationing.all(promiseFuncs, 20).then(function(result) {
        result = result.filter(function(item) { return !!item; } );
        utils.saveTests('contract-interface-abi2', result);
    }, function(error) {
        console.log('ERROR', error);
    });
}

//makeTests();
makeTestsAbi2();
