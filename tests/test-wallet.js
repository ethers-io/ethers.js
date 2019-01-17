'use strict';

var assert = require('assert');

var utils = require('./utils');
var ethers = utils.getEthers(__filename);

describe('Test JSON Wallets', function() {
    var Wallet = ethers.Wallet;
    var tests = utils.loadTests('wallets');
    tests.forEach(function(test) {
        it(('decrypts wallet - ' + test.name), function() {
            this.timeout(1200000);

            assert.ok((ethers.utils.getJsonWalletAddress(test.json) !== null),
                'detect encrypted JSON wallet');

            return Wallet.fromEncryptedJson(test.json, test.password).then(function(wallet) {
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
        var wallet = Wallet.createRandom({ path: "m/56'/82", extraEntropy: utils.randomHexString('test-' + i, 32) });
        it('encrypts and decrypts a random wallet - ' + i, function() {
            this.timeout(1200000);

            return wallet.encrypt(password).then(function(json) {
                return Wallet.fromEncryptedJson(json, password).then(function(decryptedWallet) {
                    assert.equal(decryptedWallet.address, wallet.address,
                        'decrypted wallet - ' + wallet.privateKey);
                    assert.equal(decryptedWallet.mnemonic, wallet.mnemonic,
                        "decrypted wallet menonic - " + wallet.privateKey);
                    assert.equal(decryptedWallet.path, wallet.path,
                        "decrypted wallet path - " + wallet.privateKey);
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

function checkTransaction(parsedTransaction, test) {
    var transaction = {};

    ['nonce', 'gasLimit', 'gasPrice', 'to', 'value', 'data'].forEach(function(key) {
        var expected = test[key];

        var value = parsedTransaction[key];

        if ({ gasLimit: 1, gasPrice: 1, value: 1 }[key]) {
            assert.ok((ethers.utils.BigNumber.isBigNumber(value)),
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
                ethers.utils.getAddress(value);
                value = value.toLowerCase();
            }
        }

        assert.equal(value, expected, 'parses ' + key + ' (legacy)');

        transaction[key] = test[key];
    });

    return transaction;
}

describe('Test Transaction Signing and Parsing', function() {

    var tests = utils.loadTests('transactions');
    tests.forEach(function(test) {
        it(('parses and signs transaction - ' + test.name), function() {
            this.timeout(120000);

            var signingKey = new ethers.utils.SigningKey(test.privateKey);
            var signDigest = signingKey.signDigest.bind(signingKey);

            // Legacy parsing unsigned transaction
            checkTransaction(ethers.utils.parseTransaction(test.unsignedTransaction), test);

            var parsedTransaction = ethers.utils.parseTransaction(test.signedTransaction);
            var transaction = checkTransaction(parsedTransaction, test);

            // Legacy signed transaction ecrecover
            assert.equal(parsedTransaction.from, ethers.utils.getAddress(test.accountAddress),
                'computed from');

            // Legacy transaction chain ID
            assert.equal(parsedTransaction.chainId, 0, 'parses chainId (legacy)');

            // Legacy serializes unsigned transaction
            (function() {
                var unsignedTx = ethers.utils.serializeTransaction(transaction);
                assert.equal(unsignedTx, test.unsignedTransaction,
                    'serializes undsigned transaction (legacy)');

                // Legacy signed serialized transaction
                var signature = signDigest(ethers.utils.keccak256(unsignedTx));
                assert.equal(ethers.utils.serializeTransaction(transaction, signature), test.signedTransaction,
                    'signs transaction (legacy)');
            })();


            // EIP155

            // EIP-155 parsing unsigned transaction
            var parsedUnsignedTransactionChainId5 = ethers.utils.parseTransaction(test.unsignedTransactionChainId5);
            checkTransaction(parsedUnsignedTransactionChainId5, test);
            assert.equal(parsedUnsignedTransactionChainId5.chainId, 5, 'parses chainId (eip155)');

            // EIP-155 fields
            var parsedTransactionChainId5 = ethers.utils.parseTransaction(test.signedTransactionChainId5);
            ['data', 'from', 'nonce', 'to'].forEach(function (key) {
                assert.equal(parsedTransaction[key], parsedTransactionChainId5[key],
                    'parses ' + key + ' (eip155)');
            });

            ['gasLimit', 'gasPrice', 'value'].forEach(function (key) {
                assert.ok(parsedTransaction[key].eq(parsedTransactionChainId5[key]),
                    'parses ' + key + ' (eip155)');
            });

            // EIP-155 chain ID
            assert.equal(parsedTransactionChainId5.chainId, 5,
                'parses chainId (eip155)');

            transaction.chainId = 5;

            (function() {
                // EIP-155 serialized unsigned transaction
                var unsignedTx = ethers.utils.serializeTransaction(transaction);
                assert.equal(unsignedTx, test.unsignedTransactionChainId5,
                    'serializes unsigned transaction (eip155) ');

                // EIP-155 signed serialized transaction
                var signature = signDigest(ethers.utils.keccak256(unsignedTx));
                assert.equal(ethers.utils.serializeTransaction(transaction, signature), test.signedTransactionChainId5,
                    'signs transaction (eip155)');
            })();

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
            messageHash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
            privateKey: '0x0123456789012345678901234567890123456789012345678901234567890123',
            signature: '0xddd0a7290af9526056b4e35a077b9a11b513aa0028ec6c9880948544508f3c63265e99e47ad31bb2cab9646c504576b3abc6939a1710afc08cbf3034d73214b81c'
        },

        // See: https://github.com/ethers-io/ethers.js/issues/80
        {
            address: '0xD351c7c627ad5531Edb9587f4150CaF393c33E87',
            name: 'bytes(0x47173285...4cb01fad)',
            message: arrayify('0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad'),
            messageHash: '0x93100cc9477ba6522a2d7d5e83d0e075b167224ed8aa0c5860cfd47fa9f22797',
            privateKey: '0x51d1d6047622bca92272d36b297799ecc152dc2ef91b229debf84fc41e8c73ee',
            signature: '0x546f0c996fa4cfbf2b68fd413bfb477f05e44e66545d7782d87d52305831cd055fc9943e513297d0f6755ad1590a5476bf7d1761d4f9dc07dfe473824bbdec751b'
        },

        // See: https://github.com/ethers-io/ethers.js/issues/85
        {
            address: '0xe7deA7e64B62d1Ca52f1716f29cd27d4FE28e3e1',
            name: 'zero-prefixed signature',
            message: arrayify(id('0x7f23b5eed5bc7e89f267f339561b2697faab234a2')),
            messageHash: '0x06c9d148d268f9a13d8f94f4ce351b0beff3b9ba69f23abbf171168202b2dd67',
            privateKey: '0x09a11afa58d6014843fd2c5fd4e21e7fadf96ca2d8ce9934af6b8e204314f25c',
            signature: '0x7222038446034a0425b6e3f0cc3594f0d979c656206408f937c37a8180bb1bea047d061e4ded4aeac77fa86eb02d42ba7250964ac3eb9da1337090258ce798491c'
        }
    ];

    tests.forEach(function(test) {
        it(('signs a message "' + test.name + '"'), function() {
            this.timeout(120000);
            var wallet = new Wallet(test.privateKey);
            return wallet.signMessage(test.message).then(function(signature) {
                assert.equal(signature, test.signature, 'computes message signature');
            });
        });
    });

    tests.forEach(function(test) {
        it(('verifies a message "' + test.name + '"'), function() {
            this.timeout(120000);
            var address = ethers.utils.verifyMessage(test.message, test.signature);
            assert.equal(address, test.address, 'verifies message signature');
        });
    });

    tests.forEach(function(test) {
      it(('hashes a message "' + test.name + '"'), function() {
          this.timeout(120000);
          var hash = ethers.utils.hashMessage(test.message);
          assert.equal(hash, test.messageHash, 'calculates message hash');
      });
  });
});
