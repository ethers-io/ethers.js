
import { getAddress } from "../address/index.js";
import { keccak256, Signature, SigningKey } from "../crypto/index.js";
import {
    concat, decodeRlp, encodeRlp, getBytes, getBigInt, getNumber, hexlify,
    assert, assertArgument, toArray, zeroPadValue
} from "../utils/index.js";

import { accessListify } from "./accesslist.js";
import { recoverAddress } from "./address.js";

import type { BigNumberish, BytesLike } from "../utils/index.js";
import type { SignatureLike } from "../crypto/index.js";

import type { AccessList, AccessListish } from "./index.js";


const BN_0 = BigInt(0);
const BN_2 = BigInt(2);
const BN_27 = BigInt(27)
const BN_28 = BigInt(28)
const BN_35 = BigInt(35);
const BN_MAX_UINT = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

export interface TransactionLike<A = string> {
    type?: null | number;

    to?: null | A;
    from?: null | A;

    nonce?: null | number;

    gasLimit?: null | BigNumberish;
    gasPrice?: null | BigNumberish;

    maxPriorityFeePerGas?: null | BigNumberish;
    maxFeePerGas?: null | BigNumberish;

    data?: null | string;
    value?: null | BigNumberish;
    chainId?: null | BigNumberish;

    hash?: null | string;

    signature?: null | SignatureLike;

    accessList?: null | AccessListish;
}

function handleAddress(value: string): null | string {
    if (value === "0x") { return null; }
    return getAddress(value);
}

function handleAccessList(value: any, param: string): AccessList {
    try {
        return accessListify(value);
    } catch (error: any) {
        assertArgument(false, error.message, param, value);
    }
}

function handleNumber(_value: string, param: string): number {
    if (_value === "0x") { return 0; }
    return getNumber(_value, param);
}

function handleUint(_value: string, param: string): bigint {
    if (_value === "0x") { return BN_0; }
    const value = getBigInt(_value, param);
    assertArgument(value <= BN_MAX_UINT, "value exceeds uint size", param, value);
    return value;
}

function formatNumber(_value: BigNumberish, name: string): Uint8Array {
    const value = getBigInt(_value, "value");
    const result = toArray(value);
    assertArgument(result.length <= 32, `value too large`, `tx.${ name }`, value);
    return result;
}

function formatAccessList(value: AccessListish): Array<[ string, Array<string> ]> {
    return accessListify(value).map((set) => [ set.address, set.storageKeys ]);
}

function _parseLegacy(data: Uint8Array): TransactionLike {
    const fields: any = decodeRlp(data);

    assertArgument(Array.isArray(fields) && (fields.length === 9 || fields.length === 6),
        "invalid field count for legacy transaction", "data", data);

    const tx: TransactionLike = {
        type:     0,
        nonce:    handleNumber(fields[0], "nonce"),
        gasPrice: handleUint(fields[1], "gasPrice"),
        gasLimit: handleUint(fields[2], "gasLimit"),
        to:       handleAddress(fields[3]),
        value:    handleUint(fields[4], "value"),
        data:     hexlify(fields[5]),
        chainId:  BN_0
    };

    // Legacy unsigned transaction
    if (fields.length === 6) { return tx; }

    const v = handleUint(fields[6], "v");
    const r = handleUint(fields[7], "r");
    const s = handleUint(fields[8], "s");

    if (r === BN_0 && s === BN_0) {
        // EIP-155 unsigned transaction
        tx.chainId = v;

    } else {

        // Compute the EIP-155 chain ID (or 0 for legacy)
        let chainId = (v - BN_35) / BN_2;
        if (chainId < BN_0) { chainId = BN_0; }
        tx.chainId = chainId

        // Signed Legacy Transaction
        assertArgument(chainId !== BN_0 || (v === BN_27 || v === BN_28), "non-canonical legacy v", "v", fields[6]);

        tx.signature = Signature.from({
            r: zeroPadValue(fields[7], 32),
            s: zeroPadValue(fields[8], 32),
            v
        });

        tx.hash = keccak256(data);
    }

    return tx;
}

