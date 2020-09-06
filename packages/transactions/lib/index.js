"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var address_1 = require("@ethersproject/address");
var bignumber_1 = require("@ethersproject/bignumber");
var bytes_1 = require("@ethersproject/bytes");
var constants_1 = require("@ethersproject/constants");
var keccak256_1 = require("@ethersproject/keccak256");
var properties_1 = require("@ethersproject/properties");
var RLP = __importStar(require("@ethersproject/rlp"));
var signing_key_1 = require("@ethersproject/signing-key");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
///////////////////////////////
function handleAddress(value) {
    if (value === "0x") {
        return null;
    }
    return address_1.getAddress(value);
}
function handleNumber(value) {
    if (value === "0x") {
        return constants_1.Zero;
    }
    return bignumber_1.BigNumber.from(value);
}
var transactionFields = [
    { name: "nonce", maxLength: 32, numeric: true },
    { name: "gasPrice", maxLength: 32, numeric: true },
    { name: "gasLimit", maxLength: 32, numeric: true },
    { name: "to", length: 20 },
    { name: "value", maxLength: 32, numeric: true },
    { name: "data" },
];
var allowedTransactionKeys = {
    chainId: true, data: true, gasLimit: true, gasPrice: true, nonce: true, to: true, value: true
};
function computeAddress(key) {
    var publicKey = signing_key_1.computePublicKey(key);
    return address_1.getAddress(bytes_1.hexDataSlice(keccak256_1.keccak256(bytes_1.hexDataSlice(publicKey, 1)), 12));
}
exports.computeAddress = computeAddress;
function recoverAddress(digest, signature) {
    return computeAddress(signing_key_1.recoverPublicKey(bytes_1.arrayify(digest), signature));
}
exports.recoverAddress = recoverAddress;
function serialize(transaction, signature) {
    properties_1.checkProperties(transaction, allowedTransactionKeys);
    var raw = [];
    transactionFields.forEach(function (fieldInfo) {
        var value = transaction[fieldInfo.name] || ([]);
        var options = {};
        if (fieldInfo.numeric) {
            options.hexPad = "left";
        }
        value = bytes_1.arrayify(bytes_1.hexlify(value, options));
        // Fixed-width field
        if (fieldInfo.length && value.length !== fieldInfo.length && value.length > 0) {
            logger.throwArgumentError("invalid length for " + fieldInfo.name, ("transaction:" + fieldInfo.name), value);
        }
        // Variable-width (with a maximum)
        if (fieldInfo.maxLength) {
            value = bytes_1.stripZeros(value);
            if (value.length > fieldInfo.maxLength) {
                logger.throwArgumentError("invalid length for " + fieldInfo.name, ("transaction:" + fieldInfo.name), value);
            }
        }
        raw.push(bytes_1.hexlify(value));
    });
    var chainId = 0;
    if (transaction.chainId != null) {
        // A chainId was provided; if non-zero we'll use EIP-155
        chainId = transaction.chainId;
        if (typeof (chainId) !== "number") {
            logger.throwArgumentError("invalid transaction.chainId", "transaction", transaction);
        }
    }
    else if (signature && !bytes_1.isBytesLike(signature) && signature.v > 28) {
        // No chainId provided, but the signature is signing with EIP-155; derive chainId
        chainId = Math.floor((signature.v - 35) / 2);
    }
    // We have an EIP-155 transaction (chainId was specified and non-zero)
    if (chainId !== 0) {
        raw.push(bytes_1.hexlify(chainId)); // @TODO: hexValue?
        raw.push("0x");
        raw.push("0x");
    }
    // Requesting an unsigned transation
    if (!signature) {
        return RLP.encode(raw);
    }
    // The splitSignature will ensure the transaction has a recoveryParam in the
    // case that the signTransaction function only adds a v.
    var sig = bytes_1.splitSignature(signature);
    // We pushed a chainId and null r, s on for hashing only; remove those
    var v = 27 + sig.recoveryParam;
    if (chainId !== 0) {
        raw.pop();
        raw.pop();
        raw.pop();
        v += chainId * 2 + 8;
        // If an EIP-155 v (directly or indirectly; maybe _vs) was provided, check it!
        if (sig.v > 28 && sig.v !== v) {
            logger.throwArgumentError("transaction.chainId/signature.v mismatch", "signature", signature);
        }
    }
    else if (sig.v !== v) {
        logger.throwArgumentError("transaction.chainId/signature.v mismatch", "signature", signature);
    }
    raw.push(bytes_1.hexlify(v));
    raw.push(bytes_1.stripZeros(bytes_1.arrayify(sig.r)));
    raw.push(bytes_1.stripZeros(bytes_1.arrayify(sig.s)));
    return RLP.encode(raw);
}
exports.serialize = serialize;
function parse(rawTransaction) {
    var transaction = RLP.decode(rawTransaction);
    if (transaction.length !== 9 && transaction.length !== 6) {
        logger.throwArgumentError("invalid raw transaction", "rawTransaction", rawTransaction);
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
        tx.v = bignumber_1.BigNumber.from(transaction[6]).toNumber();
    }
    catch (error) {
        console.log(error);
        return tx;
    }
    tx.r = bytes_1.hexZeroPad(transaction[7], 32);
    tx.s = bytes_1.hexZeroPad(transaction[8], 32);
    if (bignumber_1.BigNumber.from(tx.r).isZero() && bignumber_1.BigNumber.from(tx.s).isZero()) {
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
            raw.push("0x");
            raw.push("0x");
            recoveryParam -= tx.chainId * 2 + 8;
        }
        var digest = keccak256_1.keccak256(RLP.encode(raw));
        try {
            tx.from = recoverAddress(digest, { r: bytes_1.hexlify(tx.r), s: bytes_1.hexlify(tx.s), recoveryParam: recoveryParam });
        }
        catch (error) {
            console.log(error);
        }
        tx.hash = keccak256_1.keccak256(rawTransaction);
    }
    return tx;
}
exports.parse = parse;
//# sourceMappingURL=index.js.map