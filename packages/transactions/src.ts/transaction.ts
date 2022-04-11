
import { getAddress } from "@ethersproject/address";
import { arrayify, BytesLike, concat, hexlify } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/crypto";
import { toArray } from "@ethersproject/math";
import { getStore, setStore } from "@ethersproject/properties";
import { encodeRlp } from "@ethersproject/rlp";
import { Signature, SignatureLike } from "@ethersproject/signing-key";

import { accessListify } from "./accesslist.js";
import { logger } from "./logger.js";

import type { BigNumberish } from "@ethersproject/logger";
import type { Freezable, Frozen } from "@ethersproject/properties";

import type { AccessList, AccessListish } from "./accesslist.js";


const BN_0 = BigInt(0);

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

function formatNumber(_value: BigNumberish, name: string): Uint8Array {
    const value = logger.getBigInt(_value, "value");
    const result = toArray(value);
    if (result.length > 32) {
        logger.throwArgumentError(`value too large`, `tx.${ name }`, value);
    }
    return result;
}

function formatAccessList(value: AccessListish): Array<[ string, Array<string> ]> {
    return accessListify(value).map((set) => [ set.address, set.storageKeys ]);
}

function _parseLegacy(data: Uint8Array): TransactionLike {
    return { };
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
        chainId = logger.getBigInt(tx.chainId, "tx.chainId");

        // We have a chainId in the tx and an EIP-155 v in the signature,
        // make sure they agree with each other
        if (sig && sig.networkV != null && sig.legacyChainId !== chainId) {
             logger.throwArgumentError("tx.chainId/sig.v mismatch", "sig", sig);
        }

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
        logger.throwArgumentError("tx.chainId/sig.v mismatch", "sig", sig);
    }

    fields.push(toArray(v));
    fields.push(toArray(sig.r));
    fields.push(toArray(sig.s));

    return encodeRlp(fields);
}

function _parseEip1559(data: Uint8Array): TransactionLike {
    throw new Error("@TODO");
}

function _serializeEip1559(tx: Transaction, sig?: Signature): string {
    // If there is an explicit gasPrice, make sure it matches the
    // EIP-1559 fees; otherwise they may not understand what they
    // think they are setting in terms of fee.
    //if (tx.gasPrice != null) {
    //    if (tx.gasPrice !== (tx.maxFeePerGas || BN_0)) {
    //        logger.throwArgumentError("mismatch EIP-1559 gasPrice != maxFeePerGas", "tx", tx);
    //    }
    //}
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
    throw new Error("@TODO");
}

function _serializeEip2930(tx: Transaction, sig?: Signature): string {
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
    signature: Signature;
}

