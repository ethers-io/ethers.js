
import { getAddress } from './address';
import { bigNumberify, ConstantZero } from './bignumber';
import { arrayify, hexlify, hexZeroPad, splitSignature, stripZeros, } from './bytes';
import { keccak256 } from './keccak256';

import * as RLP from './rlp';

import { Arrayish, BigNumber, Signature, Transaction, UnsignedTransaction } from './types';

import * as errors from './errors';

/* !!!!!!!!!!!!!!!!!!!!!!!! IMPORTANT !!!!!!!!!!!!!!!!!!!!!!!
 *
 *  Due to a weird ordering-issue with browserify, there is an
 *  import for secp256k1 at the bottom of the file; it must be
 *  required AFTER the parse and serialize exports have been
 *  defined.
 *
 */

function handleAddress(value: string): string {
    if (value === '0x') { return null; }
    return getAddress(value);
}

function handleNumber(value: string): BigNumber {
    if (value === '0x') { return ConstantZero; }
    return bigNumberify(value);
}

var transactionFields = [
    { name: 'nonce',    maxLength: 32 },
    { name: 'gasPrice', maxLength: 32 },
    { name: 'gasLimit', maxLength: 32 },
    { name: 'to',          length: 20 },
    { name: 'value',    maxLength: 32 },
    { name: 'data' },
];

export function serialize(transaction: UnsignedTransaction, signature?: Arrayish | Signature): string {
    var raw: Array<string | Uint8Array> = [];

    transactionFields.forEach(function(fieldInfo) {
        let value = (<any>transaction)[fieldInfo.name] || ([]);
        value = arrayify(hexlify(value));

        // Fixed-width field
        if (fieldInfo.length && value.length !== fieldInfo.length && value.length > 0) {
            errors.throwError('invalid length for ' + fieldInfo.name, errors.INVALID_ARGUMENT, { arg: ('transaction' + fieldInfo.name), value: value });
        }

        // Variable-width (with a maximum)
        if (fieldInfo.maxLength) {
            value = stripZeros(value);
            if (value.length > fieldInfo.maxLength) {
                errors.throwError('invalid length for ' + fieldInfo.name, errors.INVALID_ARGUMENT, { arg: ('transaction' + fieldInfo.name), value: value });
            }
        }

        raw.push(hexlify(value));
    });

    if (transaction.chainId != null && transaction.chainId !== 0) {
        raw.push(hexlify(transaction.chainId));
        raw.push('0x');
        raw.push('0x');
    }

    let unsignedTransaction = RLP.encode(raw);

    // Requesting an unsigned transation
    if (!signature) {
        return unsignedTransaction;
    }

    // The splitSignature will ensure the transaction has a recoveryParam in the
    // case that the signTransaction function only adds a v.
    signature = splitSignature(signature);

    // We pushed a chainId and null r, s on for hashing only; remove those
    var v = 27 + signature.recoveryParam
    if (raw.length === 9) {
        raw.pop();
        raw.pop();
        raw.pop();
        v += transaction.chainId * 2 + 8;
    }

    raw.push(hexlify(v));
    raw.push(stripZeros(arrayify(signature.r)));
    raw.push(stripZeros(arrayify(signature.s)));

    return RLP.encode(raw);
}

export function parse(rawTransaction: Arrayish): Transaction {
    let transaction = RLP.decode(rawTransaction);
    if (transaction.length !== 9 && transaction.length !== 6) {
        errors.throwError('invalid raw transaction', errors.INVALID_ARGUMENT, { arg: 'rawTransactin', value: rawTransaction });
    }

    let tx: Transaction = {
        nonce:    handleNumber(transaction[0]).toNumber(),
        gasPrice: handleNumber(transaction[1]),
        gasLimit: handleNumber(transaction[2]),
        to:       handleAddress(transaction[3]),
        value:    handleNumber(transaction[4]),
        data:     transaction[5],
        chainId:  0
    };

    // Legacy unsigned transaction
    if (transaction.length === 6) { return tx; }

    try {
        tx.v = bigNumberify(transaction[6]).toNumber();

    } catch (error) {
        console.log(error);
        return tx;
    }

    tx.r = hexZeroPad(transaction[7], 32);
    tx.s = hexZeroPad(transaction[8], 32);

    if (bigNumberify(tx.r).isZero() && bigNumberify(tx.s).isZero()) {
        // EIP-155 unsigned transaction
        tx.chainId = tx.v;
        tx.v = 0;

    } else {
        // Signed Tranasaction

        tx.chainId = Math.floor((tx.v - 35) / 2);
        if (tx.chainId < 0) { tx.chainId = 0; }

        var recoveryParam = tx.v - 27;

        let raw = transaction.slice(0, 6);

        if (tx.chainId !== 0) {
            raw.push(hexlify(tx.chainId));
            raw.push('0x');
            raw.push('0x');
            recoveryParam -= tx.chainId * 2 + 8;
        }

        var digest = keccak256(RLP.encode(raw));
        try {
            tx.from = recoverAddress(digest, { r: hexlify(tx.r), s: hexlify(tx.s), recoveryParam: recoveryParam });
        } catch (error) {
            console.log(error);
        }

        tx.hash = keccak256(rawTransaction);
    }

    return tx;
}

import { recoverAddress } from './secp256k1';
