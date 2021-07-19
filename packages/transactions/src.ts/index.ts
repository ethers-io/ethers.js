"use strict";

import { getAddress } from "@ethersproject/address";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { arrayify, BytesLike, DataOptions, hexConcat, hexDataLength, hexDataSlice, hexlify, hexZeroPad, isBytesLike, SignatureLike, splitSignature, stripZeros, } from "@ethersproject/bytes";
import { Zero } from "@ethersproject/constants";
import { keccak256 } from "@ethersproject/keccak256";
import { checkProperties } from "@ethersproject/properties";
import * as RLP from "@ethersproject/rlp";
import { computePublicKey, recoverPublicKey } from "@ethersproject/signing-key";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
import { marshalEthereumTx } from "@summerpro/amino-js";
import SHA256 from "crypto-js/sha256";
import hexEncoding from "crypto-js/enc-hex";

const logger = new Logger(version);

///////////////////////////////
// Exported Types

export type AccessList = Array<{ address: string, storageKeys: Array<string> }>;

// Input allows flexibility in describing an access list
export type AccessListish = AccessList |
                            Array<[ string, Array<string> ]> |
                            Record<string, Array<string>>;

export enum TransactionTypes {
    legacy = 0,
    eip2930 = 1,
    eip1559 = 2,
};

export type UnsignedTransaction = {
    to?: string;
    nonce?: number;

    gasLimit?: BigNumberish;
    gasPrice?: BigNumberish;

    data?: BytesLike;
    value?: BigNumberish;
    chainId?: number;

    // Typed-Transaction features
    type?: number | null;

    // EIP-2930; Type 1 & EIP-1559; Type 2
    accessList?: AccessListish;

    // EIP-1559; Type 2
    maxPriorityFeePerGas?: BigNumberish;
    maxFeePerGas?: BigNumberish;
}

export interface Transaction {
    hash?: string;

    to?: string;
    from?: string;
    nonce: number;

    gasLimit: BigNumber;
    gasPrice?: BigNumber;

    data: string;
    value: BigNumber;
    chainId: number;

    r?: string;
    s?: string;
    v?: number;

    // Typed-Transaction features
    type?: number | null;

    // EIP-2930; Type 1 & EIP-1559; Type 2
    accessList?: AccessList;

    // EIP-1559; Type 2
    maxPriorityFeePerGas?: BigNumber;
    maxFeePerGas?: BigNumber;
}

///////////////////////////////

function handleAddress(value: string): string {
    if (value === "0x") { return null; }
    return getAddress(value);
}

function handleNumber(value: string): BigNumber {
    if (value === "0x") { return Zero; }
    return BigNumber.from(value);
}

// Legacy Transaction Fields
const transactionFields = [
    { name: "nonce",    maxLength: 32, numeric: true },
    { name: "gasPrice", maxLength: 32, numeric: true },
    { name: "gasLimit", maxLength: 32, numeric: true },
    { name: "to",          length: 20 },
    { name: "value",    maxLength: 32, numeric: true },
    { name: "data" },
];

const allowedTransactionKeys: { [ key: string ]: boolean } = {
    chainId: true, data: true, gasLimit: true, gasPrice:true, nonce: true, to: true, type: true, value: true
}

export function computeAddress(key: BytesLike | string): string {
    const publicKey = computePublicKey(key);
    return getAddress(hexDataSlice(keccak256(hexDataSlice(publicKey, 1)), 12));
}

export function recoverAddress(digest: BytesLike, signature: SignatureLike): string {
    return computeAddress(recoverPublicKey(arrayify(digest), signature));
}

function formatNumber(value: BigNumberish, name: string): Uint8Array {
    const result = stripZeros(BigNumber.from(value).toHexString());
    if (result.length > 32) {
        logger.throwArgumentError("invalid length for " + name, ("transaction:" + name), value);
    }
    return result;
}

function accessSetify(addr: string, storageKeys: Array<string>): { address: string,storageKeys: Array<string> } {
    return {
        address: getAddress(addr),
        storageKeys: (storageKeys || []).map((storageKey, index) => {
            if (hexDataLength(storageKey) !== 32) {
                logger.throwArgumentError("invalid access list storageKey", `accessList[${ addr }:${ index }]`, storageKey)
            }
            return storageKey.toLowerCase();
        })
    };
}

