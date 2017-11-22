'use strict';

var fs = require('fs');

var utils = require('../utils');

var Wallet = require('../wallet/wallet');

var providers = require('../providers');

var contracts = require('../contracts');

var TestContracts = require('./test-contract.json');

var TestContract = TestContracts.test;
var TestContractDeploy = TestContracts.deploy;

process.on('unhandledRejection', function(reason, p){
    console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
    console.log(p);
    console.log(reason);
});

var callFallback = (function() {
    var contractInterface = new contracts.Interface(TestContract.interface);

    return contractInterface.events.callFallback();
})();

var privateKey = null;
if (fs && fs.readFileSync) {
    try {
        privateKey = fs.readFileSync('.test-account.key').toString();
        console.log('Found privateKey!');
    } catch (error) {
        console.log('Creating new private key!');
        privateKey = utils.hexlify(utils.randomBytes(32));
        fs.writeFileSync('.test-account.key', privateKey);
    }

} else {
    privateKey = global.localStorage.getItem('ethers-tests-privateKey');
    if (privateKey) {
        console.log('Found privateKey');
    } else {
        console.log('Creating new private key!');
        privateKey = utils.hexlify(utils.randomBytes(32));
        global.localStorage.setItem('ethers-tests-privateKey', privateKey);
    }
}

var provider = providers.getDefaultProvider(true);
var wallet = new Wallet(privateKey, provider);

console.log('Address: ' + wallet.address);

function FailProvider(testnet) {
    if (!(this instanceof FailProvider)) { throw new Error('missing new'); }
    providers.Provider.call(this, testnet);
}
providers.Provider.inherits(FailProvider);

utils.defineProperty(FailProvider.prototype, 'perform', function (method, params) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            reject(new Error('out of order'));
        }, 1000);
    });
});


function equal(serialized, object) {
    if (Array.isArray(serialized)) {
        if (!Array.isArray(object) || serialized.length != object.length) { return false; }
        for (var i = 0; i < serialized.length; i++) {
            if (!equal(serialized[i], object[i])) { return false; }
        }
        return true;
    } else if (serialized.type) {
        var result = null;
        switch (serialized.type) {
            case 'null':
                result = (null === object);
                break;
            case 'string':
            case 'number':
            case 'boolean':
                result = (serialized.value === object);
                break;
            case 'bigNumber':
                result = utils.bigNumberify(serialized.value).eq(object);
                break;
            default:
                throw new Error('unknown type - ' + serialized.type);
        }
        if (!result) {
            console.log('Not Equal: ', serialized, object);
        }
        return result;
    }

    for (var key in serialized) {
        if (!equal(serialized[key], object[key])) { return false; }
    }

    return true;
}


function testReadOnlyProvider(test, address, provider) {
    return Promise.all([
        provider.getBalance(address),
        provider.getCode(address),
        provider.getStorageAt(address, 0),
        provider.getBlock(TestContract.blockNumber),
        provider.getBlock((provider instanceof providers.EtherscanProvider) ? TestContract.blockNumber: TestContract.blockHash),
        provider.getTransaction(TestContract.transactionHash),
        provider.getTransactionReceipt(TestContract.transactionHash),
        provider.call({to: address, data: '0x' + TestContract.functions['getOwner()']}),
        provider.call({to: address, data: '0x' + TestContract.functions['getStringValue()']}),

        provider.getBlockNumber(),
        provider.getGasPrice(),
        //provider.estimeGas()
    ]).then(function(result) {
        // getBalance
        test.equal(result[0].toString(), '123456789', 'getBalance(contractAddress)');

        // getCode
        test.equal(result[1], TestContract.runtimeBytecode, 'getCode(contractAddress)');

        // getStorageAt
        test.ok(utils.bigNumberify(result[2]).eq(42), 'getStorageAt(contractAddress, 0)');

        // getBlock
        var block = JSON.parse(TestContract.block);
        test.ok(equal(block, result[3]), 'getBlock(blockNumber)');
        test.ok(equal(block, result[4]), 'getBlock(blockHash)');

        // getTransaction
        var transaction = JSON.parse(TestContract.transaction);
        test.ok(equal(transaction, result[5]), 'getTransaction(transactionHash)');

        // getTransactionReceipt
        var transactionReceipt = JSON.parse(TestContract.transactionReceipt);
        test.ok(equal(transactionReceipt, result[6]), 'getTransaction(transactionHash)');

        // call
        test.equal(TestContract.owner, utils.getAddress('0x' + result[7].substring(26)), 'call(getOwner())');
        var thisIsNotAString = '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001554686973206973206e6f74206120737472696e672e0000000000000000000000';
        test.equal(thisIsNotAString, result[8], 'call(getStringValue())');

        return {blockNumber: result[9], gasPrice: result[9]}
    });
}

