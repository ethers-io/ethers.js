var nodeunit = require('nodeunit');


var crypto = require('crypto');
var fs = require('fs');

var ethereumTx = require('ethereumjs-tx');
var ethereumUtil = require('ethereumjs-util');
var iban = require('./node_modules/web3/lib/web3/iban.js');

var Wallet = require('./index.js');
var BN  = Wallet.utils.BN;

var utils = require('./lib/utils.js');

function random(lowerRandomInterval, upperOpenInterval) {
    return lowerRandomInterval + parseInt((upperOpenInterval - lowerRandomInterval) * Math.random());
}

function randomBuffer(length) {
    var buffer = crypto.randomBytes(length);
    return buffer;
}

function randomHex(length) {
    return '0x' + randomBuffer(length).toString('hex');
}

exports.testSecretStorage = function(test) {
    //var SecretStorage = require('./lib/secret-storage.js');

    var crowdsale = [
        {
            address: '0x2e326fA404Fc3661de4F4361776ed9bBABDC26E3',
            data: fs.readFileSync('./test-wallets/wallet-test-encseed-foo.json').toString(),
            password: 'foo',
            privateKey: '0xcf367fc32bf789b3339c6664af4a12263e9db0e0eb70f247da1d1165e150c487',
            type: 'crowdsale'
        },
        {
            address: '0x0b88d4b324ec24C8c078551e6e5075547157E5b6',
            data: fs.readFileSync('./test-wallets/wallet-test-encseed-no-password.json').toString(),
            password: '',
            privateKey: '0xd4375d2a931db84ea8825b69a3128913597744d9236cacec675cc18e1bda4446',
            type: 'crowdsale'
        }
    ];

    var geth = [
        {
            address: '0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290',
            data: fs.readFileSync('./test-wallets/wallet-test-geth-foo.json').toString(),
            password: 'foo',
            privateKey: '0xf03e581353c794928373fb0893bc731aefc4c4e234e643f3a46998b03cd4d7c5',
            type: 'version3'
        },
        {
            address: '0x4A9cf99357F5789251a8D7FaD5b86D0F31EEB938',
            data: fs.readFileSync('./test-wallets/wallet-test-geth-no-password.json').toString(),
            password: '',
            privateKey: '0xa016182717223d01f776149ec0b4a217d0e9930cad263f205427c6d3cd5560e7',
            type: 'version3'
        },
    ];

    test.expect((crowdsale.length * 4) + (geth.length * 4) + 1);


    // Test crowdsale private key decryption
    crowdsale.forEach(function(testcase) {

        // Check wallet type detection
        test.ok(Wallet.isCrowdsaleWallet(testcase.data), 'wrong wallet type detected');
        test.ok(!Wallet.isValidWallet(testcase.data), 'wrong wallet type detected');

        var wallet = Wallet.decryptCrowdsale(testcase.data, testcase.password);

        test.equal(wallet.privateKey, testcase.privateKey, 'wrong private key');
        test.equal(wallet.address, testcase.address, 'wrong address');
    });

    // Private keys are asynchronous, so we do this to trigger the done
    // only after all testcases have returned
    var expecting = geth.length + 1;
    function checkAsync() {
        expecting--;
        if (expecting === 0) { test.done(); }
    }

    geth.forEach(function(testcase) {
        // Check wallet type detection
        test.ok(Wallet.isValidWallet(testcase.data), 'wrong wallet type detected');
        test.ok(!Wallet.isCrowdsaleWallet(testcase.data), 'wrong wallet type detected');

        // Test private key decryption
        var password = new Buffer(testcase.password, 'utf8');
        Wallet.decrypt(testcase.data, password, function(error, signingKey, progress) {
            if (error) {
                console.log(error);
                test.ok(false, 'callback returned error - ' + error.message);
                checkAsync();

            } else if (signingKey) {
                test.equals(signingKey.privateKey, testcase.privateKey, 'wrong private key')
                test.equals(signingKey.address, testcase.address, 'wrong address');
                checkAsync();
            }
        });
    });

    var privateKey = new Buffer(32);
    privateKey.fill(0x42);

    var password = new Buffer("foo", 'utf8');

    (new Wallet(privateKey)).encrypt(password, {
        scrypt: { N: (1 << 10), r: 4, p: 2 },
        iv:   '0xdeadbeef1deadbeef2deadbeef301234',
        salt: '0xabcd1abcd2abcd3abcd4abcd5abcd6ef',
        uuid: '0x01234567890123456789012345678901',
    }, function(error, json, progress) {
        if (error) {
            test.ok(false, 'callback returned error - ' + error.message);
            checkAsync();

        } else if (json) {
            var jsonWallet = fs.readFileSync('./test-wallets/wallet-test-life.json').toString();
            test.equal(json, jsonWallet, 'failed to encrypt wallet');
            checkAsync();
        }
    });
}

