'use strict';

var fs = require('fs');
var path = require('path');

var solc = require('solc');

var convert = require('../../utils/convert.js');
var ethers = require('../../index.js');
var utils = require('./utils.js');

var privateKey = null;
try {
    privateKey = fs.readFileSync('.test-account.key').toString();
    console.log('Found privateKey: ' + privateKey);
} catch (error) {
    privateKey = convert.hexlify(ethers.utils.randomBytes(32));
    console.log('Created new private key: ' + privateKey);
    fs.writeFileSync('.test-account.key', privateKey);
}

var sourcePath = path.join(__dirname, 'test-contracts/TestContract.sol');
var source = fs.readFileSync(sourcePath).toString();

var provider = ethers.providers.getDefaultProvider(true);
var wallet = new ethers.Wallet(privateKey, provider);

console.log('Address: ' + wallet.address);

var TestContract = {
     dateCreated: (new Date()).getTime(),
     source: source,
     owner: wallet.address,
};

var TestContractDeploy = {
     dateCreated: (new Date()).getTime(),
     source: source,
}


function serialize(object) {
    if (object == null) {
        return {type: "null"};
    }

    if (Array.isArray(object)) {
        var result = [];
        object.forEach(function(object) {
            result.push(serialize(object));
        });
        return result;

    } else if (object.toHexString) {
        return {type: 'bigNumber', value: object.toHexString()};

    }

    switch (typeof(object)) {
        case 'string':
        case 'number':
        case 'boolean':
            return {type: typeof(object), value: object};
        default:
            break;
    }

    var result = {};
    for (var key in object) {
        result[key] = serialize(object[key]);
    }
    return result;
}


wallet.getBalance().then(function(balance) {
    if (balance.isZero()) {
        console.log('Plese send some testnet ether to: ' + wallet.address);
        throw new Error('insufficient funds');
    }

    var compiled = solc.compile(source, 0);
    if (compiled.errors) {
        console.log('Solidity Compile Error(s):');
        compiled.errors.forEach(function(line) {
            console.log('  ' + line);
        });
        throw new Error('invalid solidity contract source');
    }

    (function() {
        var contract = compiled.contracts.TestContractDeploy;
        TestContractDeploy.bytecode = '0x' + contract.bytecode;
        TestContractDeploy.functions = contract.functionHashes;
        TestContractDeploy.interface = contract.interface;
        TestContractDeploy.runtimeBytecode = '0x' + contract.runtimeBytecode;
    })();

    (function() {
        var contract = compiled.contracts.TestContract;
        TestContract.bytecode = '0x' + contract.bytecode;
        TestContract.functions = contract.functionHashes;
        TestContract.interface = contract.interface;
        TestContract.runtimeBytecode = '0x' + contract.runtimeBytecode;
    })();
    TestContract.value = 123456789;

    var transaction = {
        data: TestContract.bytecode,
        gasLimit: 2000000,
        value: TestContract.value,
    }
    console.log(transaction);

    return wallet.sendTransaction(transaction);

}).then(function(transaction) {
    TestContract.transactionHash = transaction.hash;
    return provider.waitForTransaction(transaction.hash);

}).then(function(transaction) {

    TestContract.address = ethers.utils.getContractAddress(transaction);
    TestContract.transaction = JSON.stringify(serialize(transaction));
    TestContract.blockNumber = transaction.blockNumber;
    TestContract.blockHash = transaction.blockHash;

    return Promise.all([
        provider.getTransactionReceipt(transaction.hash),
        provider.getBlock(transaction.blockHash)
    ]);

}).then(function(results) {
    TestContract.transactionReceipt = JSON.stringify(serialize(results[0]));
    TestContract.block = JSON.stringify(serialize(results[1]));

    utils.saveTestcase('test-contract', {deploy: TestContractDeploy, test: TestContract});

}).catch(function(error) {
    console.log(error);
});