export class Transaction implements Freezable<Transaction>, TransactionLike<string> {
    #props: {
        type: null | number,
        to: null | string,
        data: string,
        nonce: number,
        gasLimit: bigint,
        gasPrice: null | bigint,
        maxPriorityFeePerGas: null | bigint,
        maxFeePerGas: null | bigint,
        value: bigint,
        chainId: bigint,
        sig: null | Signature,
        accessList: null | AccessList
    };

    // A type of null indicates the type will be populated automatically
    get type(): null | number { return getStore(this.#props, "type"); }
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
                setStore(this.#props, "type", null);
                break;
            case 0: case "legacy":
                setStore(this.#props, "type", 0);
                break;
            case 1: case "berlin": case "eip-2930":
                setStore(this.#props, "type", 1);
                break;
            case 2: case "london": case "eip-1559":
                setStore(this.#props, "type", 2);
                break;
            default:
                throw new Error(`unsupported transaction type`);
        }
    }

    /*
    detectType(): number {
        const hasFee = (this.maxFeePerGas != null) || (this.maxPriorityFeePerGas != null);
        const hasAccessList = (this.accessList != null);
        const hasLegacy = (this.gasPrice != null);

        if (hasLegacy) {
            if (hasFee) {
                throw new Error("cannot mix legacy and london properties");
            }
            if (hasAccessList) { return 1; }
            return 0;
        }

        return 2;
    }
    */

    get to(): null | string { return getStore(this.#props, "to"); }
    set to(value: null | string) {
        setStore(this.#props, "to", (value == null) ? null: getAddress(value));
    }

    get nonce(): number { return getStore(this.#props, "nonce"); }
    set nonce(value: BigNumberish) { setStore(this.#props, "nonce", logger.getNumber(value, "value")); }

    get gasLimit(): bigint { return getStore(this.#props, "gasLimit"); }
    set gasLimit(value: BigNumberish) { setStore(this.#props, "gasLimit", logger.getBigInt(value)); }

    get gasPrice(): null | bigint { return getStore(this.#props, "gasPrice"); }
    set gasPrice(value: null | BigNumberish) {
        setStore(this.#props, "gasPrice", (value == null) ? null: logger.getBigInt(value));
    }

    get maxPriorityFeePerGas(): null | bigint { return getStore(this.#props, "maxPriorityFeePerGas"); }
    set maxPriorityFeePerGas(value: null | BigNumberish) {
        setStore(this.#props, "maxPriorityFeePerGas", (value == null) ? null: logger.getBigInt(value));
    }

    get maxFeePerGas(): null | bigint { return getStore(this.#props, "maxFeePerGas"); }
    set maxFeePerGas(value: null | BigNumberish) {
        setStore(this.#props, "maxFeePerGas", (value == null) ? null: logger.getBigInt(value));
    }

    get data(): string { return getStore(this.#props, "data"); }
    set data(value: BytesLike) { setStore(this.#props, "data", hexlify(value)); }

    get value(): bigint { return getStore(this.#props, "value"); }
    set value(value: BigNumberish) {
        setStore(this.#props, "value", logger.getBigInt(value));
    }

    get chainId(): bigint { return getStore(this.#props, "chainId"); }
    set chainId(value: BigNumberish) { setStore(this.#props, "chainId", logger.getBigInt(value)); }

    get signature(): null | Signature { return getStore(this.#props, "sig") || null; }
    set signature(value: null | SignatureLike) {
        setStore(this.#props, "sig", (value == null) ? null: Signature.from(value));
    }

    get accessList(): null | AccessList { return getStore(this.#props, "accessList") || null; }
    set accessList(value: null | AccessListish) {
        setStore(this.#props, "accessList", (value == null) ? null: accessListify(value));
    }

    constructor() {
        this.#props = {
            type: null,
            to: null,
            nonce: 0,
            gasLimit: BigInt(0),
            gasPrice: null,
            maxPriorityFeePerGas: null,
            maxFeePerGas: null,
            data: "0x",
            value: BigInt(0),
            chainId: BigInt(0),
            sig: null,
            accessList: null
        };
    }

    get hash(): null | string {
        if (this.signature == null) {
            throw new Error("cannot hash unsigned transaction; maybe you meant .unsignedHash");
        }
        return keccak256(this.serialized);
    }

    get unsignedHash(): string {
        return keccak256(this.unsignedSerialized);
    }

    get from(): null | string {
        if (this.signature == null) { return null; }
        // use ecomputeAddress(this.fromPublicKey);
        return "";
    }

    get fromPublicKey(): null | string {
        if (this.signature == null) { return null; }
        // use ecrecover
        return "";
    }

    isSigned(): this is SignedTransaction {
        return this.signature != null;
    }

    get serialized(): string {
        if (this.signature == null) {
            throw new Error("cannot serialize unsigned transaction; maybe you meant .unsignedSerialized");
        }

        const types = this.inferTypes();
        if (types.length !== 1) {
            throw new Error("cannot determine transaction type; specify type manually");
        }

        switch (types[0]) {
            case 0:
                return _serializeLegacy(this, this.signature);
            case 1:
                return _serializeEip2930(this, this.signature);
            case 2:
                return _serializeEip1559(this, this.signature);
        }

        throw new Error("unsupported type");
    }

    get unsignedSerialized(): string {
        if (this.signature != null) {
            throw new Error("cannot serialize unsigned transaction; maybe you meant .unsignedSerialized");
        }

        const types = this.inferTypes();
        if (types.length !== 1) {
            throw new Error("cannot determine transaction type; specify type manually");
        }

        switch (types[0]) {
            case 0:
                return _serializeLegacy(this);
            case 1:
                return _serializeEip2930(this);
            case 2:
                return _serializeEip1559(this);
        }

        throw new Error("unsupported type");
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

        if (!!this.maxFeePerGas && !!this.maxPriorityFeePerGas) {
            if (this.maxFeePerGas < this.maxPriorityFeePerGas) {
                throw new Error("priorityFee cannot be more than maxFee");
            }
        }

        //if (this.type === 2 && hasGasPrice) {
        //    throw new Error("eip-1559 transaction cannot have gasPrice");
        //}

        if ((this.type === 0 || this.type === 1) && hasFee) {
            throw new Error("transaction type cannot have maxFeePerGas or maxPriorityFeePerGas");
        }

        if (this.type === 0 && hasAccessList) {
            throw new Error("legacy transaction cannot have accessList");
        }

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

    clone(): Transaction {
        return Transaction.from(this);
    }

    freeze(): Frozen<Transaction> {
        if (this.#props.sig) {
            this.#props.sig = <any>(this.#props.sig.clone().freeze());
        }

        if (this.#props.accessList) {
            this.#props.accessList = <any>Object.freeze(this.#props.accessList.map((set) => {
                Object.freeze(set.storageKeys);
                return Object.freeze(set);
            }));
        }

        Object.freeze(this.#props);
        return this;
    }

    isFrozen(): boolean {
        return Object.isFrozen(this.#props);
    }

    static from(tx: string | TransactionLike<string>): Transaction {
        if (typeof(tx) === "string") {
            const payload = arrayify(tx);

            if (payload[0] >= 0x7f) { // @TODO: > vs >= ??
                return Transaction.from(_parseLegacy(payload));
            }

            switch(payload[0]) {
                case 1: return Transaction.from(_parseEip2930(payload.slice(1)));
                case 2: return Transaction.from(_parseEip1559(payload.slice(1)));
            }

            throw new Error("unsupported transaction type");
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

        // Should these be checked?? Should from be allowed if there is no signature?
        // from?: null | A;
        // hash?: null | string;

        return result;
    }
}
