"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var address_1 = require("./address");
var bignumber_1 = require("./bignumber");
var bytes_1 = require("./bytes");
var keccak256_1 = require("./keccak256");
var RLP = __importStar(require("./rlp"));
var errors = __importStar(require("./errors"));
/* !!!!!!!!!!!!!!!!!!!!!!!! IMPORTANT !!!!!!!!!!!!!!!!!!!!!!!
 *
 *  Due to a weird ordering-issue with browserify, there is an
 *  import for secp256k1 at the bottom of the file; it must be
 *  required AFTER the parse and serialize exports have been
 *  defined.
 *
 */
function handleAddress(value) {
    if (value === '0x') {
        return null;
    }
    return address_1.getAddress(value);
}
function handleNumber(value) {
    if (value === '0x') {
        return bignumber_1.ConstantZero;
    }
    return bignumber_1.bigNumberify(value);
}
var transactionFields = [
    { name: 'nonce', maxLength: 32 },
    { name: 'gasPrice', maxLength: 32 },
    { name: 'gasLimit', maxLength: 32 },
    { name: 'to', length: 20 },
    { name: 'value', maxLength: 32 },
    { name: 'data' },
];
function serialize(transaction, signature) {
    var raw = [];
    transactionFields.forEach(function (fieldInfo) {
        var value = transaction[fieldInfo.name] || ([]);
        value = bytes_1.arrayify(bytes_1.hexlify(value));
        // Fixed-width field
        if (fieldInfo.length && value.length !== fieldInfo.length && value.length > 0) {
            errors.throwError('invalid length for ' + fieldInfo.name, errors.INVALID_ARGUMENT, { arg: ('transaction' + fieldInfo.name), value: value });
        }
        // Variable-width (with a maximum)
        if (fieldInfo.maxLength) {
            value = bytes_1.stripZeros(value);
            if (value.length > fieldInfo.maxLength) {
                errors.throwError('invalid length for ' + fieldInfo.name, errors.INVALID_ARGUMENT, { arg: ('transaction' + fieldInfo.name), value: value });
            }
        }
        raw.push(bytes_1.hexlify(value));
    });
    if (transaction.chainId != null && transaction.chainId !== 0) {
        raw.push(bytes_1.hexlify(transaction.chainId));
        raw.push('0x');
        raw.push('0x');
    }
    var unsignedTransaction = RLP.encode(raw);
    // Requesting an unsigned transation
    if (!signature) {
        return unsignedTransaction;
    }
    // The splitSignature will ensure the transaction has a recoveryParam in the
    // case that the signTransaction function only adds a v.
    signature = bytes_1.splitSignature(signature);
    // We pushed a chainId and null r, s on for hashing only; remove those
    var v = 27 + signature.recoveryParam;
    if (raw.length === 9) {
        raw.pop();
        raw.pop();
        raw.pop();
        v += transaction.chainId * 2 + 8;
    }
    raw.push(bytes_1.hexlify(v));
    raw.push(bytes_1.stripZeros(bytes_1.arrayify(signature.r)));
    raw.push(bytes_1.stripZeros(bytes_1.arrayify(signature.s)));
    return RLP.encode(raw);
}
exports.serialize = serialize;
function parse(rawTransaction) {
    var transaction = RLP.decode(rawTransaction);
    if (transaction.length !== 9 && transaction.length !== 6) {
        errors.throwError('invalid raw transaction', errors.INVALID_ARGUMENT, { arg: 'rawTransactin', value: rawTransaction });
    }
    var tx = {
        nonce: handleNumber(transaction[0]).toNumber(),
        gasPrice: handleNumber(transaction[1]),
        gasLimit: handleNumber(transaction[2]),
        to: handleAddress(transaction[3]),
        value: handleNumber(transaction[4]),
        data: transaction[5],
        chainId: 0
    };
    // Legacy unsigned transaction
    if (transaction.length === 6) {
        return tx;
    }
    try {
        tx.v = bignumber_1.bigNumberify(transaction[6]).toNumber();
    }
    catch (error) {
        console.log(error);
        return tx;
    }
    tx.r = bytes_1.hexZeroPad(transaction[7], 32);
    tx.s = bytes_1.hexZeroPad(transaction[8], 32);
    if (bignumber_1.bigNumberify(tx.r).isZero() && bignumber_1.bigNumberify(tx.s).isZero()) {
        // EIP-155 unsigned transaction
        tx.chainId = tx.v;
        tx.v = 0;
    }
    else {
        // Signed Tranasaction
        tx.chainId = Math.floor((tx.v - 35) / 2);
        if (tx.chainId < 0) {
            tx.chainId = 0;
        }
        var recoveryParam = tx.v - 27;
        var raw = transaction.slice(0, 6);
        if (tx.chainId !== 0) {
            raw.push(bytes_1.hexlify(tx.chainId));
            raw.push('0x');
            raw.push('0x');
            recoveryParam -= tx.chainId * 2 + 8;
        }
        var digest = keccak256_1.keccak256(RLP.encode(raw));
        try {
            tx.from = secp256k1_1.recoverAddress(digest, { r: bytes_1.hexlify(tx.r), s: bytes_1.hexlify(tx.s), recoveryParam: recoveryParam });
        }
        catch (error) {
            console.log(error);
        }
        tx.hash = keccak256_1.keccak256(rawTransaction);
    }
    return tx;
}
exports.parse = parse;
// !!! IMPORTANT !!!
//
// This must be be at the end, otherwise Browserify attempts to include upstream
// dependencies before this module is loaded.
var secp256k1_1 = require("./secp256k1");