function _serializeLegacy(tx: Transaction, sig?: Signature): string {
    const fields: Array<any> = [
        formatNumber(tx.nonce || 0, "nonce"),
        formatNumber(tx.gasPrice || 0, "gasPrice"),
        formatNumber(tx.gasLimit || 0, "gasLimit"),
        ((tx.to != null) ? getAddress(tx.to): "0x"),
        formatNumber(tx.value || 0, "value"),
        (tx.data || "0x"),
    ];

    let chainId = BN_0;
    if (tx.chainId != null) {
        // A chainId was provided; if non-zero we'll use EIP-155
        chainId = getBigInt(tx.chainId, "tx.chainId");

        // We have a chainId in the tx and an EIP-155 v in the signature,
        // make sure they agree with each other
        assertArgument(!sig || sig.networkV == null || sig.legacyChainId === chainId,
             "tx.chainId/sig.v mismatch", "sig", sig);

    } else if (sig) {
        // No chainId provided, but the signature is signing with EIP-155; derive chainId
        const legacy = sig.legacyChainId;
        if (legacy != null) { chainId = legacy; }
    }

    // Requesting an unsigned transaction
    if (!sig) {
        // We have an EIP-155 transaction (chainId was specified and non-zero)
        if (chainId !== BN_0) {
            fields.push(toArray(chainId));
            fields.push("0x");
            fields.push("0x");
        }

        return encodeRlp(fields);
    }

    // We pushed a chainId and null r, s on for hashing only; remove those
    let v = BigInt(27 + sig.yParity);
    if (chainId !== BN_0) {
        v = Signature.getChainIdV(chainId, sig.v);
    } else if (BigInt(sig.v) !== v) {
        assertArgument(false, "tx.chainId/sig.v mismatch", "sig", sig);
    }

    fields.push(toArray(v));
    fields.push(toArray(sig.r));
    fields.push(toArray(sig.s));

    return encodeRlp(fields);
}

function _parseEipSignature(tx: TransactionLike, fields: Array<string>, serialize: (tx: TransactionLike) => string): void {
    let yParity: number;
    try {
        yParity = handleNumber(fields[0], "yParity");
        if (yParity !== 0 && yParity !== 1) { throw new Error("bad yParity"); }
    } catch (error) {
        assertArgument(false, "invalid yParity", "yParity", fields[0]);
    }

    const r = zeroPadValue(fields[1], 32);
    const s = zeroPadValue(fields[2], 32);

    const signature = Signature.from({ r, s, yParity });
    tx.signature = signature;
}

function _parseEip1559(data: Uint8Array): TransactionLike {
    const fields: any = decodeRlp(getBytes(data).slice(1));

    assertArgument(Array.isArray(fields) && (fields.length === 9 || fields.length === 12),
        "invalid field count for transaction type: 2", "data", hexlify(data));

    const maxPriorityFeePerGas = handleUint(fields[2], "maxPriorityFeePerGas");
    const maxFeePerGas = handleUint(fields[3], "maxFeePerGas");
    const tx: TransactionLike = {
        type:                  2,
        chainId:               handleUint(fields[0], "chainId"),
        nonce:                 handleNumber(fields[1], "nonce"),
        maxPriorityFeePerGas:  maxPriorityFeePerGas,
        maxFeePerGas:          maxFeePerGas,
        gasPrice:              null,
        gasLimit:              handleUint(fields[4], "gasLimit"),
        to:                    handleAddress(fields[5]),
        value:                 handleUint(fields[6], "value"),
        data:                  hexlify(fields[7]),
        accessList:            handleAccessList(fields[8], "accessList"),
    };

    // Unsigned EIP-1559 Transaction
    if (fields.length === 9) { return tx; }

    tx.hash = keccak256(data);

    _parseEipSignature(tx, fields.slice(9), _serializeEip1559);

    return tx;
}

function _serializeEip1559(tx: TransactionLike, sig?: Signature): string {
    const fields: Array<any> = [
        formatNumber(tx.chainId || 0, "chainId"),
        formatNumber(tx.nonce || 0, "nonce"),
        formatNumber(tx.maxPriorityFeePerGas || 0, "maxPriorityFeePerGas"),
        formatNumber(tx.maxFeePerGas || 0, "maxFeePerGas"),
        formatNumber(tx.gasLimit || 0, "gasLimit"),
        ((tx.to != null) ? getAddress(tx.to): "0x"),
        formatNumber(tx.value || 0, "value"),
        (tx.data || "0x"),
        (formatAccessList(tx.accessList || []))
    ];

    if (sig) {
        fields.push(formatNumber(sig.yParity, "yParity"));
        fields.push(toArray(sig.r));
        fields.push(toArray(sig.s));
    }

    return concat([ "0x02", encodeRlp(fields)]);
}