exports.testCoderParams = function(test) {

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

            //console.log('A=');
            //console.log(a, {depth: null});

            //console.log('B=');
            //console.log(b, {depth: null});

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

    // Web3 doesn't like buffers
    /*
    function recurseBufferify(object) {
        if (!Array.isArray(object)) { return; }
        for (var i = 0; i < object.length; i++) {
            if (Buffer.isBuffer(object[i])) {
                object[i] = '0x' + object[i].toString('hex');
            } else {
                recurseBufferify(object[i]);
            }
        }
    }
    */

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

        /*
        if (!hasFixedArray) {
            recurseBufferify(values);
            checkLib(types, values, coderWeb3);
        }
        */
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
                        return '0x' + randomBuffer(size).toString('hex');
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
                        return '0x' + randomBuffer(20).toString('hex');
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
                        return randomBuffer(random(0, 100));
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


exports.testContract = function(test) {
    var abi = {
        "SimpleStorage": [
            {
                "constant":true,
                "inputs":[],
                "name":"getValue",
                "outputs":[{"name":"","type":"string"}],
                "type":"function"
            }, {
                "constant":false,
                "inputs":[{"name":"value","type":"string"}],
                "name":"setValue",
                "outputs":[],
                "type":"function"
            }, {
                "anonymous":false,
                "inputs":[
                    {"indexed":false,"name":"oldValue","type":"string"},
                    {"indexed":false,"name":"newValue","type":"string"}
                ],
                "name":"valueChanged",
                "type":"event"
            }
        ]
    }

    var contract = new Wallet._Contract.Interface(abi.SimpleStorage);
    var getValue = contract.getValue()
    var setValue = contract.setValue("foobar");
    var valueChanged = contract.valueChanged()

    test.equal(getValue.data, '0x20965255', "wrong call data");
    test.equal(setValue.data, '0x93a0935200000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000006666f6f6261720000000000000000000000000000000000000000000000000000', "wrong transaction data");
    test.ok(
        (valueChanged.topics.length === 1 && valueChanged.topics[0] === '0x68ad6719a0070b3bb2f866fa0d46c8123b18cefe9b387ddb4feb6647ca418435'),
        "wrong call data"
    );

    // @TODO - test decode

    test.done();

};

exports.testChecksumAddress = function(test) {
    for (var i = 0; i < 10000; i++) {
        var privateKey = randomBuffer(32, true);
        var official = '0x' + ethereumUtil.privateToAddress(privateKey).toString('hex');
        var ethers = (new Wallet(privateKey)).address;
        test.equal(ethers, ethereumUtil.toChecksumAddress(official), 'wrong address');
    }
    test.done();
}

exports.testIcapAddress = function(test) {
    function testAddress(address) {
        var officialIban = (iban.fromAddress(address))._iban;

        var ethersAddress = Wallet.getAddress(officialIban);
        var officialAddress = ethereumUtil.toChecksumAddress(address)

        var ethersIban = Wallet.getIcapAddress(address);

        test.equal(ethersAddress, officialAddress, 'wrong address');
        test.equal(ethersIban, officialIban, 'wrong ICAP address');
    }

    test.expect(2 * (2 + 10000));

    testAddress('0x0000000000000000000000000000000000000000');
    testAddress('0xffffffffffffffffffffffffffffffffffffffff');
    for (var i = 0; i < 10000; i++) {
        testAddress(randomHex(20));
    }

    test.done();
};

exports.testAddress = function(test) {
    function testAddress(address) {
        var official = ethereumUtil.toChecksumAddress(address);
        var ethers = Wallet.getAddress(address);
        test.equal(ethers, official, 'wrong address');
    }

    test.expect(2 + 10000);

    testAddress('0x0000000000000000000000000000000000000000');
    testAddress('0xffffffffffffffffffffffffffffffffffffffff');
    for (var i = 0; i < 10000; i++) {
        testAddress(randomHex(20));
    }
    test.done();
};

exports.testTransaction = function(test) {
    function testTransaction(privateKey, transaction, signature) {
        var rawTransaction = new ethereumTx(transaction);
        rawTransaction.sign(privateKey);
        var official = '0x' + rawTransaction.serialize().toString('hex');

        var ethers = (new Wallet(privateKey)).sign(transaction);

        test.equal(ethers, official, 'invalid transaction');
    }

    for (var i = 0; i < 10000; i++) {
        var transaction = {
            to: randomHex(20),
            data: randomHex(parseInt(10 * Math.random())),
            gasLimit: randomHex(parseInt(10 * Math.random())),
            gasPrice: randomHex(parseInt(10 * Math.random())),
            value: randomHex(parseInt(10 * Math.random())),
            nonce: randomHex(parseInt(10 * Math.random())),
        };

        testTransaction(randomBuffer(32, true), transaction);
    }

    // See: https://github.com/ethereumjs/ethereumjs-tx/blob/master/test/txs.json
    testTransaction(new Buffer('164122e5d39e9814ca723a749253663bafb07f6af91704d9754c361eb315f0c1', 'hex'), {
        nonce: "0x",
        gasPrice: "0x09184e72a000",
        gasLimit: "0x2710",
        to: "0x0000000000000000000000000000000000000000",
        value: "0x",
        data: "0x7f7465737432000000000000000000000000000000000000000000000000000000600057",
    }, {
        v: "0x1c",
        r: "0x5e1d3a76fbf824220eafc8c79ad578ad2b67d01b0c2425eb1f1347e8f50882ab",
        s: "0x5bd428537f05f9830e93792f90ea6a3e2d1ee84952dd96edbae9f658f831ab13"
    });

    testTransaction(new Buffer('e0a462586887362a18a318b128dbc1e3a0cae6d4b0739f5d0419ec25114bc722', 'hex'), {
        nonce: "0x06",
        gasPrice: "0x09184e72a000",
        gasLimit: "0x01f4",
        to: "0xbe862ad9abfe6f22bcb087716c7d89a26051f74c",
        value: "0x016345785d8a0000",
        data: "0x",
    }, {
        v: "0x1c",
        r: "0x24a484bfa7380860e9fa0a9f5e4b64b985e860ca31abd36e66583f9030c2e29d",
        s: "0x4d5ef07d9e73fa2fbfdad059591b4f13d0aa79e7634a2bb00174c9200cabb04d"
    });

    testTransaction(new Buffer('164122e5d39e9814ca723a749253663bafb07f6af91704d9754c361eb315f0c1', 'hex'), {
        nonce: "0x06",
        gasPrice: "0x09184e72a000",
        gasLimit: "0x0974",
        to: "0xbe862ad9abfe6f22bcb087716c7d89a26051f74c",
        value: "0x016345785d8a0000",
        data: "0x00000000000000000000000000000000000000000000000000000000000000ad000000000000000000000000000000000000000000000000000000000000fafa0000000000000000000000000000000000000000000000000000000000000dfa0000000000000000000000000000000000000000000000000000000000000dfa00000000000000000000000000000000000000000000000000000000000000ad000000000000000000000000000000000000000000000000000000000000000f000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000df000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000df000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000d",
    }, {
        v: "0x1c",
        r: "0x5e9361ca27e14f3af0e6b28466406ad8be026d3b0f2ae56e3c064043fb73ec77",
        s: "0x29ae9893dac4f9afb1af743e25fbb6a63f7879a61437203cb48c997b0fcefc3a"
    });

    test.done();
};