function testWriteProvider(test, address, wallet) {

    var testTransaction = {
        to: address,
        gasLimit: 0x793e + 42,
        value: 100,
    };

    return Promise.all([
        wallet.estimateGas(testTransaction),
        wallet.sendTransaction(testTransaction),

    ]).then(function(results) {
        test.ok(results[0].eq(0x793e), 'estimateGas()');
        return wallet.provider.waitForTransaction(results[1].hash);

    }).then(function(transaction) {
        test.equal(transaction.to, testTransaction.to, 'check toAddress');
        test.equal(transaction.from, wallet.address, 'check fromAddress');
        test.ok(transaction.gasLimit.eq(testTransaction.gasLimit), 'check gasLimit');
        test.ok(transaction.value.eq(testTransaction.value), 'check value');

    }).catch(function(error) {
        console.log(error);
        test.ok(false, 'error occurred');
    });
}


function getProviders() {
    return [
        new providers.InfuraProvider(true),
        //new providers.EtherscanProvider(true),
        new providers.FallbackProvider([
            new FailProvider(true),
            new providers.InfuraProvider(true),
        ]),
    ];
}

function testEventsProvider(test, provider) {
    var firstBlockNumber = null;
    var lastBlockNumber = null;
    return Promise.all([
        new Promise(function(resolve, reject) {
            function callback(blockNumber) {
                if (lastBlockNumber === null) {
                    firstBlockNumber = blockNumber;
                    lastBlockNumber = blockNumber - 1;
                }

                test.equal(lastBlockNumber + 1, blockNumber, 'increasing block number');

                lastBlockNumber = blockNumber;
                if (blockNumber > firstBlockNumber + 4) {
                    provider.removeListener('block', callback);
                    resolve(blockNumber);
                }
            }
            provider.on('block', callback);
        }),
        new Promise(function(resolve, reject) {
            function callback(log) {
                var result = callFallback.parse(log.topics, log.data);
                if (result.sender !== wallet.address || !result.amount.eq(123)) {
                    //console.log('someone else is running the test cases');
                    return;
                }

                test.ok(true, 'callFallback triggered');

                provider.removeListener(callFallback.topics, callback);

                resolve(result);
            }
            provider.on(callFallback.topics, callback);
        }),
    ]);
}

function testReadOnly(test) {
    var promises = [];
    getProviders().forEach(function(provider) {
        promises.push(testReadOnlyProvider(test, TestContract.address, provider));
    });

    Promise.all(promises).then(function(results) {
        results.forEach(function(result, i) {
            if (i === 0) { return; }
            test.equal(results[0].blockNumber, result.blockNumber, 'blockNumber');
            test.equal(results[0].gasPrice, result.gasPrice, 'blockNumber');
        });

        test.done();
    }, function(error) {
        console.log(error);
        test.ok(false, 'error occurred');
    });
}

function testWrite(test) {

    var promise = wallet.getBalance().then(function(balance) {
        if (balance.isZero()) {
            console.log('Plese send some testnet ether to: ' + wallet.address);
            throw new Error('insufficient balance');
        }
    });

    getProviders().forEach(function(provider) {
        promise = promise.then(function() {
            var wallet = new Wallet(privateKey, provider);
            return testWriteProvider(test, TestContract.address, wallet);
        });
    });

    promise.then(function(result) {
        test.done();

    }, function(error) {
        console.log(error);
        test.ok(false, 'error occurred');
        test.done();
    });
}

