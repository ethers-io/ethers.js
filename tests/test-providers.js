'use strict';
var Wallet = require('../index.js');

var Web3 = require('web3');

module.exports = function(test) {
     var pending = [];

     var otherGasPrice = null;
     function checkGasPrice(value) {
         if (otherGasPrice === null) {
             otherGasPrice = value;
             return true;
         }
         var same = otherGasPrice.eq(value);
         if (!same) {
             console.log('NOTE: This test case may have false positives; try again');
         }
         return same;
     }

     function checkMethod(provider, method, params, expectedValue) {
         pending.push(new Promise(function(resolve, reject) {
              provider[method].apply(provider, params).then(function(value) {
                  //console.log(provider, method, expectedValue, value);
                  if (expectedValue instanceof Wallet.utils.BN) {
                      test.ok(expectedValue.eq(value), 'Failed ' + method);
                  } else if (typeof(expectedValue) === 'function') {
                      test.ok(expectedValue(value), 'Failed ' + method);
                  } else {
                      test.equal(value, expectedValue, 'Failed ' + method);
                  }
                  resolve();
              }, function(error) {
                  test.ok(false, 'Error - '  + error.message);
                  reject(error);
              });
         }));
     }

     function check(provider) {
         checkMethod(
             provider,
             'getBalance', ['0x7357589f8e367c2C31F51242fB77B350A11830F3'],
             new Wallet.utils.BN('436095820614148588744')
         );
         checkMethod(
             provider,
             'getTransactionCount', ['0x7357589f8e367c2C31F51242fB77B350A11830F3'],
             1048598
         );
//         checkMethod(provider, 'getGasPrice', [], checkGasPrice);
         checkMethod(
             provider,
             'call', [{to: '0xdfaf84077cF4bCECA4F79d167F47041Ed3006D5b', data: '0x20965255'}],
             '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000006666f6f6261720000000000000000000000000000000000000000000000000000'
         );
     }

     var url = 'http://localhost:8545';
     var web3Provider = new Web3.providers.HttpProvider(url)
     var web3 = new Web3(web3Provider)

     check(new Wallet.providers.Web3Provider(web3Provider));
     check(new Wallet.providers.Web3Provider(web3));
     check(new Wallet.providers.HttpProvider(url));
     check(new Wallet.providers.EtherscanProvider({testnet: true}));

     Promise.all(pending).then(function(results) {
         test.done();
     }, function(error) {
         console.log(error);
         test.ok(false, 'Error occured: ' + error.message);
     });
}

module.exports.testSelf = module.exports;

