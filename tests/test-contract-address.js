'use strict';

var ethersAddress = require('../utils/address.js');

module.exports = function(test) {
    // Transaction: 0x939aa17985bc2a52a0c1cba9497ef09e092355a805a8150e30e24b753bac6864
    var transaction = {
        from: '0xb2682160c482eb985ec9f3e364eec0a904c44c23',
        nonce: 10,
    }

    test.equal(
        ethersAddress.getContractAddress(transaction),
        ethersAddress.getAddress('0x3474627d4f63a678266bc17171d87f8570936622'),
        'Failed to match contract address'
    )

    test.done();
}

module.exports.testSelf = module.exports;

