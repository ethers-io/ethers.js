'use strict';
var Wallet = require('../index.js');

var Web3 = require('web3');

// @TODO: We need to do a lot more test cases here:
//  - homestead
//  - sendTransaction
//  - estimateGas with various parameters set and not set
//  - estimateGas on a contract with from/value conditionals
//  - Metamask-style injected Web3

module.exports = function(test) {

     var url = 'http://localhost:8545';
     var web3Provider = new Web3.providers.HttpProvider(url)
     var web3 = new Web3(web3Provider)

     var providers = [
         (new Wallet.providers.Web3Provider(web3Provider)),
         (new Wallet.providers.Web3Provider(web3)),
         (new Wallet.providers.HttpProvider(url)),
         (new Wallet.providers.EtherscanProvider({testnet: true})),
     ]

     var pending = [];

     function checkMethod(method, params, expectedValue) {
         var checks = [];
         providers.forEach(function(provider) {
             checks.push(new Promise(function(resolve, reject) {
                  provider[method].apply(provider, params).then(function(value) {
                      resolve(value);
                  }, function(error) {
                      reject(error);
                  });
             }));
         });

         pending.push(new Promise(function(resolve, reject) {
             Promise.all(checks).then(function(results) {
                 if (!expectedValue) { expectedValue = results[0]; }
                 results.forEach(function(value) {
                     if (expectedValue instanceof Wallet.utils.BN) {
                         test.ok(expectedValue.eq(value), 'Failed ' + method);
                     } else if (typeof(expectedValue) === 'function') {
                          test.ok(expectedValue(value), 'Failed ' + method);
                      } else {
                          test.equal(value, expectedValue, 'Failed ' + method);
                     }
                 });
                 resolve();
             }, function(error) {
                 console.log(error);
                 test.ok(false, 'Error - ' + error.message)
             });
         }));
     }

     checkMethod(
         'getBalance', ['0x7357589f8e367c2C31F51242fB77B350A11830F3']
     );
     checkMethod(
         'getTransactionCount', ['0x7357589f8e367c2C31F51242fB77B350A11830F3']
     );
     checkMethod('getGasPrice', []);
     checkMethod(
         'call', [{to: '0xdfaf84077cF4bCECA4F79d167F47041Ed3006D5b', data: '0x20965255'}],
         '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000006666f6f6261720000000000000000000000000000000000000000000000000000'
     );
     checkMethod(
         'estimateGas', [{
             to: '0xdfaf84077cF4bCECA4F79d167F47041Ed3006D5b',
             from: '0x7357589f8e367c2C31F51242fB77B350A11830F3',
             data: '0x93a0935200000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003666f6f0000000000000000000000000000000000000000000000000000000000'
         }],
         new Wallet.utils.BN('35588')
     );

     Promise.all(pending).then(function(results) {
         test.done();
     }, function(error) {
         console.log(error);
         test.ok(false, 'Error occured: ' + error.message);
     });
}

module.exports.testSelf = module.exports;