function _parseEip2930(data: Uint8Array): TransactionLike {
    const fields: any = decodeRlp(getBytes(data).slice(1));

    assertArgument(Array.isArray(fields) && (fields.length === 8 || fields.length === 11),
        "invalid field count for transaction type: 1", "data", hexlify(data));

    const tx: TransactionLike = {
        type:       1,
        chainId:    handleUint(fields[0], "chainId"),
        nonce:      handleNumber(fields[1], "nonce"),
        gasPrice:   handleUint(fields[2], "gasPrice"),
        gasLimit:   handleUint(fields[3], "gasLimit"),
        to:         handleAddress(fields[4]),
        value:      handleUint(fields[5], "value"),
        data:       hexlify(fields[6]),
        accessList: handleAccessList(fields[7], "accessList")
    };

    // Unsigned EIP-2930 Transaction
    if (fields.length === 8) { return tx; }

    tx.hash = keccak256(data);

    _parseEipSignature(tx, fields.slice(8), _serializeEip2930);

    return tx;
}

function _serializeEip2930(tx: TransactionLike, sig?: Signature): string {
    const fields: any = [
        formatNumber(tx.chainId || 0, "chainId"),
        formatNumber(tx.nonce || 0, "nonce"),
        formatNumber(tx.gasPrice || 0, "gasPrice"),
        formatNumber(tx.gasLimit || 0, "gasLimit"),
        ((tx.to != null) ? getAddress(tx.to): "0x"),
        formatNumber(tx.value || 0, "value"),
        (tx.data || "0x"),
        (formatAccessList(tx.accessList || []))
    ];

    if (sig) {
        fields.push(formatNumber(sig.yParity, "recoveryParam"));
        fields.push(toArray(sig.r));
        fields.push(toArray(sig.s));
    }

    return concat([ "0x01", encodeRlp(fields)]);
}

export interface SignedTransaction extends Transaction {
    type: number;
    typeName: string;
    from: string;
    signature: Signature;
}


export class Transaction implements TransactionLike<string> {
    #type: null | number;
    #to: null | string;
    #data: string;
    #nonce: number;
    #gasLimit: bigint;
    #gasPrice: null | bigint;
    #maxPriorityFeePerGas: null | bigint;
    #maxFeePerGas: null | bigint;
    #value: bigint;
    #chainId: bigint;
    #sig: null | Signature;
    #accessList: null | AccessList;