export function accessListify(value: AccessListish): AccessList {
    if (Array.isArray(value)) {
        return (<Array<[ string, Array<string>] | { address: string, storageKeys: Array<string>}>>value).map((set, index) => {
            if (Array.isArray(set)) {
                if (set.length > 2) {
                    logger.throwArgumentError("access list expected to be [ address, storageKeys[] ]", `value[${ index }]`, set);
                }
                return accessSetify(set[0], set[1])
            }
            return accessSetify(set.address, set.storageKeys);
        });
    }

    const result: Array<{ address: string, storageKeys: Array<string> }> = Object.keys(value).map((addr) => {
        const storageKeys: Record<string, true> = value[addr].reduce((accum, storageKey) => {
            accum[storageKey] = true;
            return accum;
        }, <Record<string, true>>{ });
        return accessSetify(addr, Object.keys(storageKeys).sort())
    });
    result.sort((a, b) => (a.address.localeCompare(b.address)));
    return result;
}

function formatAccessList(value: AccessListish): Array<[ string, Array<string> ]> {
    return accessListify(value).map((set) => [ set.address, set.storageKeys ]);
}

function _serializeEip1559(transaction: UnsignedTransaction, signature?: SignatureLike): string {
    // If there is an explicit gasPrice, make sure it matches the
    // EIP-1559 fees; otherwise they may not understand what they
    // think they are setting in terms of fee.
    if (transaction.gasPrice != null) {
        const gasPrice = BigNumber.from(transaction.gasPrice);
        const maxFeePerGas = BigNumber.from(transaction.maxFeePerGas || 0);
        if (!gasPrice.eq(maxFeePerGas)) {
            logger.throwArgumentError("mismatch EIP-1559 gasPrice != maxFeePerGas", "tx", {
                gasPrice, maxFeePerGas
            });
        }
    }

    const fields: any = [
        formatNumber(transaction.chainId || 0, "chainId"),
        formatNumber(transaction.nonce || 0, "nonce"),
        formatNumber(transaction.maxPriorityFeePerGas || 0, "maxPriorityFeePerGas"),
        formatNumber(transaction.maxFeePerGas || 0, "maxFeePerGas"),
        formatNumber(transaction.gasLimit || 0, "gasLimit"),
        ((transaction.to != null) ? getAddress(transaction.to): "0x"),
        formatNumber(transaction.value || 0, "value"),
        (transaction.data || "0x"),
        (formatAccessList(transaction.accessList || []))
    ];

    if (signature) {
        const sig = splitSignature(signature);
        fields.push(formatNumber(sig.recoveryParam, "recoveryParam"));
        fields.push(stripZeros(sig.r));
        fields.push(stripZeros(sig.s));
    }

    return hexConcat([ "0x02", RLP.encode(fields)]);
}

function _serializeEip2930(transaction: UnsignedTransaction, signature?: SignatureLike): string {
    const fields: any = [
        formatNumber(transaction.chainId || 0, "chainId"),
        formatNumber(transaction.nonce || 0, "nonce"),
        formatNumber(transaction.gasPrice || 0, "gasPrice"),
        formatNumber(transaction.gasLimit || 0, "gasLimit"),
        ((transaction.to != null) ? getAddress(transaction.to): "0x"),
        formatNumber(transaction.value || 0, "value"),
        (transaction.data || "0x"),
        (formatAccessList(transaction.accessList || []))
    ];

    if (signature) {
        const sig = splitSignature(signature);
        fields.push(formatNumber(sig.recoveryParam, "recoveryParam"));
        fields.push(stripZeros(sig.r));
        fields.push(stripZeros(sig.s));
    }

    return hexConcat([ "0x01", RLP.encode(fields)]);
}

