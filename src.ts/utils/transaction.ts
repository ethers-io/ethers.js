
import { Zero } from '../constants';

import * as errors from '../errors';

import { recoverAddress } from './secp256k1';

import { getAddress } from './address';
import { BigNumber, bigNumberify } from './bignumber';
import { arrayify, hexlify, hexZeroPad, splitSignature, stripZeros, } from './bytes';
import { keccak256 } from './keccak256';
import { checkProperties, resolveProperties, shallowCopy } from './properties';

import * as RLP from './rlp';


///////////////////////////////
// Imported Types

import { Arrayish, Signature } from './bytes';
import { BigNumberish } from './bignumber';

import { Provider } from '../providers/abstract-provider';

///////////////////////////////
// Exported Types

export type UnsignedTransaction = {
    to?: string;
    nonce?: number;

    gasLimit?: BigNumberish;
    gasPrice?: BigNumberish;

    data?: Arrayish;
    value?: BigNumberish;
    chainId?: number;
}

export interface Transaction {
    hash?: string;

    to?: string;
    from?: string;
    nonce: number;

    gasLimit: BigNumber;
    gasPrice: BigNumber;

    data: string;
    value: BigNumber;
    chainId: number;

    r?: string;
    s?: string;
    v?: number;
}

///////////////////////////////

function handleAddress(value: string): string {
    if (value === '0x') { return null; }
    return getAddress(value);
}

function handleNumber(value: string): BigNumber {
    if (value === '0x') { return Zero; }
    return bigNumberify(value);
}

const transactionFields = [
    { name: 'nonce',    maxLength: 32 },
    { name: 'gasPrice', maxLength: 32 },
    { name: 'gasLimit', maxLength: 32 },
    { name: 'to',          length: 20 },
    { name: 'value',    maxLength: 32 },
    { name: 'data' },
];

const allowedTransactionKeys: { [ key: string ]: boolean } = {
    chainId: true, data: true, gasLimit: true, gasPrice:true, nonce: true, to: true, value: true
}

export function serialize(transaction: UnsignedTransaction, signature?: Arrayish | Signature): string {
    checkProperties(transaction, allowedTransactionKeys);

    let raw: Array<string | Uint8Array> = [];

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
    let sig = splitSignature(signature);

    // We pushed a chainId and null r, s on for hashing only; remove those
    let v = 27 + sig.recoveryParam
    if (raw.length === 9) {
        raw.pop();
        raw.pop();
        raw.pop();
        v += transaction.chainId * 2 + 8;
    }

    raw.push(hexlify(v));
    raw.push(stripZeros(arrayify(sig.r)));
    raw.push(stripZeros(arrayify(sig.s)));

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
        errors.info(error);
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

        let recoveryParam = tx.v - 27;

        let raw = transaction.slice(0, 6);

        if (tx.chainId !== 0) {
            raw.push(hexlify(tx.chainId));
            raw.push('0x');
            raw.push('0x');
            recoveryParam -= tx.chainId * 2 + 8;
        }

        let digest = keccak256(RLP.encode(raw));
        try {
            tx.from = recoverAddress(digest, { r: hexlify(tx.r), s: hexlify(tx.s), recoveryParam: recoveryParam });
        } catch (error) {
            errors.info(error);
        }

        tx.hash = keccak256(rawTransaction);
    }

    return tx;
}

export function populateTransaction(transaction: any, provider: Provider, from: string | Promise<string>): Promise<Transaction> {

    if (!Provider.isProvider(provider)) {
        errors.throwError('missing provider', errors.INVALID_ARGUMENT, {
            argument: 'provider',
            value: provider
        });
    }

    checkProperties(transaction, allowedTransactionKeys);

    let tx = shallowCopy(transaction);

    if (tx.to != null) {
        tx.to = provider.resolveName(tx.to);
    }

    if (tx.gasPrice == null) {
        tx.gasPrice = provider.getGasPrice();
    }

    if (tx.nonce == null) {
        tx.nonce = provider.getTransactionCount(from);
    }

    if (tx.gasLimit == null) {
        let estimate = shallowCopy(tx);
        estimate.from = from;
        tx.gasLimit = provider.estimateGas(estimate);
    }

    if (tx.chainId == null) {
        tx.chainId = provider.getNetwork().then((network) => network.chainId);
    }

    return resolveProperties(tx);
}
