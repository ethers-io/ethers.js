'use strict';

var fs = require('fs');

var ethers = require('..');

var solc = require('solc');

var provider = ethers.providers.getDefaultProvider('rinkeby');
var wallet = new ethers.Wallet(fs.readFileSync('.account.key').toString().trim(), provider);

var result = {
    deployer: wallet.address,
    source: fs.readFileSync('./test-contract.sol').toString(),
    optimize: 1,
    timestamp: (new Date()).getTime(),
};

var contracts = solc.compile(result.source, result.optimize);

if (contracts.errors && contracts.errors.length) {
    console.log('Errors:');
    contracts.errors.forEach(function(error) {
        console.log('  ' + error);
    });
}

var code = contracts.contracts[':TestContract'];

result.bytecode = '0x' + code.bytecode;
result.compiler = JSON.parse(code.metadata).compiler.version;
result.functionHashes = code.functionHashes;
result.interface = code.interface;
result.runtimeBytecode = '0x' + code.runtimeBytecode;

var deployTransaction = ethers.Contract.getDeployTransaction(result.bytecode, result.interface);
deployTransaction.gasLimit = 1500000;
deployTransaction.gasPrice = 10000000000;
wallet.sendTransaction(deployTransaction).then(function(tx) {
    result.transactionHash = tx.hash;
    result.contractAddress = ethers.utils.getContractAddress(tx);
    tx.wait().then(function(tx) {
        result.blockHash = tx.blockHash;
        result.blockNumber = tx.blockNumber;
        var data = JSON.stringify(result, undefined, ' ');
        fs.writeFileSync('test-contract.json', data);
        console.log(data);
    });
});
