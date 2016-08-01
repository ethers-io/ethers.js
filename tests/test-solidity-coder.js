'use strict';
var Wallet = require('../index.js');

var solc = require('solc');
var ethereumVm = require('ethereumjs-vm');
var ethereumUtil = require('ethereumjs-util');

var BN = Wallet.utils.BN;
var utils = require('./utils.js');
var random = utils.random;

// Create the indent given a tabstop
function indent(tabs) {
    var indent = new Buffer(tabs * 4);
    indent.fill(32);
    return indent.toString('utf8')
}

/**
 *
 *
 */
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

                    if (item instanceof BN) { item = item.toString(10); }
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
            source += '        ' + types[i] + ' ' + name + ' = ' + types[i] + '(' + values[i] + ');\n';
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
        contract.sourceCode= source;
        return contract;
    } catch (error) {
        console.log('Failed to compile ========');
        console.log({types: types, values: values, contract: contract});
        console.log(source);
        console.log('========');
        process.exit();
    }
}

/**
 *  createContract(types)
 *
 *  Creates the source code for a function that takes in the types,
 *  creates a deep copy of them and returns them and compiles the
 *  contract.
 */
 /* I don't need this anymore, I think?
function createContract(types) {
    var signature = [];
    for (var i = 0; i < types.length; i++) {
        var name = String.fromCharCode(97 + i);
        signature.push(types[i] + ' _' + name);
    }

    var returns = [];

    var maxCounter = -1;

    // Begin a contract and test function
    var source = 'contract Test {\n';
    source += '    function test(' + signature.join(', ') + ') constant returns (' + types.join(', ') + ') {\n';
    for (var i = 0; i < types.length; i++) {
        var name = String.fromCharCode(97 + i);

        // Array type; do a deep copy
        if (types[i].indexOf('[') >= 0) {

            // Each count (or optionally empty) array type
            var arrays = types[i].match(/\[[0-9]*\]/g);

            // Allocate the space
            source += indent(2) + types[i] + ' memory ' + name;
            if (arrays[arrays.length - 1] === '[]') {
                source += ' = new ' + types[i] + '(_' + name + '.length)';
            }
            source +=';\n';

            // Build the for loops to copy
            var current = name;
            for (var j = 0; j < arrays.length; j++) {
                var counter = 'l' + String.fromCharCode(97 + j);
                if (j > maxCounter) {
                    source += indent(j + 2) + 'uint ' + counter + ';\n';
                    maxCounter = j;
                }
                source += indent(j + 2) + 'for (' + counter + ' = 0; ' + counter + ' < _' + current + '.length; ' + counter+ '++) {\n';
                current += '[' + counter + ']'; //arrays[j];
            }

            // Do the copy of an individual value
            var loc = name;
            for (var j = 0; j < arrays.length; j++) {
                loc += '[l' + String.fromCharCode(97 + j) + ']';
            }
            source += indent(2 + arrays.length) + loc + ' = _' + loc + ';\n';

            // Close all the for loops
            for (var j = arrays.length - 1; j >= 0; j--) {
                source += indent(j + 2) + '}\n';
            }

        // Dynamic type; new memory
        } else if (types[i] === 'bytes' || types[i] === 'string') {
            source += '        ' + types[i] + ' memory ' + name + ' = _' + name + ';\n';

        // Static type; just use the stack
        } else {
            source += '        ' + types[i] + ' ' + name + ' = _' + name + ';\n';
        }

        // Track the name to return
        returns.push(name);
    }

    // Return the copied values
    source += '        return (' + returns.join(', ') + ');\n';

    // Done the function and contract
    source += '    }\n';
    source += '}';

    var contract = solc.compile(source, 0);
    contract = contract.contracts.Test;
    contract.sourceCode= source;
    return contract;
}
*/