// Legacy Transactions and EIP-155
function _serialize(transaction: UnsignedTransaction, signature?: SignatureLike): string {
    checkProperties(transaction, allowedTransactionKeys);

    const raw: Array<string | Uint8Array> = [];

    transactionFields.forEach(function(fieldInfo) {
        let value = (<any>transaction)[fieldInfo.name] || ([]);
        const options: DataOptions = { };
        if (fieldInfo.numeric) { options.hexPad = "left"; }
        value = arrayify(hexlify(value, options));

        // Fixed-width field
        if (fieldInfo.length && value.length !== fieldInfo.length && value.length > 0) {
            logger.throwArgumentError("invalid length for " + fieldInfo.name, ("transaction:" + fieldInfo.name), value);
        }

        // Variable-width (with a maximum)
        if (fieldInfo.maxLength) {
            value = stripZeros(value);
            if (value.length > fieldInfo.maxLength) {
                logger.throwArgumentError("invalid length for " + fieldInfo.name, ("transaction:" + fieldInfo.name), value );
            }
        }

        raw.push(hexlify(value));
    });

    let chainId = 0;
    if (transaction.chainId != null) {
        // A chainId was provided; if non-zero we'll use EIP-155
        chainId = transaction.chainId;

        if (typeof(chainId) !== "number") {
            logger.throwArgumentError("invalid transaction.chainId", "transaction", transaction);
        }

    } else if (signature && !isBytesLike(signature) && signature.v > 28) {
        // No chainId provided, but the signature is signing with EIP-155; derive chainId
        chainId = Math.floor((signature.v - 35) / 2);
    }

    // We have an EIP-155 transaction (chainId was specified and non-zero)
    if (chainId !== 0) {
        raw.push(hexlify(chainId)); // @TODO: hexValue?
        raw.push("0x");
        raw.push("0x");
    }

    // Requesting an unsigned transation
    if (!signature) {
        return RLP.encode(raw);
    }

    // The splitSignature will ensure the transaction has a recoveryParam in the
    // case that the signTransaction function only adds a v.
    const sig = splitSignature(signature);

    // We pushed a chainId and null r, s on for hashing only; remove those
    let v = 27 + sig.recoveryParam
    if (chainId !== 0) {
        raw.pop();
        raw.pop();
        raw.pop();
        v += chainId * 2 + 8;

        // If an EIP-155 v (directly or indirectly; maybe _vs) was provided, check it!
        if (sig.v > 28 && sig.v !== v) {
             logger.throwArgumentError("transaction.chainId/signature.v mismatch", "signature", signature);
        }
    } else if (sig.v !== v) {
         logger.throwArgumentError("transaction.chainId/signature.v mismatch", "signature", signature);
    }

    raw.push(hexlify(v));
    raw.push(stripZeros(arrayify(sig.r)));
    raw.push(stripZeros(arrayify(sig.s)));

    return RLP.encode(raw);
}

export function serialize(transaction: UnsignedTransaction, signature?: SignatureLike): string {
    // Legacy and EIP-155 Transactions
    if (transaction.type == null || transaction.type === 0) {
        if (transaction.accessList != null) {
            logger.throwArgumentError("untyped transactions do not support accessList; include type: 1", "transaction", transaction);
        }
        return _serialize(transaction, signature);
    }

    // Typed Transactions (EIP-2718)
    switch (transaction.type) {
        case 1:
            return _serializeEip2930(transaction, signature);
        case 2:
            return _serializeEip1559(transaction, signature);
        default:
            break;
    }

    return logger.throwError(`unsupported transaction type: ${ transaction.type }`, Logger.errors.UNSUPPORTED_OPERATION, {
        operation: "serializeTransaction",
        transactionType: transaction.type
    });
}

function _parseEipSignature(tx: Transaction, fields: Array<string>, serialize: (tx: UnsignedTransaction) => string): void {
    try {
        const recid = handleNumber(fields[0]).toNumber();
        if (recid !== 0 && recid !== 1) { throw new Error("bad recid"); }
        tx.v = recid;
    } catch (error) {
        logger.throwArgumentError("invalid v for transaction type: 1", "v", fields[0]);
    }

    tx.r = hexZeroPad(fields[1], 32);
    tx.s = hexZeroPad(fields[2], 32);

    try {
        const digest = keccak256(serialize(tx));
        tx.from = recoverAddress(digest, { r: tx.r, s: tx.s, recoveryParam: tx.v });
    } catch (error) {
        console.log(error);
    }
}

function _parseEip1559(payload: Uint8Array): Transaction {
    const transaction = RLP.decode(payload.slice(1));

    if (transaction.length !== 9 && transaction.length !== 12) {
        logger.throwArgumentError("invalid component count for transaction type: 2", "payload", hexlify(payload));
    }

    const maxPriorityFeePerGas = handleNumber(transaction[2]);
    const maxFeePerGas = handleNumber(transaction[3]);
    const tx: Transaction = {
        type:                  2,
        chainId:               handleNumber(transaction[0]).toNumber(),
        nonce:                 handleNumber(transaction[1]).toNumber(),
        maxPriorityFeePerGas:  maxPriorityFeePerGas,
        maxFeePerGas:          maxFeePerGas,
        gasPrice:              null,
        gasLimit:              handleNumber(transaction[4]),
        to:                    handleAddress(transaction[5]),
        value:                 handleNumber(transaction[6]),
        data:                  transaction[7],
        accessList:            accessListify(transaction[8]),
    };

    // Unsigned EIP-1559 Transaction
    if (transaction.length === 9) { return tx; }

    tx.hash = keccak256(payload);

    _parseEipSignature(tx, transaction.slice(9), _serializeEip1559);

    return tx;
}

