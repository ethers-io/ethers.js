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
var secp256k1_1 = require("./secp256k1");
var RLP = __importStar(require("./rlp"));
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
function sign(transaction, signDigest) {
    var raw = [];
    transactionFields.forEach(function (fieldInfo) {
        var value = transaction[fieldInfo.name] || ([]);
        value = bytes_1.arrayify(bytes_1.hexlify(value));
        // Fixed-width field
        if (fieldInfo.length && value.length !== fieldInfo.length && value.length > 0) {
            var error = new Error('invalid ' + fieldInfo.name);
            error.reason = 'wrong length';
            error.value = value;
            throw error;
        }
        // Variable-width (with a maximum)
        if (fieldInfo.maxLength) {
            value = bytes_1.stripZeros(value);
            if (value.length > fieldInfo.maxLength) {
                var error = new Error('invalid ' + fieldInfo.name);
                error.reason = 'too long';
                error.value = value;
                throw error;
            }
        }
        raw.push(bytes_1.hexlify(value));
    });
    // @TOOD:
    /*
    // Requesting an unsigned transation
    if (!signDigest) {
        let v = 27 + signature.recoveryParam
        if (transaction.chainId) {
            v += transaction.chainId * 2 + 8;
        }
        //raw.push(hexlify(transaction.chainId));
        raw.push(hexlify(v));
        raw.push('0x');
        raw.push('0x');
    }
    */
    if (transaction.chainId) {
        raw.push(bytes_1.hexlify(transaction.chainId));
        raw.push('0x');
        raw.push('0x');
    }
    var digest = keccak256_1.keccak256(RLP.encode(raw));
    var signature = signDigest(digest);
    var v = 27 + signature.recoveryParam;
    if (transaction.chainId) {
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
exports.sign = sign;
function parse(rawTransaction) {
    var signedTransaction = RLP.decode(rawTransaction);
    if (signedTransaction.length !== 9) {
        throw new Error('invalid transaction');
    }
    var tx = {
        nonce: handleNumber(signedTransaction[0]).toNumber(),
        gasPrice: handleNumber(signedTransaction[1]),
        gasLimit: handleNumber(signedTransaction[2]),
        to: handleAddress(signedTransaction[3]),
        value: handleNumber(signedTransaction[4]),
        data: signedTransaction[5],
        chainId: 0
    };
    var v = bytes_1.arrayify(signedTransaction[6]);
    var r = bytes_1.arrayify(signedTransaction[7]);
    var s = bytes_1.arrayify(signedTransaction[8]);
    if (v.length >= 1 && r.length >= 1 && r.length <= 32 && s.length >= 1 && s.length <= 32) {
        tx.v = bignumber_1.bigNumberify(v).toNumber();
        tx.r = bytes_1.hexZeroPad(signedTransaction[7], 32);
        tx.s = bytes_1.hexZeroPad(signedTransaction[8], 32);
        var chainId = (tx.v - 35) / 2;
        if (chainId < 0) {
            chainId = 0;
        }
        chainId = Math.trunc(chainId);
        tx.chainId = chainId;
        var recoveryParam = tx.v - 27;
        var raw = signedTransaction.slice(0, 6);
        if (chainId) {
            raw.push(bytes_1.hexlify(chainId));
            raw.push('0x');
            raw.push('0x');
            recoveryParam -= chainId * 2 + 8;
        }
        var digest = keccak256_1.keccak256(RLP.encode(raw));
        try {
            tx.from = secp256k1_1.recoverAddress(digest, { r: bytes_1.hexlify(r), s: bytes_1.hexlify(s), recoveryParam: recoveryParam });
        }
        catch (error) {
            console.log(error);
        }
        tx.hash = keccak256_1.keccak256(rawTransaction);
    }
    return tx;
}
exports.parse = parse;
