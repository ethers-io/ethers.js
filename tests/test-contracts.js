'use strict';
var Wallet = require('../index.js');

module.exports = function(test) {
    var contractAddress = '0xdfaf84077cF4bCECA4F79d167F47041Ed3006D5b';
    var contractABI = {
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

    var contractInterface = new Wallet._Contract.Interface(contractABI.SimpleStorage);
    var getValue = contractInterface.getValue()
    var setValue = contractInterface.setValue("foobar");
    var valueChanged = contractInterface.valueChanged()

    test.equal(getValue.data, '0x20965255', "wrong call data");
    test.equal(setValue.data, '0x93a0935200000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000006666f6f6261720000000000000000000000000000000000000000000000000000', "wrong transaction data");
    test.ok(
        (valueChanged.topics.length === 1 && valueChanged.topics[0] === '0x68ad6719a0070b3bb2f866fa0d46c8123b18cefe9b387ddb4feb6647ca418435'),
        "wrong call data"
    );

    // @TODO - test decode

    var privateKey = new Buffer(32);
    privateKey.fill(0x42);

    var wallet = new Wallet(privateKey, 'http://localhost:8545');
    var contract = wallet.getContract(contractAddress, contractABI.SimpleStorage);

    function testCall() {
        return new Promise(function(resolve, reject) {
            contract.getValue().then(function(result) {
                test.equal(result, 'foobar', 'failed to call getVaue');
                resolve(result);
            }, function(error) {
                test.ok(false, 'failed to call getValue (is parity running on this host?)');
                reject(error);
            });
        });
    }

    function testEstimate() {
        return new Promise(function(resolve, reject) {
            contract.estimate.setValue('foo').then(function(result) {
                test.equal(result.toString(16), '8b04', 'failed to estimate setVaue');
                resolve(result);
            }, function(error) {
                test.ok(false, 'failed to call getValue (is parity running on this host?)');
                reject(error);
            });
        });
    }

    Promise.all([
        testCall(),
        testEstimate(),
    ]).then(function(results) {
        test.done();
    }, function(error) {
        console.log('ERROR', error);
        test.done();
    });
};

module.exports.testSelf = module.exports;
