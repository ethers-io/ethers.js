'use strict';

var assert = require('assert');

var utils = require('./utils');
var ethers = utils.getEthers(__filename);

describe('Private key generation', function() {
    var tests = utils.loadTests('accounts');
    tests.forEach(function(test) {
        if (!test.privateKey) { return; }
        it(('correctly converts private key - ' + test.name), function() {
            var wallet = new ethers.Wallet(test.privateKey);
            assert.equal(wallet.address.toLowerCase(), test.address.toLowerCase(),
                'correctly computes privateKey - ' + test.privateKey);
        });
    });
});

describe('Checksum and ICAP address generation', function() {
    var tests = utils.loadTests('accounts');
    tests.forEach(function(test) {
        it(('correctly transforms address - ' + test.name), function() {
            assert.equal(ethers.utils.getAddress(test.address), test.checksumAddress,
                'correctly computes checksum address from address');
            assert.equal(ethers.utils.getIcapAddress(test.address), test.icapAddress,
                'correctly computes ICAP address from address');
            assert.equal(ethers.utils.getAddress(test.checksumAddress), test.checksumAddress,
                'correctly computes checksum address from checksum address');
            assert.equal(ethers.utils.getIcapAddress(test.checksumAddress), test.icapAddress,
                'correctly computes ICAP address from checksum address');
            assert.equal(ethers.utils.getAddress(test.icapAddress), test.checksumAddress,
                'correctly computes checksum address from icap address');
            assert.equal(ethers.utils.getIcapAddress(test.icapAddress), test.icapAddress,
                'correctly computes ICAP address from icap address');
        });
    });
});

describe("Create2 Address Generation", function() {
    var tests = [
        {
            name: "Example 0",
            from: "0x0000000000000000000000000000000000000000",
            salt: "0x0000000000000000000000000000000000000000000000000000000000000000",
            initCode: "0x00",
            expected: "0x4D1A2e2bB4F88F0250f26Ffff098B0b30B26BF38"
        },
        {
            name: "Example 1",
            from: "0xdeadbeef00000000000000000000000000000000",
            salt: "0x0000000000000000000000000000000000000000000000000000000000000000",
            initCode: "0x00",
            expected: "0xB928f69Bb1D91Cd65274e3c79d8986362984fDA3"
        },
        {
            name: "Example 2",
            from: "0xdeadbeef00000000000000000000000000000000",
            salt: "0x000000000000000000000000feed000000000000000000000000000000000000",
            initCode: "0x00",
            expected: "0xD04116cDd17beBE565EB2422F2497E06cC1C9833"
        },
        {
            name: "Example 3",
            from: "0x0000000000000000000000000000000000000000",
            salt: "0x0000000000000000000000000000000000000000000000000000000000000000",
            initCode: "0xdeadbeef",
            expected: "0x70f2b2914A2a4b783FaEFb75f459A580616Fcb5e"
        },
        {
            name: "Example 4",
            from: "0x00000000000000000000000000000000deadbeef",
            salt: "0x00000000000000000000000000000000000000000000000000000000cafebabe",
            initCode: "0xdeadbeef",
            expected: "0x60f3f640a8508fC6a86d45DF051962668E1e8AC7"
        },
        {
            name: "Example 5",
            from: "0x00000000000000000000000000000000deadbeef",
            salt: "0x00000000000000000000000000000000000000000000000000000000cafebabe",
            initCode: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
            expected: "0x1d8bfDC5D46DC4f61D6b6115972536eBE6A8854C"
        },
        {
            name: "Example 6",
            from: "0x0000000000000000000000000000000000000000",
            salt: "0x0000000000000000000000000000000000000000000000000000000000000000",
            initCode: "0x",
            expected: "0xE33C0C7F7df4809055C3ebA6c09CFe4BaF1BD9e0"
        },
    ];

    tests.forEach(function(test) {
        it("correctly computes the Create2 address - " + test.name, function() {
            var address = ethers.utils.getCreate2Address(test);
            assert.equal(address, test.expected, "correctly computes Create2 address");
        });
    });
});