function _parseEip2930(payload: Uint8Array): Transaction {
    const transaction = RLP.decode(payload.slice(1));

    if (transaction.length !== 8 && transaction.length !== 11) {
        logger.throwArgumentError("invalid component count for transaction type: 1", "payload", hexlify(payload));
    }

    const tx: Transaction = {
        type:       1,
        chainId:    handleNumber(transaction[0]).toNumber(),
        nonce:      handleNumber(transaction[1]).toNumber(),
        gasPrice:   handleNumber(transaction[2]),
        gasLimit:   handleNumber(transaction[3]),
        to:         handleAddress(transaction[4]),
        value:      handleNumber(transaction[5]),
        data:       transaction[6],
        accessList: accessListify(transaction[7])
    };

    // Unsigned EIP-2930 Transaction
    if (transaction.length === 8) { return tx; }

    if (isExChain(tx.chainId)) {
        tx.hash = buildExChainTxHash(
            handleNumber(transaction[1]).toString(),
            tx.gasPrice.toString(),
            tx.gasLimit.toString(),
            tx.to,
            tx.value.toString(),
            tx.data,
            handleNumber(transaction[8]).toString(),
            handleNumber(transaction[9]).toString(),
            handleNumber(transaction[10]).toString(),
        );
    }else {
        tx.hash = keccak256(payload)
    }

    _parseEipSignature(tx, transaction.slice(8), _serializeEip2930);

    return tx;
}

// Legacy Transactions and EIP-155
function _parse(rawTransaction: Uint8Array): Transaction {
    const transaction = RLP.decode(rawTransaction);

    if (transaction.length !== 9 && transaction.length !== 6) {
        logger.throwArgumentError("invalid raw transaction", "rawTransaction", rawTransaction);
    }

    const tx: Transaction = {
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
        tx.v = BigNumber.from(transaction[6]).toNumber();

    } catch (error) {
        console.log(error);
        return tx;
    }

    tx.r = hexZeroPad(transaction[7], 32);
    tx.s = hexZeroPad(transaction[8], 32);

    if (BigNumber.from(tx.r).isZero() && BigNumber.from(tx.s).isZero()) {
        // EIP-155 unsigned transaction
        tx.chainId = tx.v;
        tx.v = 0;

    } else {
        // Signed Tranasaction

        tx.chainId = Math.floor((tx.v - 35) / 2);
        if (tx.chainId < 0) { tx.chainId = 0; }

        let recoveryParam = tx.v - 27;

        const raw = transaction.slice(0, 6);

        if (tx.chainId !== 0) {
            raw.push(hexlify(tx.chainId));
            raw.push("0x");
            raw.push("0x");
            recoveryParam -= tx.chainId * 2 + 8;
        }

        const digest = keccak256(RLP.encode(raw));
        try {
            tx.from = recoverAddress(digest, { r: hexlify(tx.r), s: hexlify(tx.s), recoveryParam: recoveryParam });
        } catch (error) {
            console.log(error);
        }

        if (isExChain(tx.chainId)) {
            tx.hash = buildExChainTxHash(
                handleNumber(transaction[0]).toString(),
                tx.gasPrice.toString(),
                tx.gasLimit.toString(),
                tx.to,
                tx.value.toString(),
                tx.data,
                handleNumber(transaction[6]).toString(),
                handleNumber(transaction[7]).toString(),
                handleNumber(transaction[8]).toString(),
            )
        } else {
            tx.hash = keccak256(rawTransaction);
        }

    }

    tx.type = null;

    return tx;
}


export function parse(rawTransaction: BytesLike): Transaction {
    const payload = arrayify(rawTransaction);

    // Legacy and EIP-155 Transactions
    if (payload[0] > 0x7f) { return _parse(payload); }

    // Typed Transaction (EIP-2718)
    switch (payload[0]) {
        case 1:
            return _parseEip2930(payload);
        case 2:
            return _parseEip1559(payload);
        default:
            break;
    }

    return logger.throwError(`unsupported transaction type: ${ payload[0] }`, Logger.errors.UNSUPPORTED_OPERATION, {
        operation: "parseTransaction",
        transactionType: payload[0]
    });
}

function isExChain(chainId: number): boolean {
    return chainId == 65 || chainId == 66;
}

function buildExChainTxHash(nonce: string, gasPrice: string, gas: string, to: string, value: string, input: string, v: string, r: string, s: string): string {
    const aminoTx = {
        nonce: nonce,
        gasPrice: gasPrice,
        gas: gas,
        to: to,
        value: value,
        input: input,
        v: v,
        r: r,
        s: s,
    };
    const encodedTx = marshalEthereumTx(aminoTx);
    const hexBytes = Buffer.from(encodedTx).toString("hex")
    return "0x" + SHA256(hexEncoding.parse(hexBytes)).toString()
}