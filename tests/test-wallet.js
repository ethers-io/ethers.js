'use strict';

var assert = require('assert');
var utils = require('./utils');

if (global.ethers) {
    console.log('Using global ethers; ' + __filename);
    var ethers = global.ethers;
} else {
    var ethers = require('..');
}

describe('Test Brain Wallets', function() {
    var Wallet = ethers.Wallet;

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
            this.timeout(1000000);
            return Wallet.fromBrainWallet(test.username, test.password).then(function(wallet) {
                assert.equal(wallet.address, test.address,
                    'computed brain wallet for ' + test.username + ':' + test.password);
            });
        });
    });
});

describe('Test JSON Wallets', function() {
    var Wallet = ethers.Wallet;
    var tests = utils.loadTests('wallets');
    tests.forEach(function(test) {
        it(('decrypts wallet - ' + test.name), function() {
            this.timeout(1000000);

            assert.ok(Wallet.isEncryptedWallet(test.json),
                'detect encrypted JSON wallet');

            return Wallet.fromEncryptedWallet(test.json, test.password).then(function(wallet) {
                assert.equal(wallet.privateKey, test.privateKey,
                    'generated correct private key - ' + wallet.privateKey);
                assert.equal(wallet.address.toLowerCase(), test.address,
                    'generate correct address - '  + wallet.address);
                if (test.mnemonic) {
                    assert.equal(wallet.mnemonic, test.mnemonic,
                        'mnemonic enabled encrypted wallet has a mnemonic');
                }
            });
        });
    });

    // A few extra test cases to test encrypting/decrypting
    ['one', 'two', 'three'].forEach(function(i) {
        var password = 'foobar' + i;
        var wallet = new Wallet(utils.randomHexString('test-' + i, 32));
        it('encrypts and decrypts a random wallet - ' + i, function() {
            this.timeout(1000000);

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
    var Wallet = ethers.Wallet;

    var getAddress = ethers.utils.getAddress;

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

describe('Test Signing Messages', function() {
    var Wallet = ethers.Wallet;

    var arrayify = ethers.utils.arrayify;
    var id = ethers.utils.id;
    var toUtf8Bytes = ethers.utils.toUtf8Bytes;

    var tests = [
        // See: https://etherscan.io/verifySig/57
        {
            address: '0x14791697260E4c9A71f18484C9f997B308e59325',
            name: 'string("hello world")',
            message: 'hello world',
            privateKey: '0x0123456789012345678901234567890123456789012345678901234567890123',
            signature: '0xddd0a7290af9526056b4e35a077b9a11b513aa0028ec6c9880948544508f3c63265e99e47ad31bb2cab9646c504576b3abc6939a1710afc08cbf3034d73214b81c'
        },

        // See: https://github.com/ethers-io/ethers.js/issues/80
        {
            address: '0xD351c7c627ad5531Edb9587f4150CaF393c33E87',
            name: 'bytes(0x47173285...4cb01fad)',
            message: arrayify('0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad'),
            privateKey: '0x51d1d6047622bca92272d36b297799ecc152dc2ef91b229debf84fc41e8c73ee',
            signature: '0x546f0c996fa4cfbf2b68fd413bfb477f05e44e66545d7782d87d52305831cd055fc9943e513297d0f6755ad1590a5476bf7d1761d4f9dc07dfe473824bbdec751b'
        },

        // See: https://github.com/ethers-io/ethers.js/issues/85
        {
            address: '0xe7deA7e64B62d1Ca52f1716f29cd27d4FE28e3e1',
            name: 'zero-prefixed signature',
            message: arrayify(id('0x7f23b5eed5bc7e89f267f339561b2697faab234a2')),
            privateKey: '0x09a11afa58d6014843fd2c5fd4e21e7fadf96ca2d8ce9934af6b8e204314f25c',
            signature: '0x7222038446034a0425b6e3f0cc3594f0d979c656206408f937c37a8180bb1bea047d061e4ded4aeac77fa86eb02d42ba7250964ac3eb9da1337090258ce798491c'
        }
    ];

    tests.forEach(function(test) {
        it(('signs a message "' + test.name + '"'), function() {
            var wallet = new Wallet(test.privateKey);
            var signature = wallet.signMessage(test.message);
            assert.equal(signature, test.signature, 'computes message signature');
        });
    });

    tests.forEach(function(test) {
        it(('verifies a message "' + test.name + '"'), function() {
            var address = Wallet.verifyMessage(test.message, test.signature);
            assert.equal(address, test.address, 'verifies message signature');
        });
    });
});
