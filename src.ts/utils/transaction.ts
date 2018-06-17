
import { getAddress } from './address';
import { BigNumber, bigNumberify, BigNumberish,ConstantZero } from './bignumber';
import { arrayify, Arrayish, hexlify, stripZeros, } from './convert';
import { keccak256 } from './keccak256';
import { recoverAddress, Signature } from './secp256k1';
import * as RLP from './rlp';

export interface UnsignedTransaction {
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


function handleAddress(value: string): string {
    if (value === '0x') { return null; }
    return getAddress(value);
}

function handleNumber(value: string): BigNumber {
    if (value === '0x') { return ConstantZero; }
    return bigNumberify(value);
}

var transactionFields = [
    {name: 'nonce',    maxLength: 32 },
    {name: 'gasPrice', maxLength: 32 },
    {name: 'gasLimit', maxLength: 32 },
    {name: 'to',          length: 20 },
    {name: 'value',    maxLength: 32 },
    {name: 'data' },
];


export type SignDigestFunc = (digest: Arrayish) => Signature;

export function sign(transaction: UnsignedTransaction, signDigest: SignDigestFunc): string {

    var raw = [];

    transactionFields.forEach(function(fieldInfo) {
        let value = transaction[fieldInfo.name] || ([]);
        value = arrayify(hexlify(value));

        // Fixed-width field
        if (fieldInfo.length && value.length !== fieldInfo.length && value.length > 0) {
            let error: any = new Error('invalid ' + fieldInfo.name);
            error.reason = 'wrong length';
            error.value = value;
            throw error;
        }

        // Variable-width (with a maximum)
        if (fieldInfo.maxLength) {
            value = stripZeros(value);
            if (value.length > fieldInfo.maxLength) {
                let error: any = new Error('invalid ' + fieldInfo.name);
                error.reason = 'too long';
                error.value = value;
                throw error;
            }
        }

        raw.push(hexlify(value));
    });

    if (transaction.chainId) {
        raw.push(hexlify(transaction.chainId));
        raw.push('0x');
        raw.push('0x');
    }

    var digest = keccak256(RLP.encode(raw));

    var signature = signDigest(digest);

    var v = 27 + signature.recoveryParam
    if (transaction.chainId) {
        raw.pop();
        raw.pop();
        raw.pop();
        v += transaction.chainId * 2 + 8;
    }

    raw.push(hexlify(v));
    raw.push(signature.r);
    raw.push(signature.s);

    return RLP.encode(raw);
}

export function parse(rawTransaction: Arrayish): Transaction {
    var signedTransaction = RLP.decode(rawTransaction);
    if (signedTransaction.length !== 9) { throw new Error('invalid transaction'); }

    let tx: Transaction = {
        nonce:    handleNumber(signedTransaction[0]).toNumber(),
        gasPrice: handleNumber(signedTransaction[1]),
        gasLimit: handleNumber(signedTransaction[2]),
        to:       handleAddress(signedTransaction[3]),
        value:    handleNumber(signedTransaction[4]),
        data:     signedTransaction[5],
        chainId:  0
    };

    var v = arrayify(signedTransaction[6]);
    var r = arrayify(signedTransaction[7]);
    var s = arrayify(signedTransaction[8]);

    if (v.length >= 1 && r.length >= 1 && r.length <= 32 && s.length >= 1 && s.length <= 32) {
        tx.v = bigNumberify(v).toNumber();
        tx.r = signedTransaction[7];
        tx.s = signedTransaction[8];

        var chainId = (tx.v - 35) / 2;
        if (chainId < 0) { chainId = 0; }
        chainId = Math.trunc(chainId);

        tx.chainId = chainId;

        var recoveryParam = tx.v - 27;

        let raw = signedTransaction.slice(0, 6);

        if (chainId) {
            raw.push(hexlify(chainId));
            raw.push('0x');
            raw.push('0x');
            recoveryParam -= chainId * 2 + 8;
        }

        var digest = keccak256(RLP.encode(raw));
        try {
            tx.from = recoverAddress(digest, { r: hexlify(r), s: hexlify(s), recoveryParam: recoveryParam });
        } catch (error) {
            console.log(error);
        }

        tx.hash = keccak256(rawTransaction);
    }

    return tx;
}