function testEvents(test) {
    var promises = [];
    getProviders().forEach(function(provider) {
        promises.push(testEventsProvider(test, provider));
    });

    Promise.all(promises).then(function(result) {
        test.done()
    }, function (error) {
        console.log(error);
        test.ok(false, 'error occurred');
        test.done()
    });

    // Send 123 wei to the contrat to trigger its callFallback event
    wallet.send(TestContract.address, 123).then(function(transaction) {
        console.log('Trigger Transaction: ' + transaction.hash);
    });
}

function testContracts(test) {
    var contract = new contracts.Contract(TestContract.address, TestContract.interface, wallet);

    var newValue = 'Chicken-' + parseInt((new Date()).getTime());

    Promise.all([
        contract.getUintValue(),
        contract.getArrayValue(0),
        contract.getArrayValue(1),
        contract.getArrayValue(2),
        contract.getBytes32Value(),
        contract.getStringValue(),
        contract.getOwner(),
        contract.getMappingValue('A'),
        contract.getMappingValue('B'),
        contract.getMappingValue('C'),
        contract.getMappingValue('Nothing'),
        contract.getValue(),
        (new Promise(function(resolve, reject) {
            contract.onvaluechanged = function(author, oldValue, newValue) {

                test.ok(true, 'contract event oncallfa');

                contract.onvaluechanged = null;

                resolve({author: author, oldValue: oldValue, newValue: newValue});
            };
        })),
        contract.setValue(newValue),
    ]).then(function(results) {

        test.ok(results[0][0].eq(42), 'getUintValue()');
        test.equal(results[1][0], 'One', 'getArrayValue(1)');
        test.equal(results[2][0], 'Two', 'getArrayValue(2)');
        test.equal(results[3][0], 'Three', 'getArrayValue(3)');
        test.equal(
            utils.hexlify(results[4][0]),
            utils.keccak256(utils.toUtf8Bytes('TheEmptyString')),
            'getBytes32Value()'
        );
        test.equal(results[5][0], 'This is not a string.', 'getStringValue()');
        test.equal(results[6][0], TestContract.owner, 'getOwner()');
        test.equal(results[7][0], 'Apple', 'getMapping(A)');
        test.equal(results[8][0], 'Banana', 'getMapping(B)');
        test.equal(results[9][0], 'Cherry', 'getMapping(C)');
        test.equal(results[10][0], '', 'getMapping(Nothing)');

        test.ok(results[0].value.eq(42), 'named getUintValue()');
        test.equal(results[1].value, 'One', 'named getArrayValue(1)');
        test.equal(results[2].value, 'Two', 'named getArrayValue(2)');
        test.equal(results[3].value, 'Three', 'named getArrayValue(3)');
        test.equal(
            utils.hexlify(results[4].value),
            utils.keccak256(utils.toUtf8Bytes('TheEmptyString')),
            'named getBytes32Value()'
        );
        test.equal(results[5].value, 'This is not a string.', 'named getStringValue()');
        test.equal(results[6].value, TestContract.owner, 'named getOwner()');
        test.equal(results[7].value, 'Apple', 'named getMapping(A)');
        test.equal(results[8].value, 'Banana', 'named getMapping(B)');
        test.equal(results[9].value, 'Cherry', 'named getMapping(C)');
        test.equal(results[10].value, '', 'named getMapping(Nothing)');

        var getValue = results[11][0];
        var onvaluechanged = results[12];

        test.equal(onvaluechanged.oldValue, getValue, 'getValue()');
        test.equal(onvaluechanged.author, wallet.address, 'onvaluechanged.author');
        test.equal(onvaluechanged.newValue, newValue, 'onvaluechanged.newValue');
        test.done();

    }, function(error) {
        console.log(error);
        test.ok(false, 'an error occurred');
    });
}