    // A type of null indicates the type will be populated automatically
    get type(): null | number { return this.#type; }
    get typeName(): null | string {
        switch (this.type) {
            case 0: return "legacy";
            case 1: return "eip-2930";
            case 2: return "eip-1559";
        }

        return null;
    }
    set type(value: null | number | string) {
        switch (value) {
            case null:
                this.#type = null;
                break;
            case 0: case "legacy":
                this.#type = 0;
                break;
            case 1: case "berlin": case "eip-2930":
                this.#type = 1;
                break;
            case 2: case "london": case "eip-1559":
                this.#type = 2;
                break;
            default:
                assertArgument(false, "unsupported transaction type", "type", value);
        }
    }

    get to(): null | string { return this.#to; }
    set to(value: null | string) {
        this.#to = (value == null) ? null: getAddress(value);
    }

    get nonce(): number { return this.#nonce; }
    set nonce(value: BigNumberish) { this.#nonce = getNumber(value, "value"); }

    get gasLimit(): bigint { return this.#gasLimit; }
    set gasLimit(value: BigNumberish) { this.#gasLimit = getBigInt(value); }

    get gasPrice(): null | bigint {
        const value = this.#gasPrice;
        if (value == null && (this.type === 0 || this.type === 1)) { return BN_0; }
        return value;
    }
    set gasPrice(value: null | BigNumberish) {
        this.#gasPrice = (value == null) ? null: getBigInt(value, "gasPrice");
    }

    get maxPriorityFeePerGas(): null | bigint {
        const value = this.#maxPriorityFeePerGas;
        if (value == null) {
            if (this.type === 2) { return BN_0; }
            return null;
        }
        return value;
    }
    set maxPriorityFeePerGas(value: null | BigNumberish) {
        this.#maxPriorityFeePerGas = (value == null) ? null: getBigInt(value, "maxPriorityFeePerGas");
    }

    get maxFeePerGas(): null | bigint {
        const value = this.#maxFeePerGas;
        if (value == null) {
            if (this.type === 2) { return BN_0; }
            return null;
        }
        return value;
    }
    set maxFeePerGas(value: null | BigNumberish) {
        this.#maxFeePerGas = (value == null) ? null: getBigInt(value, "maxFeePerGas");
    }

    get data(): string { return this.#data; }
    set data(value: BytesLike) { this.#data = hexlify(value); }

    get value(): bigint { return this.#value; }
    set value(value: BigNumberish) {
        this.#value = getBigInt(value, "value");
    }

    get chainId(): bigint { return this.#chainId; }
    set chainId(value: BigNumberish) { this.#chainId = getBigInt(value); }

    get signature(): null | Signature { return this.#sig || null; }
    set signature(value: null | SignatureLike) {
        this.#sig = (value == null) ? null: Signature.from(value);
    }

    get accessList(): null | AccessList {
        const value = this.#accessList || null;
        if (value == null) {
            if (this.type === 1 || this.type === 2) { return [ ]; }
            return null;
        }
        return value;
    }
    set accessList(value: null | AccessListish) {
        this.#accessList = (value == null) ? null: accessListify(value);
    }

    constructor() {
        this.#type = null;
        this.#to = null;
        this.#nonce = 0;
        this.#gasLimit = BigInt(0);
        this.#gasPrice = null;
        this.#maxPriorityFeePerGas = null;
        this.#maxFeePerGas = null;
        this.#data = "0x";
        this.#value = BigInt(0);
        this.#chainId = BigInt(0);
        this.#sig = null;
        this.#accessList = null;
    }

    get hash(): null | string {
        if (this.signature == null) { return null; }
        return keccak256(this.serialized);
    }

    get unsignedHash(): string {
        return keccak256(this.unsignedSerialized);
    }

    get from(): null | string {
        if (this.signature == null) { return null; }
        return recoverAddress(this.unsignedHash, this.signature);
    }

    get fromPublicKey(): null | string {
        if (this.signature == null) { return null; }
        return SigningKey.recoverPublicKey(this.unsignedHash, this.signature);
    }

    isSigned(): this is SignedTransaction {
        return this.signature != null;
    }

    get serialized(): string {
        assert(this.signature != null, "cannot serialize unsigned transaction; maybe you meant .unsignedSerialized", "UNSUPPORTED_OPERATION", { operation: ".serialized"});

        switch (this.inferType()) {
            case 0:
                return _serializeLegacy(this, this.signature);
            case 1:
                return _serializeEip2930(this, this.signature);
            case 2:
                return _serializeEip1559(this, this.signature);
        }

        assert(false, "unsupported transaction type", "UNSUPPORTED_OPERATION", { operation: ".serialized" });
    }

    get unsignedSerialized(): string {
        switch (this.inferType()) {
            case 0:
                return _serializeLegacy(this);
            case 1:
                return _serializeEip2930(this);
            case 2:
                return _serializeEip1559(this);
        }

        assert(false, "unsupported transaction type", "UNSUPPORTED_OPERATION", { operation: ".unsignedSerialized" });
    }

    /**
     *  Return the most "likely" type; currently the highest
     *  supported transaction type
     */
    inferType(): number {
        return <number>(this.inferTypes().pop());
    }

    // Validates properties and lists possible types this transaction adheres to
    inferTypes(): Array<number> {

        // Checks that there are no conflicting properties set
        const hasGasPrice = this.gasPrice != null;
        const hasFee = (this.maxFeePerGas != null || this.maxPriorityFeePerGas != null);
        const hasAccessList = (this.accessList != null);

        //if (hasGasPrice && hasFee) {
        //    throw new Error("transaction cannot have gasPrice and maxFeePerGas");
        //}

        if (this.maxFeePerGas != null && this.maxPriorityFeePerGas != null) {
            assert(this.maxFeePerGas >= this.maxPriorityFeePerGas, "priorityFee cannot be more than maxFee", "BAD_DATA", { value: this });
        }

        //if (this.type === 2 && hasGasPrice) {
        //    throw new Error("eip-1559 transaction cannot have gasPrice");
        //}

        assert(!hasFee || (this.type !== 0 && this.type !== 1), "transaction type cannot have maxFeePerGas or maxPriorityFeePerGas", "BAD_DATA", { value: this });
        assert(this.type !== 0 || !hasAccessList, "legacy transaction cannot have accessList", "BAD_DATA", { value: this })

        const types: Array<number> = [ ];

        // Explicit type
        if (this.type != null) {
            types.push(this.type);

        } else {
            if (hasFee) {
                types.push(2);
            } else if (hasGasPrice) {
                types.push(1);
                if (!hasAccessList) { types.push(0); }
            } else if (hasAccessList) {
                types.push(1);
                types.push(2);
            } else {
                types.push(0);
                types.push(1);
                types.push(2);
            }
        }

        types.sort();

        return types;
    }

    isLegacy(): this is (Transaction & { type: 0, gasPrice: bigint }) {
        return (this.type === 0);
    }
    isBerlin(): this is (Transaction & { type: 1, gasPrice: bigint, accessList: AccessList }) {
        return (this.type === 1);
    }
    isLondon(): this is (Transaction & { type: 2, accessList: AccessList, maxFeePerGas: bigint, maxPriorityFeePerGas: bigint}) {
        return (this.type === 2);
    }

    clone(): Transaction {
        return Transaction.from(this);
    }

    toJSON(): any {
        const s = (v: null | bigint) => {
            if (v == null) { return null; }
            return v.toString();
        };

        return {
            type: this.type,
            to: this.to,
//            from: this.from,
            data: this.data,
            nonce: this.nonce,
            gasLimit: s(this.gasLimit),
            gasPrice: s(this.gasPrice),
            maxPriorityFeePerGas: s(this.maxPriorityFeePerGas),
            maxFeePerGas: s(this.maxFeePerGas),
            value: s(this.value),
            chainId: s(this.chainId),
            sig: this.signature ? this.signature.toJSON(): null,
            accessList: this.accessList
        };
    }

    static from(tx: string | TransactionLike<string>): Transaction {
        if (typeof(tx) === "string") {
            const payload = getBytes(tx);

            if (payload[0] >= 0x7f) { // @TODO: > vs >= ??
                return Transaction.from(_parseLegacy(payload));
            }

            switch(payload[0]) {
                case 1: return Transaction.from(_parseEip2930(payload));
                case 2: return Transaction.from(_parseEip1559(payload));
            }
            assert(false, "unsupported transaction type", "UNSUPPORTED_OPERATION", { operation: "from" });
        }

        const result = new Transaction();
        if (tx.type != null) { result.type = tx.type; }
        if (tx.to != null) { result.to = tx.to; }
        if (tx.nonce != null) { result.nonce = tx.nonce; }
        if (tx.gasLimit != null) { result.gasLimit = tx.gasLimit; }
        if (tx.gasPrice != null) { result.gasPrice = tx.gasPrice; }
        if (tx.maxPriorityFeePerGas != null) { result.maxPriorityFeePerGas = tx.maxPriorityFeePerGas; }
        if (tx.maxFeePerGas != null) { result.maxFeePerGas = tx.maxFeePerGas; }
        if (tx.data != null) { result.data = tx.data; }
        if (tx.value != null) { result.value = tx.value; }
        if (tx.chainId != null) { result.chainId = tx.chainId; }
        if (tx.signature != null) { result.signature = Signature.from(tx.signature); }
        if (tx.accessList != null) { result.accessList = tx.accessList; }

        if (tx.hash != null) {
            assertArgument(result.isSigned(), "unsigned transaction cannot have define hash", "tx", tx);
            assertArgument(result.hash === tx.hash, "hash mismatch", "tx", tx);
        }

        if (tx.from != null) {
            assertArgument(result.isSigned(), "unsigned transaction cannot have define from", "tx", tx);
            assertArgument(result.from.toLowerCase() === (tx.from || "").toLowerCase(), "from mismatch", "tx", tx);
        }

        return result;
    }
}
