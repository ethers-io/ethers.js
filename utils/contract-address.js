
var getAddress = require('./address.js').getAddress;
var convert = require('./convert.js');
var keccak256 = require('./keccak256.js');
var rlp = require('./rlp.js');

// http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed
function getContractAddress(transaction) {
    if (!transaction.from) { throw new Error('missing from address'); }
    var nonce = transaction.nonce;

    return getAddress('0x' + keccak256(rlp.encode([
        getAddress(transaction.from),
        convert.hexlify(nonce, 'nonce')
    ])).substring(26));
}

module.exports = {
    getContractAddress: getContractAddress,
}
