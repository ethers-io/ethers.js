'use strict';
var Wallet = require('../index.js');

var ethereumUtil = require('ethereumjs-util');

var BN = Wallet.utils.BN;
var utils = require('./utils.js');
var random = utils.random;

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
            if (a.eq) { a = a.toString(10); }
            if (b.eq) { b = b.toString(10); }
            if (Buffer.isBuffer(a)) { a = a.toString('hex'); }
            if (Buffer.isBuffer(b)) { b = b.toString('hex'); }

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
            process.exit();
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
            process.exit();
        }
    }

    function check(types, values) {
        // First make sure we agree with ourself
        var ethersData = Wallet._Contract.Interface.encodeParams(types, values);
        var ethersValues = Wallet._Contract.Interface.decodeParams(types, ethersData);
        test.ok(recursiveEqual(values, ethersValues), "self encode/decode failed");

        var checkTypes = types.join(',');
        function has(regex) { return checkTypes.match(regex); }

        var hasDynamic = (has(/\[\]/) || has(/bytes([^0-9]|$)/) || has(/string/));
        var hasDynamicArray = has(/\[\]/);
        var hasFixedArray = has(/\[[0-9]+\]/);
        var hasNestedArray = has(/\]\[/);

        //console.log(types, checkTypes, hasDynamic, hasArray, hasNestedArray);
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
    check(['uint'], [new BN(-1)]);
    check(['uint256'], [new BN(1)]);
    check(['uint256'], [new BN(16)]);
    check(['uint256'], [new BN(-1)]);
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

    function randomTypeValue(onlyStatic) {
        switch (random(0, (onlyStatic ? 5: 8))) {
            case 0:
                var size = random(1, 33);
                return {
                    type: 'bytes' + size,
                    value: function() {
                        return '0x' + utils.randomBuffer(size).toString('hex');
                    },
                    skip: 0
                }
            case 1:
                var signed = (random(0, 2) === 0);
                var type =  (signed ? 'u': '') + 'int';
                if (random(0, 4) > 0) { type += 8 * random(1, 33); }
                return {
                   type: type,
                   value: function() {
                       var value = random(-500, 1000);
                       //var value = random(-5, 10) + (signed ? 5: 0);
                       if (random(0, 2)) { value = new BN(value); }
                       return value
                   },
                   skip: 0,
                }
            case 2:
                return {
                    type: 'address',
                    value: function() {
                        return '0x' + utils.randomBuffer(20).toString('hex');
                    },
                    skip: 0
                }
            case 3:
                return {
                    type: 'bool',
                    value: function() {
                        return (random(0, 2) === 0);
                    },
                    skip: 0
                }
            case 4:
                var size = random(1, 6); /// @TODO: Support random(0, 6)... Why is that even possible?
                var subTypeValue = randomTypeValue(true);
                return {
                    type: subTypeValue.type + '[' + size + ']',
                    value: function() {
                        var values = [];
                        for (var i = 0; i < size; i++) { values.push(subTypeValue.value()); }
                        return values;
                    },
                    skip: 0
                }
            case 5:
                return {
                    type: 'bytes',
                    value: function() {
                        return utils.randomBuffer(random(0, 100));
                    },
                    skip: 0
                }
            case 6:
                //var text = '\uD835\uDF63abcdefghijklmnopqrstuvwxyz\u2014ABCDEFGHIJKLMNOPQRSTUVWXYZFOOBARfoobar'
                var text = 'abcdefghijklmnopqrstuvwxyz\u2014ABCDEFGHIJKLMNOPQRSTUVWXYZFOOBARfoobar'
                return {
                    type: 'string',
                    value: function() {
                        return text.substring(0, random(0, 60));
                    },
                    skip: 0
                }
            case 7:
                var size = random(0, 6);
                var subTypeValue = randomTypeValue(true);
                return {
                    type: subTypeValue.type + '[]',
                    value: function() {
                        var values = [];
                        for (var i = 0; i < size; i++) { values.push(subTypeValue.value()); }
                        return values;
                    },
                    skip: 0
                }
        }
    }

    for (var i = 0; i < 10000; i++) {
        var count = random(0, 8);
        var types = [], values = [];
        for (var j = 0; j < count; j++) {
            var type = randomTypeValue();
            types.push(type.type);
            values.push(type.value());
            check(types, values);
        }
    }

    test.done();
}

