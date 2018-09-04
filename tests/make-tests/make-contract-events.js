'use strict';

var crypto = require('crypto');

var promiseRationing = require('promise-rationing');

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8549'));

var BN = require('bn.js');

var web3Coder = require('web3/lib/solidity/coder');

var getAddress = require('../../utils/address.js').getAddress;
var keccak256 = require('../../utils/keccak256');
var utils = require('../utils');

process.on('unhandledRejection', function(reason, p){
    console.log('Error: Unhandled promise rejection');
    console.log(reason);
});

var compile = (function() {
    var soljson = require('../soljson-4.19.js');
    var _compile = soljson.cwrap("compileJSONCallback", "string", ["string", "number", "number"]);

    function compile(source) {
        return JSON.parse(_compile(JSON.stringify({sources: { "demo.sol": source }}), 0));
    }
    compile.version = JSON.parse(compile('contract Foo { }').contracts['demo.sol:Foo'].metadata).compiler.v$
    return compile;
})();

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

    //console.log('Sending...');

    return Promise.all([
        web3Promise('getGasPrice', []),
        web3Promise('getTransactionCount', [address, 'pending'])
    ]).then(function(result) {
        transaction.gasPrice = '0x' + result[0].toString(16);
        transaction.gas = "0x55d4a80";
        return web3Promise('sendTransaction', [transaction]);
    });
}

function waitForTransaction(hash) {
    return new Promise(function(resolve, reject) {
        function check() {
            web3Promise('getTransactionReceipt', [hash]).then(function(transaction) {
                if (transaction && transaction.blockHash) {
                    resolve(transaction);
                    return;
                }
                setTimeout(check, 1000);
            }, function(error) {
                reject(error);
            });
        }
        check();
    });
}

// Create the indent given a tabstop
function indent(tabs) {
    var indent = Buffer.alloc(tabs * 4);
    indent.fill(32);
    return indent.toString('utf8')
}

function id(text) {
    return crypto.createHash('sha256').update(text).digest().toString('hex').substring(0, 10).toUpperCase();
}

function createContractSource(test, comments) {
    var events = '';
    var source = '';

    var types = [];
    var named = [];
    var values = [];
    var returns = [];
    test.params.forEach(function(param, index) {
        types.push(param.type);
        named.push(param.type + (param.indexed ? ' indexed': '') + ' p' + index);

        if (param.type === 'string') {
            source += (indent(2) + 's' + index + ' = "' + param.value + '";\n');

        } else if (param.type === 'bool') {
            source += (indent(2) + 's' + index + ' = ' + (param.value ? 'true': 'false') + ';\n');

        } else if (param.type === 'bytes') {
            var value = Buffer.from(param.value.substring(2), 'hex');
            source += indent(2) + 's' + index + ' = new bytes(' + value.length + ');\n';
            source += indent(2) + 'assembly {\n';
            source += indent(3) + 'mstore(s' + index + ', ' + value.length + ')\n';
            for (var i = 0; i < value.length; i++) {
                source += indent(3) + 'mstore8(add(s' + index + ', ' + (32 + i) + '), ' + value[i] + ')\n';
            }
            source += indent(2) + '}\n'

        } else if (param.type.indexOf('[') >= 0) {
            if (param.type.substring(param.type.length - 2) === '[]') {
                source += indent(2) + 's' + index + ' = new ' + param.type + '(' + param.value.length + ');\n';
            }

            var baseType = param.type.substring(0, param.type.indexOf('['));
            function dump(prefix, value) {
                if (Array.isArray(value)) {
                    value.forEach(function(value, index) {
                        dump(prefix + '[' + index + ']', value);
                    });
                } else {
                    source += indent(2) + prefix + ' = ' + baseType + '(' + value + ');\n';
                }
            }
            dump('s' + index, param.value);

        } else {
            source += (
                indent(2) +
                's' + index + ' = ' +
                param.type + '(' + param.value + ');\n'
            );
        }
        returns.push(param.type + ' s' + index);
        values.push('s' + index);
    });

    events += indent(1) + 'event testEvent(' + named.join(', ') + ')' + (test.anonymous ? ' anonymous': '') + ';\n';
    source += indent(2) + 'testEvent(' + values.join(', ') + ');\n';
    ['keccak256', 'ripemd160', 'sha256'].forEach(function(funcName) {
        events += indent(1) + 'event test_' + funcName + '(bytes32 value);\n';
        source += indent(2) + 'test_' + funcName + '(' + funcName + '(' + values.join(', ') + '));\n';
    });

    var sourceInit = '';

    var signature =  'function test() public returns (' + returns.join(', ') + ') {\n';
    if (returns.length === 0) {
        signature =  'function test() public {\n';
    }

    var sourceComments = '';
    comments.forEach(function(comment) {
        sourceComments += '// ' + comment + '\n';
    });
    if (sourceComments.length) { sourceComments += '\n'; }

    return [
        sourceComments,
        'contract Test {\n',
        events,
        '\n',
        (indent(1) + signature),
        sourceInit,
        source,
        (indent(1) + '}\n'),
        '}\n'
    ].join('')
}