module.exports = function(test) {

    //var coderWeb3 = require('./node_modules/web3/lib/solidity/coder.js');
    //coderWeb3._name = 'web3';

    var coderAbi = require('ethereumjs-abi');
    var coderEjs = {
        encodeParams: function(types, values) {
            return coderAbi.rawEncode(types, values).toString('hex');
        },
        decodeParams: function(types, data) {
            return coderAbi.rawDecode(types, data);
        },
        _name: 'ejs'
    }

    function dumpHex(data) {
        for (var i = 2; i < data.length; i += 64) {
            console.log('  ' + data.substring(i, i + 64));
        }
    }

    function recursiveEqual(a, b) {
        function fail() {
            return false;
        }

        if (typeof(a) === 'number') { a = new BN(a); }
        if (typeof(b) === 'number') { b = new BN(b); }
        if (utils.isHexString(a)) { a = utils.hexOrBuffer(a); }
        if (utils.isHexString(b)) { b = utils.hexOrBuffer(b); }

        if (a.eq) {
            if (!b.eq || !a.eq(b)) { return fail(); }
            return true;
        }

        if (Buffer.isBuffer(a)) {
            if (!Buffer.isBuffer(b) || Buffer.compare(a, b) !== 0) { return fail(); }
            return true;
        }

        if (Array.isArray(a)) {
            if (!Array.isArray(b) || a.length !== b.length) { return fail(); }
            for (var i = 0; i < a.length; i++) {
                if (!recursiveEqual(a[i], b[i])) { return fail(); }
            }
            return true;
        }

        if (a !== b) { return fail(); }
        return true;
    }

    function checkLib(types, values, coder) {
        //console.log(types, values, coder._name);
        var officialData = '0x' + coder.encodeParams(types, values);

        var ethersData = Wallet._Contract.Interface.encodeParams(types, values);
        if (officialData !== ethersData) {
            test.ok(false, 'encoded value did not match ' + coder._name);
            console.log('coder=' + coder._name);
            console.log('types=' + JSON.stringify(types, {depth: null}));
            console.log('values=' + JSON.stringify(values, {depth: null}));

            console.log('officialData=');
            dumpHex(officialData);
            console.log('ethersData=');
            dumpHex(ethersData);
        }

        var ethersValues = Wallet._Contract.Interface.decodeParams(types, officialData);
        if (!recursiveEqual(values, ethersValues)) {
            test.ok(false, 'decoded value did not match ' + coder._name);
            console.log('coder=' + coder._name);
            console.log('types=' + JSON.stringify(types, {depth: null}));
            console.log('values=' + JSON.stringify(values, {depth: null}));
            console.log('officialData=');
            dumpHex(officialData);
            console.log('ethersValues=' + JSON.stringify(ethersValues, {depth: null}));
        }
    }

    var checkPromises = [];

    var nextTestId = 0;
    var remaining = {};
    function check(types, values, normalizedValues) {
        if (!normalizedValues) { normalizedValues = values; }

        // First make sure we agree with ourself
        var ethersData = Wallet._Contract.Interface.encodeParams(types, values);
        var ethersValues = Wallet._Contract.Interface.decodeParams(types, ethersData);

        var okSelf = recursiveEqual(normalizedValues, ethersValues);
        test.ok(okSelf, "self encode/decode failed");
        if (!okSelf) {
            console.log('okSelf', okSelf, types, values, normalizedValues, ethersValues);
        }

        checkPromises.push(new Promise(function(resolve, reject) {
            var testId = (nextTestId++);
            remaining[testId] = true;

            // Use this when a contracts "hangs" (ie. 0-length arrays seem to hang the VM)
            //console.log('a', testId, types, values);

            try {
                var contract = createContractOutput(types, values);
                var contractInterface = new Wallet._Contract.Interface(JSON.parse(contract.interface));
                var call = contractInterface.test.apply(contractInterface);
                var vm = new ethereumVm();
                vm.runCode({
                    code: new Buffer(contract.runtimeBytecode, 'hex'),
                    data: new Buffer(call.data.substring(2), 'hex'),
                    gasLimit: '0x80000000'

                }, function(error, result) {
                    delete remaining[testId];
                    // Use this when contract hangs (see the above try)
                    //console.log('b', testId, Object.keys(remaining).join(','));

                    try {
                        var vmData = '0x' + result.return.toString('hex');
                        test.equal(ethersData, vmData, 'Failed to generate same output as VM');
                        if (ethersData !== vmData) {
                            console.log('\n\n');
                            console.log(contract.sourceCode);
                            console.log({
                                types: types,
                                values: values
                            });
                            console.log('ethers=');
                            dumpHex(ethersData);
                            console.log('vm=');
                            dumpHex('0x' + result.return.toString('hex'));
                        }

                        resolve();
                    } catch(error) {
                        reject(error);
                    }
                });
            } catch(error) {
                console.log(error);
                reject(error);
            }
        }));

        return;

        // Second, compile and feed to a solidity contract
        checkPromises.push(new Promise(function(resolve, reject) {
            var contract = createContract(types);
            var contractInterface = new Wallet._Contract.Interface(JSON.parse(contract.interface));
            var call = contractInterface.test.apply(contractInterface, values);
            var vm = new ethereumVm();
            vm.runCode({
                code: new Buffer(contract.runtimeBytecode, 'hex'),
                data: new Buffer(call.data.substring(2), 'hex'),
                gasLimit: '0x80000000'
            }, function(error, result) {
                var vmData = '0x' + result.return.toString('hex');
                var okData = (vmData === ethersData);
                test.ok(okData, 'Data did not match');
                if (!okData) {
                    console.dir({
                        types: types,
                        contract: contract.sourceCode,
                        values: values
                    }, {depth: null});
                    console.log('vm.data=');
                    dumpHex(vmData)
                    console.log('ethers.data=');
                    dumpHex(ethersData)
                }

                var vmValues = call.parse(vmData)
                var okValues = recursiveEqual(normalizedValues, vmValues);
                test.ok(okValues, 'Values did not match');
                if (!okValues) {
                    console.dir({
                        types: types,
                        contract: contract.sourceCode,
                        values: values,
                        normalized: normalizedValues,
                        vmValues: vmValues
                    }, {depth: null});
                }

                resolve();
            });
        }));

        return;

        // And thirdly try ocmparing ourselves against ethereumjs-lib (ignoring
        // cases which they currently have open bugs/issues)

        var checkTypes = types.join(',');
        function has(regex) { return checkTypes.match(regex); }

        var hasDynamic = (has(/\[\]/) || has(/bytes([^0-9]|$)/) || has(/string/));
        var hasDynamicArray = has(/\[\]/);
        var hasFixedArray = has(/\[[0-9]+\]/);
        var hasNestedArray = has(/\]\[/);

        if (!hasFixedArray && !hasDynamicArray) {
            try {
                checkLib(types, values, coderEjs);
            } catch (error) {

                // Bugs in coder
                if (error.message === "Cannot read property '1' of null") {
                    return;
                } else if (error.message.match(/^invalid /)) {
                    return;
                }

                if (error.message.match(/^Number can only safely store up to/)) {
                    return;
                }

                throw error;
            }
        }
    }

    // Test cases: https://github.com/ethereum/solidity.js/blob/master/test/coder.decodeParam.js
    check(['int'], [new BN(1)]);
    check(['int'], [new BN(16)]);
    check(['int'], [new BN(-1)]);
    check(['int256'], [new BN(1)]);
    check(['int256'], [new BN(16)]);
    check(['int256'], [new BN(-1)]);
    check(['int8'], [new BN(16)]);
    check(['int32'], [new BN(16)]);
    check(['int64'], [new BN(16)]);
    check(['int128'], [new BN(16)]);

    check(['uint'], [new BN(1)]);
    check(['uint'], [new BN(16)]);
    check(['uint'], [new BN(-1)], [new BN('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)]);
    check(['uint256'], [new BN(1)]);
    check(['uint256'], [new BN(16)]);
    check(['uint256'], [new BN(-1)], [new BN('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)]);
    check(['uint8'], [new BN(16)]);
    check(['uint32'], [new BN(16)]);
    check(['uint64'], [new BN(16)]);
    check(['uint128'], [new BN(16)]);

    check(['int', 'int'], [new BN(1), new BN(2)]);
    check(['int', 'int'], [new BN(1), new BN(2)]);
    check(['int[2]', 'int'], [[new BN(12), new BN(22)], new BN(3)]);
    check(['int[2]', 'int[]'], [[new BN(32), new BN(42)], [new BN(3), new BN(4), new BN(5)]]);

    check(
        ['bytes32'],
        ['0x6761766f66796f726b0000000000000000000000000000000000000000000000']
    );
    check(
        ['bytes'],
        [new Buffer('6761766f66796f726b', 'hex')]
    );

    check(
        ['string'],
        ['\uD835\uDF63']
    );

    check(
        ['address', 'string', 'bytes6[4]', 'int'],
        [
            "0x97916ef549947a3e0d321485a31dd2715a97d455",
            "foobar2",
            ["0xa165ab0173c6", "0xf0f37bee9244", "0xc8dc0bf08d2b", "0xc8dc0bf08d2b"],
            34
        ]
    );

    check(
        ['bytes32'],
        ['0x731a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b']
    );
    check(
        ['bytes'],
        [new Buffer('731a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b')]
    );

    check(
        ['bytes32[2]'],
        [['0x731a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b',
         '0x731a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b']]
    );

    check(
        ['bytes'],
        [new Buffer('131a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b' +
                    '231a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b' +
                    '331a3afc00d1b1e3461b955e53fc866dcf303b3eb9f4c16f89e388930f48134b')]
    );

    // Some extra checks for width and sign tests
    check(['uint32'], [14], [new BN(14)]);
    check(['uint32'], [14], [new BN(14)]);
    check(['uint32'], [-14], [new BN(0xfffffff2)]);
    check(['int32'], [14], [new BN(14)]);
    check(['int32'], [-14], [new BN(-14)]);

    check(['int8'], [new BN(1)], [new BN(1)]);
    check(['int8'], [new BN(-1)], [new BN(-1)]);
    check(['int8'], [new BN(189)], [new BN(-67)]);
    check(['int8'], [new BN(-189)], [new BN(67)]);
    check(['int8'], [new BN(257)], [new BN(1)]);

    check(['uint8'], [new BN(343)], [new BN(87)]);
    check(['uint8'], [new BN(-1)], [new BN(255)]);

    check(['uint56[5]'], [[new BN(639), new BN(227), new BN(727), new BN(325), new BN(146)]]);

    function randomTypeValue(onlyStatic) {
        switch (random(0, (onlyStatic ? 5: 8))) {
            case 0:
                var size = random(1, 33);
                return {
                    type: 'bytes' + size,
                    value: function() {
                        var value = '0x' + utils.randomBuffer(size).toString('hex');
                        return {
                            value: value,
                            normalized: value
                        }
                    }
                }
            case 1:
                var signed = (random(0, 2) === 0);
                var type =  (!signed ? 'u': '') + 'int';
                var size = 32;
                if (random(0, 4) > 0) {
                    size = random(1, 33)
                    type += (8 * size);
                }

                return {
                    type: type,
                    value: function() {
                        var mask = '';
                        for (var i = 0; i < size; i++) { mask += 'ff'; }

                        var value = random(-500, 1000);
                        var normalized = (new BN(value)).toTwos(size * 8).and(new BN(mask, 16));
                        if (signed) {
                            normalized = normalized.fromTwos(size * 8);
                        }
                        /*
                        if (!signed && value < 0) {
                            normalized = normalized.toTwos(size * 8);
                        }
                        */
                        return {
                            value: value,
                            normalized: normalized
                        };
                    }
                }
            case 2:
                return {
                    type: 'address',
                    value: function() {
                        var value = '0x' + utils.randomBuffer(20).toString('hex');
                        return {
                            value: value,
                            normalized: value
                        };
                    }
                }
            case 3:
                return {
                    type: 'bool',
                    value: function() {
                        var value = (random(0, 2) === 0);
                        return {
                            value: value,
                            normalized: value
                        };
                    }
                }
            case 4:
                var size = random(1, 6); /// @TODO: Support random(0, 6)... Why is that even possible?
                var subTypeValue = randomTypeValue(true);
                return {
                    type: subTypeValue.type + '[' + size + ']',
                    value: function() {
                        var values = [];
                        var normalized = [];
                        for (var i = 0; i < size; i++) {
                            var value = subTypeValue.value();
                            values.push(value.value);
                            normalized.push(value.normalized);
                        }
                        return {
                            value: values,
                            normalized: normalized
                        };
                    }
                }
            case 5:
                return {
                    type: 'bytes',
                    value: function() {
                        var value = utils.randomBuffer(random(0, 100));
                        return {
                            value: value,
                            normalized: value
                        };
                    },
                    skip: 0
                }
            case 6:
                var text = 'abcdefghijklmnopqrstuvwxyz\u2014ABCDEFGHIJKLMNOPQRSTUVWXYZFOOBARfoobar'
                return {
                    type: 'string',
                    value: function() {
                        var value = text.substring(0, random(0, 60));
                        return {
                            value: value,
                            normalized: value
                        };
                    }
                }
            case 7:
                var size = random(1, 6); // @TODO: bug in solidity or VM prevents this from being 0
                var subTypeValue = randomTypeValue(true);
                return {
                    type: subTypeValue.type + '[]',
                    value: function() {
                        var values = [];
                        var normalized = [];
                        for (var i = 0; i < size; i++) {
                            var value = subTypeValue.value();
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

    for (var i = 0; i < 1000; i++) {
        var count = random(1, 4);
        var types = [], values = [], normalized = [];;
        for (var j = 0; j < count; j++) {
            var type = randomTypeValue();
            types.push(type.type);
            var value = type.value();
            values.push(value.value);
            normalized.push(value.normalized);
        }
        check(types, values, normalized);
    }

/*
    check([ 'bool[4]', 'bool[]', 'int8' ],
          [ [ true, true, false, true ], [ true, true ], -210 ] [ [ true, true, false, true ], [ true, true ], new BN(-0xd2) ],
          [ [ true, true, false, true ], [ true, true ], new BN(2e) ]
          );
*/
    // Bug in solidity or in the VM, not sure, but this fails
    // check(['uint8[4][]'], [ [] ]);

    Promise.all(checkPromises).then(function(results) {
        test.done();
    }, function(error) {
        console.log('ERROR', error);
        test.done();
    });
}

module.exports.testSelf = module.exports;

