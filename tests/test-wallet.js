'use strict';

var assert = require('assert');
var utils = require('./utils');


describe('Test Brain Wallets', function() {
    var Wallet = require('../wallet/wallet');

    var tests = [
        {
            address: '0xbed9d2E41BdD066f702C4bDB86eB3A3740101acC',
            name: 'simple brain wallet',
            password: 'password',
            username: 'ricmoo'
        }
    ];

    tests.forEach(function(test) {
        it(('computes the brain wallet for ' + test.name), function() {
            return Wallet.fromBrainWallet(test.username, test.password).then(function(wallet) {
                assert.equal(wallet.address, test.address,
                    'computed brain wallet for ' + test.username + ':' + test.password);
            });
        });
    });
});

describe('Test JSON Wallets', function() {
    var Wallet = require('../wallet/wallet');
    var tests = utils.loadTests('wallets');
    tests.forEach(function(test) {
        it(('decrypts wallet - ' + test.name), function() {
            assert.ok(Wallet.isEncryptedWallet(test.json),
                'detect encrypted JSON wallet');

            return Wallet.fromEncryptedWallet(test.json, test.password).then(function(wallet) {
                assert.equal(wallet.privateKey, test.privateKey,
                    'generated correct private key - ' + wallet.privateKey);
                assert.equal(wallet.address.toLowerCase(), test.address,
                    'generate correct address - '  + wallet.address);
            });
        });
    });

    // A few extra test cases to test encrypting/decrypting
    ['one', 'two', 'three'].forEach(function(i) {
        var password = 'foobar' + i;
        var wallet = new Wallet(utils.randomHexString('test-' + i, 32));
        it('encrypts and decrypts a random wallet - ' + i, function() {
            return wallet.encrypt(password).then(function(json) {
                return Wallet.fromEncryptedWallet(json, password).then(function(decryptedWallet) {
                    assert.equal(decryptedWallet.address, wallet.address,
                        'decrypted wallet - ' + wallet.privateKey);
                    return decryptedWallet.encrypt(password).then(function(encryptedWallet) {
                        var parsedWallet = JSON.parse(encryptedWallet);
                        assert.equal(decryptedWallet.address.toLowerCase().substring(2), parsedWallet.address,
                            're-encrypted wallet - ' + wallet.privateKey);
                    });
                });
           });
        });
    });
});

describe('Test Transaction Signing and Parsing', function() {
    var Wallet = require('../wallet/wallet');

    var bigNumber = require('../utils/bignumber.js');
    var convert = require('../utils/convert.js');
    var getAddress = require('../utils/address.js').getAddress;

    var tests = utils.loadTests('transactions');
    tests.forEach(function(test) {
        it(('parses and signs transaction - ' + test.name), function() {
            var wallet = new Wallet(test.privateKey);

            var transaction = {};

            var parsedTransaction = Wallet.parseTransaction(test.signedTransaction);

            ['nonce', 'gasLimit', 'gasPrice', 'to', 'value', 'data'].forEach(function(key) {
                var expected = test[key];

                var value = parsedTransaction[key];

                if ({ gasLimit: 1, gasPrice: 1, value: 1 }[key]) {
                    assert.ok((!!value._bn),
                        'parsed into a big number - ' + key);
                    value = value.toHexString();

                    if (!expected || expected === '0x') { expected = '0x00'; }

                } else if (key === 'nonce') {
                    assert.equal(typeof(value), 'number',
                        'parse into a number - nonce');

                    value = utils.hexlify(value);

                    if (!expected || expected === '0x') { expected = '0x00'; }

                } else if (key === 'data') {
                    if (!expected) { expected = '0x'; }

                } else if (key === 'to') {
                    if (value) {
                        // Make sure teh address is valid
                        getAddress(value);
                        value = value.toLowerCase();
                    }
                }

                assert.equal(value, expected, 'parsed ' + key);

                transaction[key] = test[key];
            });

            assert.equal(parsedTransaction.from, getAddress(test.accountAddress),
                'computed from');

            assert.equal(parsedTransaction.chainId, 0, 'parsed chainId');

            var signedTransaction = wallet.sign(transaction);
            assert.equal(signedTransaction, test.signedTransaction,
                'signed transaction');

            // EIP155

            var parsedTransactionChainId5 = Wallet.parseTransaction(test.signedTransactionChainId5);
            ['data', 'from', 'nonce', 'to'].forEach(function (key) {
                assert.equal(parsedTransaction[key], parsedTransactionChainId5[key],
                    'eip155 parsed ' + key);
            });
            ['gasLimit', 'gasPrice', 'value'].forEach(function (key) {
                assert.ok(parsedTransaction[key].eq(parsedTransactionChainId5[key]),
                    'eip155 parsed ' + key);
            });
            assert.equal(parsedTransactionChainId5.chainId, 5,
                'eip155 parsed chainId');

            transaction.chainId = 5;
            var signedTransactionChainId5 = wallet.sign(transaction);
            assert.equal(signedTransactionChainId5, test.signedTransactionChainId5,
                'eip155 signed transaction');
        });
    });
});