function isHashed(value) {
    return (value === 'string' || value === 'bytes' || value.indexOf('[') >= 0);
}

function makeTests() {
    var tests = [];

    tests.push({
        name: 'simple-1',
        params: [
            { type: 'address', value: '0x0123456789012345678901234567890123456789' }
        ]
    });

    tests.push({
        name: 'simple-2',
        params: [
            { indexed: true, type: 'address', value: '0x0123456789012345678901234567890123456789' }
        ]
    });

    tests.push({
        name: 'simple-3',
        anonymous: true,
        params: [
            { type: 'address', value: '0x0123456789012345678901234567890123456789' }
        ]
    });

    tests.push({
        name: 'simple-4',
        anonymous: true,
        params: [
            { indexed: true, type: 'address', value: '0x0123456789012345678901234567890123456789' }
        ]
    });

    tests.push({
        name: 'mixed',
        params: [
            { indexed: true, type: 'uint256', value: '0x0123' },
            { indexed: false, type: 'uint256', value: '0x5678' },
            { indexed: true, type: 'uint256', value: '0x9012' },
            { indexed: true, type: 'uint256', value: '0x3456' },
        ]
    });

    tests.push({
        name: 'string',
        params: [
            { type: 'string', value: 'Hello World' }
        ]
    });

    tests.push({
        name: 'string-indexed',
        params: [
            { indexed: true, type: 'string', value: 'Hello World' }
        ]
    });

    tests.push({
        name: 'bytes',
        params: [
            { type: 'bytes', value: '0x314159' }
        ]
    });

    tests.push({
        name: 'bytes-indexed',
        params: [
            { indexed: true, type: 'bytes', value: '0x314159' }
        ]
    });

    tests.push({
        name: 'array',
        params: [
            { type: 'uint256[3]', value: ['0x31', '0x41', '0x59' ] }
        ]
    });

    tests.push({
        name: 'array-indexed',
        params: [
            { indexed: true, type: 'uint256[3]', value: ['0x31', '0x41', '0x59' ] }
        ]
    });

    tests.push({
        name: 'array-2d',
        params: [
            { type: 'uint256[2][3]', value: [
                ['0x31', '0x41'],
                ['0x87', '0x65'],
                ['0x12', '0x19'],
            ] }
        ]
    });

    tests.push({
        name: 'array-2d-indexed',
        params: [
            { indexed: true, type: 'uint256[2][3]', value: [
                ['0x31', '0x41'],
                ['0x87', '0x65'],
                ['0x12', '0x19'],
            ] }
        ]
    });

    tests.push({
        name: 'array-dynamic',
        params: [
            { type: 'uint256[2][]', value: [
                ['0x31', '0x41'],
                ['0x87', '0x65'],
                ['0x12', '0x19'],
                ['0x99', '0x88'],
            ] }
        ]
    });

    tests.push({
        name: 'array-dynamic-indexed',
        params: [
            { indexed: true, type: 'uint256[2][]', value: [
                ['0x31', '0x41'],
                ['0x87', '0x65'],
                ['0x12', '0x19'],
                ['0x99', '0x88'],
            ] }
        ]
    });

    tests.push({
        name: 'bytes5-array',
        params: [
            { type: 'bytes5[2]', value: [
                '0x1122334455',
                '0x6677889900'
            ] }
        ]
    });

    function generate(seed, onlyStatic) {
        switch (utils.randomNumber(seed + '-type', 0, (onlyStatic ? 4: 7))) {
            case 0:
                return {
                    type: 'address',
                    value: function(extra) {
                        return utils.randomHexString(seed + '-address-' + extra, 20, 20);
                    }
                };
            case 1:
                var sign = (utils.randomNumber(seed + '-numberSign', 0, 2) == 0);
                var type = ((sign ? '': 'u') + 'int');
                var size = utils.randomNumber(seed + '-numberSize', 0, 33) * 8;
                if (size !== 0) {
                    type += String(size);
                } else {
                    size = 256;
                }

                return {
                    type: type,
                    value: function(extra) {
                        var value = new BN(utils.randomHexString(seed + '-numberValue-' + extra, 1, size / 8).substring(2), 16);
                        if (sign) {
                            var signBit = (new BN(1)).shln(size - 1);
                            if (!signBit.and(value).isZero()) {
                                value = value.maskn(size - 1).mul(new BN(-1));
                            }
                        }
                        if (value.isNeg()) {
                            return '-0x' + value.toString('hex').substring(1);
                        }
                        return '0x' + value.toString('hex');
                    }
                }
            case 2:
               var count = utils.randomNumber(seed + '-bytesCount', 1, 33);
               return {
                   type: 'bytes' + String(count),
                   value: function(extra) {
                       return utils.randomHexString(seed + '-bytesValue-' + extra, count, count);
                   }
               };
            case 3:
                return {
                    type: 'bool',
                    value: function(extra) {
                       return utils.randomNumber(seed + '-bool-' + extra, 0, 2) ? true: false;
                    }
                };
            case 4:
               var longText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
               return {
                   type: 'string',
                   value: function(extra) {
                       return longText.substring(0, utils.randomNumber(seed + '-string-' + extra, 0, longText.length));
                   }
               };
            case 5:
                return {
                    type: 'bytes',
                    value: function(extra) {
                        return utils.randomHexString(seed + '-bytes-' + extra, 0, 67);
                    }
                }
            case 6:
               var kind = generate(seed + '-arrayKind', true);
               var depth = utils.randomNumber(seed + '-arrayDepth', 1, 4);
               var sizes = [];
               for (var i = 0; i < depth; i++) {
                   // Letting this lowerbound be 0 crashes the compiler...
                   sizes.push(utils.randomNumber(seed + '-arraySize-' + i, 1, 4));
               }

               var suffix = '';
               sizes.forEach(function(size, index) {
                   if (index === 0 && utils.randomNumber(seed + 'arrayDynamic', 0, 2) === 1) {
                       suffix = '[]' + suffix;
                   } else {
                       suffix = '[' + size + ']' + suffix;
                   }
               });

               return {
                   type: kind.type + suffix,
                   value: function(extra) {
                       function dump(sizes, extra) {
                           var result = [];
                           for (var i = 0; i < sizes[0]; i++) {
                               if (sizes.length === 1) {
                                   result.push(kind.value(extra + '-' + i));
                               } else {
                                   result.push(dump(sizes.slice(1), extra + '-' + sizes[0] + '-' + i));
                               }
                           }
                           return result;
                       }
                       return dump(sizes, '-value-' + extra);
                   }
               }
        }
    }

    for (var i = 0; i < 2000; i++) {
        var name = 'random-' + i;
        var seed = name;

        var params = [];

        var count = utils.randomNumber(seed + '-count', 0, 7);
        for (var j = 0; j < count; j++) {
            var generator = generate(seed + '-param-' + j)
            var param = generator;
            param.value = generator.value('-generated-' + j);
            params.push(param);
        }

        // May collide; not a huge deal and much easier than being perfectly uniform
        var indexedCount = utils.randomNumber(seed + '-indexedCount', 0, 3);
        if (indexedCount > count) { indexedCount = count; }
        for (var j = 0; j < indexedCount; j++) {
            var index = utils.randomNumber(seed + '-indexed-' + j, 0, count);
            //console.log(params, index);
            params[index].indexed = true;
        }

        tests.push({
            name: name,
            anonymous: ((utils.randomNumber(seed + '-anonymous', 0, 2) === 0) ? false: true),
            params: params
        });
    }


    var promiseFuncs = [];

    tests.forEach(function(test) {
        promiseFuncs.push(function(resolve, reject) {

            var source = createContractSource(test, [ ('Test: ' + test.name), JSON.stringify(test) ]);
            console.log(source);

            var contracts = compile(source);
            if (!contracts || !contracts.contracts || !contracts.contracts['demo.sol:Test']) {
                console.log(contracts);
                console.log(test);
                console.log(source);
                console.log('Bailing');
                process.exit();
            }

            var contract = contracts.contracts['demo.sol:Test'];
            //console.log(contract);

            var tx = { data: ('0x' + contract.bytecode) };
            return sendTransaction(tx).then(function(hash) {
                return waitForTransaction(hash);

            }).then(function(tx) {
                return sendTransaction({
                    to: tx.contractAddress,
                    data: '0xf8a8fd6d'
                }).then(function(hash) {
                    return waitForTransaction(hash);
                });

            }).then(function(tx) {
                if (tx.logs.length !== 4) {
                    console.log('What?', tx);
                    process.exit(1);
                }

                var types = [];
                var values = [];
                var hashed = [];
                var indexed = [];
                var normalizedValues = [];
                test.params.forEach(function(param) {
                    types.push(param.type);
                    indexed.push(param.indexed);
                    if (param.indexed && isHashed(param.type)) {
                        hashed.push(true);
                        if (param.type === 'string') {
                            normalizedValues.push(keccak256(Buffer.from(param.value, 'utf8')));

                        } else if (param.type === 'bytes') {
                            normalizedValues.push(keccak256(Buffer.from(param.value.substring(2), 'hex')));

                        } else if (param.type.indexOf('[') >= 0) {
                            var compute = param.type;
                            if (compute.substring(compute.length - 2) === '[]') {
                                compute = compute.substring(0, compute.length - 2);
                                compute += '[' + param.value.length + ']';
                            }

                            var baseType = compute.substring(0, compute.indexOf('['));

                            function dump(input) {
                                if (Array.isArray(input)) {
                                    var result = [];
                                    input.forEach(function(i) {
                                        result.push(dump(i));
                                    });
                                    return result;
                                }

                                if (baseType === 'address') {
                                    return input;
                                }

                                if (baseType.substring(0, 5) === 'bytes') {
                                    return input;
                                }

                                if (typeof(input) === 'boolean') {
                                    return input;
                                }

                                return web3.toBigNumber(input);
                            }

                            var web3Value = dump(param.value);

                            // The web3 coder has lots of bugs, but it does fine as long as there
                            // is only one type and nothing is dynamic
                            var encoded = web3Coder.encodeParams([ compute ], [ web3Value ]);
                            normalizedValues.push(keccak256(Buffer.from(encoded, 'hex')));

                        } else {
                            throw new Error('unknown hashed type');
                        }
                    } else {
                        hashed.push(false);
                        normalizedValues.push(param.value);
                    }
                    values.push(param.value);
                });

                resolve({
                    event: {
                        bytecode: '0x' + contract.bytecode,
                        data: tx.logs[0].data,
                        hashed: hashed,
                        indexed: indexed,
                        interface: contract.interface,
                        name: test.name,
                        source: source,
                        topics: tx.logs[0].topics,
                        types: types,
                        normalizedValues: normalizedValues,
                        values: values
                    },
                    solidityHash: {
                        name: test.name,
                        types: types,
                        keccak256: tx.logs[1].data,
                        ripemd160: tx.logs[2].data,
                        sha256: tx.logs[3].data,
                        values: values,
                    }
                });
            }).catch(function(error) {
                console.log('TTT', test);
                reject(error);
            });
        });
    });

    promiseRationing.all(promiseFuncs, 40).then(function(results) {
        console.log('complete', results);
        var events = [];
        var solidityHashes = [];
        results.forEach(function(result) {
            events.push(result.event);
            solidityHashes.push(result.solidityHash);
        });
        utils.saveTests('contract-events', events);
        utils.saveTests('solidity-hashes', solidityHashes);
    }, function(error) {
        console.log(error);
    });
}

makeTests();
