'use strict';

var assert = require('assert');

var providers = require('../providers');
var bigNumberify = require('../utils/bignumber').bigNumberify;

var blockchainData = {
    homestead: {
        balance: {
            address: '0xAC1639CF97a3A46D431e6d1216f576622894cBB5',
            balance: bigNumberify('4918774100000000')
        },
        block3: {
            hash: '0x3d6122660cc824376f11ee842f83addc3525e2dd6756b9bcf0affa6aa88cf741',
            parentHash: '0xb495a1d7e6663152ae92708da4843337b958146015a2802f4193a410044698c9',
            number: 3,
            timestamp: 1438270048,
            nonce: '0x2e9344e0cbde83ce',
            difficulty: 17154715646,
            gasLimit: bigNumberify('0x1388'),
            gasUsed: bigNumberify('0'),
            miner: '0x5088D623ba0fcf0131E0897a91734A4D83596AA0',
            extraData: '0x476574682f76312e302e302d66633739643332642f6c696e75782f676f312e34',
            transactions: []
        },
    },
    kovan: {
        balance: {
            address: '0x09c967A0385eE3B3717779738cA0B9D116e0EcE7',
            balance: bigNumberify('997787946734641021')
        },
        block3: {
             hash: '0xf0ec9bf41b99a6bd1f6cd29f91302f71a1a82d14634d2e207edea4b7962f3676',
            parentHash: '0xf110ecd84454f116e2222378e7bca81ac3e59be0dac96d7ec56d5ef1c3bc1d64',
            number: 3,
            timestamp: 1488459452,
            difficulty: 131072,
            gasLimit: bigNumberify('0x5b48ec'),
            gasUsed: bigNumberify('0'),
            miner: '0x00A0A24b9f0E5EC7Aa4c7389b8302fd0123194dE',
            extraData: '0xd5830105048650617269747986312e31352e31826c69',
            transactions: []
        },
    },
    rinkeby: {
        balance: {
            address: '0xd09a624630a656a7dbb122cb05e41c12c7cd8c0e',
            balance: bigNumberify('3000000000000000000')
        },
        block3: {
            hash: '0x9eb9db9c3ec72918c7db73ae44e520139e95319c421ed6f9fc11fa8dd0cddc56',
            parentHash: '0x9b095b36c15eaf13044373aef8ee0bd3a382a5abb92e402afa44b8249c3a90e9',
            number: 3,
            timestamp: 1492010489,
            nonce: '0x0000000000000000',
            difficulty: 2,
            gasLimit: bigNumberify('0x47e7c4'),
            gasUsed: bigNumberify(0),
            miner: '0x0000000000000000000000000000000000000000',
            extraData: '0xd783010600846765746887676f312e372e33856c696e757800000000000000004e10f96536e45ceca7e34cc1bdda71db3f3bb029eb69afd28b57eb0202c0ec0859d383a99f63503c4df9ab6c1dc63bf6b9db77be952f47d86d2d7b208e77397301',
            transactions: []
        },
    },
    ropsten: {
        balance: {
            address: '0x03a6F7a5ce5866d9A0CCC1D4C980b8d523f80480',
            balance: bigNumberify('21991148575128552666')
        },
        block3: {
            hash: '0xaf2f2d55e6514389bcc388ccaf40c6ebf7b3814a199a214f1203fb674076e6df',
            parentHash: '0x88e8bc1dd383672e96d77ee247e7524622ff3b15c337bd33ef602f15ba82d920',
            number: 3,
            timestamp: 1479642588,
            nonce: '0x04668f72247a130c',
            difficulty: 996427,
            gasLimit: bigNumberify('0xff4033'),
            gasUsed: bigNumberify('0'),
            miner: '0xD1aEb42885A43b72B518182Ef893125814811048',
            extraData: '0xd883010503846765746887676f312e372e318664617277696e',
            transactions: []
        },
    },
}

blockchainData['default'] = blockchainData.homestead;

function equals(name, actual, expected) {
    if (expected.eq) {
        assert.ok(expected.eq(actual), name + ' matches');

    } else if (Array.isArray(expected)) {
        assert.equal(actual.length, expected.length, name + ' array lengths match');
        for (var i = 0; i < expected.length; i++) {
            equals(name + ' item ' + i, actual[i], expected[i]);
        }

    } else {
       assert.equal(actual, expected, name + ' matches');
    }
}

function testProvider(providerName, networkName) {
    describe(('Read-Only ' + providerName + ' (' + networkName + ')'), function() {
        var provider = null;
        if (networkName === 'default') {
            if (providerName === 'getDefaultProvider') {
                provider = providers.getDefaultProvider();
            } else {
                provider = new providers[providerName]();
            }
        } else {
            if (providerName === 'getDefaultProvider') {
                provider = providers.getDefaultProvider(networkName);
            } else {
                provider = new providers[providerName](networkName);
            }
        }

        it('fetches block #3', function() {
            this.timeout(20000);
            var test = blockchainData[networkName].block3;
            return provider.getBlock(3).then(function(block) {
                for (var key in test) {
                    equals('Block ' + key, block[key], test[key]);
                }
            });
        });

        it('fetches address balance', function() {
            // @TODO: These tests could be fiddled with if someone sends ether to our address
            //  We should set up a contract on each network like:
            //
            //  contract TestBalance {
            //     function resetBalance() {
            //         assert(_owner.send(this.balance - 0.0000314159 ether));
            //     }
            //  }
            this.timeout(20000);
            var test = blockchainData[networkName].balance;
            return provider.getBalance(test.address).then(function(balance) {
                equals('Balance', test.balance, balance);
            });
        });

        // Obviously many more cases to add here
        // - getTransactionCount
        // - getCode
        // - getStorageAt
        // - getBlockNumber
        // - getGasPrice
        // - estimateGas
        // - sendTransaction
        // - getTransaction
        // - getTransactionReceipt
        // - call
        // - getLogs
        //
        //  Many of these are tested in run-providers, which uses nodeunit, but
        //  also creates a local private key which must then be funded to
        //  execute the tests. I am working on a better test contract to deploy
        //  to all the networks to help test these.
    });
}

['default', 'homestead', 'ropsten', 'rinkeby', 'kovan'].forEach(function(networkName) {
    ['getDefaultProvider', 'InfuraProvider', 'EtherscanProvider'].forEach(function(providerName) {
        testProvider(providerName, networkName);
    });
});

