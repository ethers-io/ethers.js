'use strict'

var Wallet = require('../wallet/index.js');

var fs = require('fs');


module.exports = function(test) {

    function equals(a, b) {
        if (typeof(a) !== typeof(b)) { return false; }
        if (Array.isArray(a)) {
            if (!Array.isArray(b)) { return false; }
            for (var i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) { return false; }
            }
        } else if (typeof(a) === 'object') {
            if (!equals(Object.keys(a), Object.keys(b))) {
                return false;
            }
            for (var key in a) {
                if (!equals(a[key], b[key])) { return false; }
            }
        } else {
            return (a === b);
        }
        return true;
    }

    var crowdsale = [
        {
            address: '0x2e326fA404Fc3661de4F4361776ed9bBABDC26E3',
            data: fs.readFileSync('./test-wallets/wallet-test-encseed-foo.json').toString(),
            password: 'foo',
            privateKey: '0xcf367fc32bf789b3339c6664af4a12263e9db0e0eb70f247da1d1165e150c487',
            type: 'crowdsale'
        },
        {
            address: '0x0b88d4b324ec24C8c078551e6e5075547157E5b6',
            data: fs.readFileSync('./test-wallets/wallet-test-encseed-no-password.json').toString(),
            password: '',
            privateKey: '0xd4375d2a931db84ea8825b69a3128913597744d9236cacec675cc18e1bda4446',
            type: 'crowdsale'
        }
    ];

    var geth = [
        {
            address: '0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290',
            data: fs.readFileSync('./test-wallets/wallet-test-geth-foo.json').toString(),
            password: 'foo',
            privateKey: '0xf03e581353c794928373fb0893bc731aefc4c4e234e643f3a46998b03cd4d7c5',
            type: 'version3'
        },
        {
            address: '0x4A9cf99357F5789251a8D7FaD5b86D0F31EEB938',
            data: fs.readFileSync('./test-wallets/wallet-test-geth-no-password.json').toString(),
            password: '',
            privateKey: '0xa016182717223d01f776149ec0b4a217d0e9930cad263f205427c6d3cd5560e7',
            type: 'version3'
        },
    ];

    // Test crowdsale private key decryption
    crowdsale.forEach(function(testcase) {

        // Check wallet type detection
        test.ok(Wallet.isCrowdsaleWallet(testcase.data), 'wrong wallet type detected');
        //test.ok(!Wallet.isValidWallet(testcase.data), 'wrong wallet type detected');

        var wallet = Wallet.decryptCrowdsale(testcase.data, testcase.password);

        test.equal(wallet.privateKey, testcase.privateKey, 'wrong private key');
        test.equal(wallet.address, testcase.address, 'wrong address');
    });

    var async = [];

    geth.forEach(function(testcase) {
        // Check wallet type detection
        //test.ok(Wallet.isValidWallet(testcase.data), 'wrong wallet type detected');
        test.ok(!Wallet.isCrowdsaleWallet(testcase.data), 'wrong wallet type detected');

        async.push(new Promise(function(resolve, reject) {

            // Test private key decryption
            var password = new Buffer(testcase.password, 'utf8');
            Wallet.decrypt(testcase.data, password).then(function(wallet) {
                test.equals(wallet.privateKey, testcase.privateKey, 'wrong private key')
                test.equals(wallet.address, testcase.address, 'wrong address');
                resolve();
            }, function(error) {
                console.log(error);
                test.ok(false, 'callback returned error - ' + error.message);
                reject(error);
            });
        }));
    });

    var privateKey = new Buffer(32);
    privateKey.fill(0x42);
    var password = new Buffer("foo", 'utf8');
    async.push(new Promise(function(resolve, reject) {
        (new Wallet(privateKey)).encrypt(password, {
            scrypt: { N: (1 << 10), r: 4, p: 2 },
            iv:   '0xdeadbeef1deadbeef2deadbeef301234',
            salt: '0xabcd1abcd2abcd3abcd4abcd5abcd6ef',
            uuid: '0x01234567890123456789012345678901',
        }).then(function(json) {
        /*
            var jsonWallet = fs.readFileSync('./test-wallets/wallet-test-life.json').toString();
            test.ok(equals(JSON.parse(json), JSON.parse(jsonWallet)), 'failed to encrypt wallet')
            //test.equal(json, jsonWallet, 'failed to encrypt wallet');
            Wallet.decrypt(json, password).then(function(wallet) {
                test.equal(wallet.privateKey, '0x' + privateKey.toString('hex'), 'decryption failed');
                */
                resolve();
            /*
            }, function(error) {
                test.ok(false, 'callback returned error - ' + error.message);
                reject(error);
            });
        */
        }, function(error) {
            test.ok(false, 'callback returned error - ' + error.message);
            reject(error);
        });
    }));

    Promise.all(async).then(function(results) {
        test.done();
    }, function(error) {
        console.log(error);
        test.done();
    });
}

module.exports.testSelf = module.exports;

