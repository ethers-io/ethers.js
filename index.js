var rlp = require('rlp');

var Contract = require('./lib/contract.js');
var SigningKey = require('./lib/signing-key.js');
var Wallet = require('./lib/wallet.js');

var utils = require('./lib/utils.js');
var BN = utils.BN;


var exportUtils = {};
utils.defineProperty(Wallet, 'utils', exportUtils);

utils.defineProperty(exportUtils, 'BN', BN);
utils.defineProperty(exportUtils, 'Buffer', Buffer);

utils.defineProperty(exportUtils, 'sha3', utils.sha3);
utils.defineProperty(exportUtils, 'sha256', utils.sha256);

// http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed
utils.defineProperty(exportUtils, 'getContractAddress', function(transaction) {
    return SigningKey.getAddress('0x' + utils.sha3(rlp.encode([
        utils.hexOrBuffer(utils.getAddress(transaction.from)),
        utils.hexOrBuffer(utils.hexlify(transaction.nonce, 'nonce'))
    ])).slice(12).toString('hex'));
});

module.exports = Wallet;


utils.defineProperty(Wallet, 'getAddress', SigningKey.getAddress);
utils.defineProperty(Wallet, 'getIcapAddress', SigningKey.getIcapAddress);

module.exports = Wallet;
