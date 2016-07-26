var nodeunit = require('nodeunit');

/*
// Test converting private keys to addresses
module.exports.testPrivateKeyToAddress = require('./test-privatekey.js');

// Test checksum addresses
module.exports.testChecksumAddress = require('./test-checksum-address.js');

// Test ICAP addresses
module.exports.testIcapAddress = require('./test-icap-address.js');


// Test transactions
module.exports.testTrasactions = require('./test-transactions.js');
*/

// Test Solidity encoding/decoding parameters
module.exports.testSolidityCoder = require('./test-solidity-coder.js');

// Test the secret storage JSON wallet encryption/decryption
//module.exports.testSecretStorage = require('./test-secret-storage.js');

module.exports.testContracts = require('./test-contracts.js');
