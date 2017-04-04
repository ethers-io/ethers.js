'use strict';

var Wallet = require('../wallet/wallet.js');

function testAccounts(test) {

    var testcases = require('./tests/private-keys.json');
    testcases.forEach(function(testcase) {
        var wallet = new Wallet(testcase.privateKey);
        test.equal(wallet.address, testcase.checksumAddress, 'Wallet failed converting private key to an address');
    });

    test.done();
}

function testBrainWallet(test) {
    var username = 'ricmoo';
    var password = 'password';

    Wallet.fromBrainWallet(username, password).then(function(wallet) {
        test.equal(wallet.address, '0xbed9d2E41BdD066f702C4bDB86eB3A3740101acC', 'wrong wallet generated');
        test.done();
    }, function(error) {
        test.ok(false, 'Failed to generarte brain wallet');
        test.done();
    });
}

function testWallets(test) {
    var utils = require('./make-tests/utils.js');

    var promises = [];

    var testcases = require('./tests/wallets.json');
    testcases.forEach(function(testcase) {
        // Currently removed support for crowdsale wallets; will add this back soon.
        if (testcase.type === 'crowdsale') { return; }

        test.ok(Wallet.isEncryptedWallet(testcase.json), 'failed to detect secret storage wallet');
        var promise = Wallet.fromEncryptedWallet(testcase.json, testcase.password).then(function(wallet) {
            test.equal(wallet.privateKey, testcase.privateKey, 'failed to generate correct private key');
            test.equal(wallet.address.toLowerCase(), testcase.address, 'failed to generate correct address');
        }, function(error) {
            test.ok(false, 'failed to decrypt wallet - ' + testcase.address);
        });

        promises.push(promise);
    });

    // A few extra test cases to test encrypting/decrypting
    ['one', 'two', 'three'].forEach(function(i) {
        var password = 'foobar' + i;
        var wallet = new Wallet(utils.randomHexString('test-' + i, 32));
        var promise = new Promise(function(resolve, reject) {
            wallet.encrypt(password).then(function(json) {
                Wallet.fromEncryptedWallet(json, password).then(function(decryptedWallet) {
                    test.equal(decryptedWallet.address, wallet.address, 'failed to decrypt encrypted wallet - ' + wallet.address);
                    decryptedWallet.encrypt(password).then(function(encryptedWallet) {
                        var parsedWallet = JSON.parse(encryptedWallet);
                        test.equal(decryptedWallet.address.toLowerCase().substring(2), parsedWallet.address, 'failed to re-encrypt wallet - ' + wallet.address);
                        resolve();
                    }, function(error) {
                        console.log(error);
                        reject(new Error('failed to re-encrypt - ' + wallet.address));
                    });
                }, function(error) {
                    console.log(error);
                    reject('failed to decrypt - ' + wallet.address);
                });
           }, function(error) {
               console.log(error);
               reject('failed to encrypt - ' + wallet.address);
           });
        });

        promises.push(promise);
    });

    Promise.all(promises).then(function() {
        test.done();
    }, function(error) {
        console.log(error);
        test.ok(false, 'error occurred');
        test.done();
    });
}

function testTransactions(test) {

    var utils = (function() {
        var bigNumber = require('../utils/bignumber.js');
        var convert = require('../utils/convert.js');
        return {
            isBigNumber: bigNumber.isBigNumber,
            bigNumberify: bigNumber.bigNumberify,

            getAddress: require('../utils/address.js').getAddress,

            hexlify: convert.hexlify,
        }
    })();

    var testcases = require('./tests/transactions.json');
    testcases.forEach(function(testcase) {
        var wallet = new Wallet(testcase.privateKey);

        var transaction = {};

        var parsedTransaction = Wallet.parseTransaction(testcase.signedTransaction);

        ['nonce', 'gasLimit', 'gasPrice', 'to', 'value', 'data'].forEach(function(key) {
            var expected = testcase[key];

            var value = parsedTransaction[key];

            if ({gasLimit: 1, gasPrice: 1, value: 1}[key]) {
                if (utils.isBigNumber(value)) {
                    test.ok(true, 'parse into a big number - ' + key + ' - ' + testcase.name);
                    value = value.toHexString();

                    if (!expected || expected === '0x') {
                        expected = '0x00';
                    }

                } else {
                    test.ok(false, 'parse into a big number - ' + key + ' - ' + testcase.name);
                    return;
                }

            } else if (key === 'nonce') {
                if (typeof(value) === 'number') {
                    test.ok(true, 'parse into a number - nonce - ' + testcase.name);
                    value = utils.hexlify(value);

                    if (!expected || expected === '0x') {
                        expected = '0x00';
                    }

                } else {
                    test.ok(false, 'parse into a number - nonce - ' + testcase.name);
                    return;
                }

            } else if (key === 'data') {
                if (!expected) {
                    expected = '0x';
                }

            } else if (key === 'to') {
                if (value) {
                    try {
                        utils.getAddress(value);
                    } catch (error) {
                        test.ok(false, 'create checksum address - to - ' + testcase.name);
                    }
                    value = value.toLowerCase();
                }
            }

            test.equal(value, expected, 'parse - ' + key + ' - ' + testcase.name);

            transaction[key] = testcase[key];
        });

        test.equal(parsedTransaction.from, utils.getAddress(testcase.accountAddress), 'compute - from - ' + testcase.name);

        test.equal(parsedTransaction.chainId, 0, 'parse - chainId - ' + testcase.name);

        var signedTransaction = wallet.sign(transaction);
        test.equal(signedTransaction, testcase.signedTransaction, 'sign transaction - ' + testcase.name);

        // EIP155

        var parsedTransactionChainId5 = Wallet.parseTransaction(testcase.signedTransactionChainId5);
        ['data', 'from', 'nonce', 'to'].forEach(function (key) {
            test.equal(parsedTransaction[key], parsedTransactionChainId5[key], 'eip155 parse - ' + key + ' - ' + testcase.name);
        });
        ['gasLimit', 'gasPrice', 'value'].forEach(function (key) {
            test.ok(parsedTransaction[key].eq(parsedTransactionChainId5[key]), 'eip155 parse - ' + key + ' - ' + testcase.name);
        });
        test.equal(parsedTransactionChainId5.chainId, 5, 'eip155 parse - chainId - ' + testcase.name);

        transaction.chainId = 5;
        var signedTransactionChainId5 = wallet.sign(transaction);
        test.equal(signedTransactionChainId5, testcase.signedTransactionChainId5, 'eip155 sign transaction - ' + testcase.name);
    });

    test.done();
}

module.exports = {
    "accounts": testAccounts,
    "brainwallet": testBrainWallet,
    "transactions": testTransactions,
    "wallets": testWallets,
}

