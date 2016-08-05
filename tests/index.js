'use strict';

console.log('Running test cases... (this can take a long time, please be patient)');


// Test converting private keys to addresses
module.exports.testPrivateKeyToAddress = require('./test-privatekey.js');

// Test checksum addresses
module.exports.testChecksumAddress = require('./test-checksum-address.js');

// Test ICAP addresses
module.exports.testIcapAddress = require('./test-icap-address.js');


// Test ether strng formatting and parsing
module.exports.testEtherFormat = require('./test-ether-format.js');


// Test transactions
module.exports.testTrasactions = require('./test-transactions.js');


// Test Solidity encoding/decoding parameters
module.exports.testSolidityCoder = require('./test-solidity-coder.js');

// Test the contract meta-class
module.exports.testContracts = require('./test-contracts.js');


// Test the secret storage JSON wallet encryption/decryption
module.exports.testSecretStorage = require('./test-secret-storage.js');

// Test brain wallet generation
module.exports.testBrainWallet = require('./test-brain-wallet.js');


// Test the solidity encoding/decoding parameters
module.exports.testSolidityCoder = require('./test-solidity-coder.js');


// Test contract address helper
module.exports.testSolidityCoder = require('./test-contract-address.js');

// Test the providers API (this test case needs a little work as it
// needs to modify the blockchain for a full test)
//module.exports.testSolidityCoder = require('./test-providers.js');

