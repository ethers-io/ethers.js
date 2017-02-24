'use strict';

var Wallet = require('../wallet/index.js');

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

    Wallet.summonBrainWallet(username, password).then(function(wallet) {
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

        test.ok(Wallet.isValidWallet(testcase.json), 'failed to detect secret storage wallet');
        var promise = Wallet.decrypt(testcase.json, testcase.password).then(function(wallet) {
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
                Wallet.decrypt(json, password).then(function(decryptedWallet) {
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
                    test.ok(true, 'failed to parse into a big number - ' + key + ' - ' + testcase.name);
                    value = value.toHexString();

                    if (!expected || expected === '0x') {
                        expected = '0x00';
                    }

                } else {
                    test.ok(false, 'failed to parse into a big number - ' + key + ' - ' + testcase.name);
                    return;
                }

            } else if (key === 'nonce') {
                if (typeof(value) === 'number') {
                    test.ok(true, 'failed to parse into a number - nonce - ' + testcase.name);
                    value = utils.hexlify(value);

                    if (!expected || expected === '0x') {
                        expected = '0x00';
                    }

                } else {
                    test.ok(false, 'failed to parse into a number - nonce - ' + testcase.name);
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
                        test.ok(false, 'failed to create checksum address - to - ' + testcase.name);
                    }
                    value = value.toLowerCase();
                }
            }

            test.equal(value, expected, 'failed to parse - ' + key + ' - ' + testcase.name);

            transaction[key] = testcase[key];
        });

        var signedTransaction = wallet.sign(transaction);
        test.equal(signedTransaction, testcase.signedTransaction,
                   'failed to sign transaction - ' + testcase.name);
    });

    test.done();
}

module.exports = {
    "accounts": testAccounts,
    "transactions": testTransactions,
    "wallets": testWallets,
}

