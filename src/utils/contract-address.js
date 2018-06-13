'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var address_1 = require("./address");
var convert_1 = require("./convert");
var keccak256_1 = require("./keccak256");
var rlp_1 = require("./rlp");
// http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed
function getContractAddress(transaction) {
    if (!transaction.from) {
        throw new Error('missing from address');
    }
    var nonce = transaction.nonce;
    return address_1.getAddress('0x' + keccak256_1.keccak256(rlp_1.encode([
        address_1.getAddress(transaction.from),
        convert_1.stripZeros(convert_1.hexlify(nonce))
    ])).substring(26));
}
exports.getContractAddress = getContractAddress;