function testDeploy(test) {
    var valueUint = parseInt((new Date()).getTime());
    var valueString = 'HelloWorld-' + valueUint;

    /*
    var contractInterface = new contracts.Interface(TestContractDeploy.interface);
    var deployInfo = contractInterface.deployFunction(
        TestContractDeploy.bytecode,
        valueUint,
        valueString
    );

    var transaction = {
        data: deployInfo.bytecode
    };
    */

    var transaction = contracts.Contract.getDeployTransaction(
        TestContractDeploy.bytecode,
        TestContractDeploy.interface,
        valueUint,
        valueString
    );

    var contract = null;

    wallet.sendTransaction(transaction).then(function(transaction) {
        return provider.waitForTransaction(transaction.hash);

    }).then(function(transaction) {
        contract = new contracts.Contract(transaction.creates, TestContractDeploy.interface, wallet);
        return contract.getValues();

    }).then(function(result) {
        test.ok(result[0].eq(valueUint), 'deployed contract - uint equal');
        test.equal(result[1], valueString, 'deployed contract - string equal');
        return provider.getCode(contract.address);

    }).then(function(code) {
        test.equal(code, TestContractDeploy.runtimeBytecode, 'getCode() == runtimeBytecode (after deploy)');
        return contract.cleanup();

    }).then(function(transaction) {
        return provider.waitForTransaction(transaction.hash);

    }).then(function(transaction) {
        return provider.getCode(contract.address);

    }).then(function(code) {
        test.equal(code, '0x', 'getCode() == null (after suicide)');
        test.done();
    });
}

function testENSProviderReadOnly(test, provider) {
    var promises = [];
    getProviders().forEach(function(provider) {
        promises.push(testReadOnlyProvider(test, 'test.ricmoose.eth', provider));
    });

    Promise.all(promises).then(function(results) {
        //console.log(results);
        test.done();
    }, function(error) {
        console.log(error);
        test.ok(false, 'error occurred');
    });

    /*
    provider.resolveName('anemone.eth').then(function(result) {
        console.log(result);
        test.done();
    });
    */
}


function testENSProviderWrite(test, provider) {
    var promise = wallet.getBalance().then(function(balance) {
        if (balance.isZero()) {
            console.log('Plese send some testnet ether to: ' + wallet.address);
            throw new Error('insufficient balance');
        }
    });

    getProviders().forEach(function(provider) {
        promise = promise.then(function() {
            var wallet = new Wallet(privateKey, provider);
            return testWriteProvider(test, TestContract.address, wallet);
        });
    });

    promise.then(function(result) {
        test.done();

    }, function(error) {
        console.log(error);
        test.ok(false, 'error occurred');
        test.done();
    });
}

function testENSReadOnly(test) {
    testENSProviderReadOnly(test, new providers.InfuraProvider(true));
}

function testENSWrite(test) {
    testENSProviderWrite(test, new providers.InfuraProvider(true));
}

function testENS(test) {
    var provider = providers.getDefaultProvider(true);
    provider.resolveName('ricmoose.eth').then(function(address) {
        test.equal('0x5543707cC4520F3984656e8eDEa6527ca474E77B', address, 'Simple ENS name');
        return provider.resolveName('duck.ricmoose.eth');
    }).then(function(address) {
        test.equal('0xf770358c6F29FAA38186E49c149C87968775B228', address, 'Nested ENS name');
        return provider.resolveName('nothing-here.ricmoose.eth');
    }).then(function(address) {
        test.equal(null, address, 'Non-existing ENS name');
        return provider.resolveName('not-valid');
    }).then(function(address) {
        test.equal(null, address, 'Invalid ENS name');
        return provider.lookupAddress('0x06B5955A67D827CDF91823E3bB8F069e6c89c1D6');
    }).then(function(name) {
        test.equal('ricmoo.firefly.eth', name, 'Invalid ENS reverse lookup');
        test.done();
    });
}

module.exports = {
    'read-only': testReadOnly,
    'write': testWrite,
    'events': testEvents,
    'contracts': testContracts,
    'deploy': testDeploy,
    'ens': testENS,
    'ens-readonly': testENSReadOnly,
    'ens-write': testENSWrite,
};

