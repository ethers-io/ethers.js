var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Transaction_props;
import { getAddress } from "@ethersproject/address";
import { arrayify, concat, hexlify } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/crypto";
import { toArray } from "@ethersproject/math";
import { getStore, setStore } from "@ethersproject/properties";
import { encodeRlp } from "@ethersproject/rlp";
import { Signature } from "@ethersproject/signing-key";
import { accessListify } from "./accesslist.js";
import { logger } from "./logger.js";
const BN_0 = BigInt(0);
function formatNumber(_value, name) {
    const value = logger.getBigInt(_value, "value");
    const result = toArray(value);
    if (result.length > 32) {
        logger.throwArgumentError(`value too large`, `tx.${name}`, value);
    }
    return result;
}
function formatAccessList(value) {
    return accessListify(value).map((set) => [set.address, set.storageKeys]);
}
function _parseLegacy(data) {
    return {};
}
function _serializeLegacy(tx, sig) {
    const fields = [
        formatNumber(tx.nonce || 0, "nonce"),
        formatNumber(tx.gasPrice || 0, "gasPrice"),
        formatNumber(tx.gasLimit || 0, "gasLimit"),
        ((tx.to != null) ? getAddress(tx.to) : "0x"),
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
    }
    else if (sig) {
        // No chainId provided, but the signature is signing with EIP-155; derive chainId
        const legacy = sig.legacyChainId;
        if (legacy != null) {
            chainId = legacy;
        }
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
    }
    else if (BigInt(sig.v) !== v) {
        logger.throwArgumentError("tx.chainId/sig.v mismatch", "sig", sig);
    }
    fields.push(toArray(v));
    fields.push(toArray(sig.r));
    fields.push(toArray(sig.s));
    return encodeRlp(fields);
}
function _parseEip1559(data) {
    throw new Error("@TODO");
}
function _serializeEip1559(tx, sig) {
    // If there is an explicit gasPrice, make sure it matches the
    // EIP-1559 fees; otherwise they may not understand what they
    // think they are setting in terms of fee.
    //if (tx.gasPrice != null) {
    //    if (tx.gasPrice !== (tx.maxFeePerGas || BN_0)) {
    //        logger.throwArgumentError("mismatch EIP-1559 gasPrice != maxFeePerGas", "tx", tx);
    //    }
    //}
    const fields = [
        formatNumber(tx.chainId || 0, "chainId"),
        formatNumber(tx.nonce || 0, "nonce"),
        formatNumber(tx.maxPriorityFeePerGas || 0, "maxPriorityFeePerGas"),
        formatNumber(tx.maxFeePerGas || 0, "maxFeePerGas"),
        formatNumber(tx.gasLimit || 0, "gasLimit"),
        ((tx.to != null) ? getAddress(tx.to) : "0x"),
        formatNumber(tx.value || 0, "value"),
        (tx.data || "0x"),
        (formatAccessList(tx.accessList || []))
    ];
    if (sig) {
        fields.push(formatNumber(sig.yParity, "yParity"));
        fields.push(toArray(sig.r));
        fields.push(toArray(sig.s));
    }
    return concat(["0x02", encodeRlp(fields)]);
}
function _parseEip2930(data) {
    throw new Error("@TODO");
}
function _serializeEip2930(tx, sig) {
    const fields = [
        formatNumber(tx.chainId || 0, "chainId"),
        formatNumber(tx.nonce || 0, "nonce"),
        formatNumber(tx.gasPrice || 0, "gasPrice"),
        formatNumber(tx.gasLimit || 0, "gasLimit"),
        ((tx.to != null) ? getAddress(tx.to) : "0x"),
        formatNumber(tx.value || 0, "value"),
        (tx.data || "0x"),
        (formatAccessList(tx.accessList || []))
    ];
    if (sig) {
        fields.push(formatNumber(sig.yParity, "recoveryParam"));
        fields.push(toArray(sig.r));
        fields.push(toArray(sig.s));
    }
    return concat(["0x01", encodeRlp(fields)]);
}
export class Transaction {
    constructor() {
        _Transaction_props.set(this, void 0);
        __classPrivateFieldSet(this, _Transaction_props, {
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
        }, "f");
    }
    // A type of null indicates the type will be populated automatically
    get type() { return getStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "type"); }
    get typeName() {
        switch (this.type) {
            case 0: return "legacy";
            case 1: return "eip-2930";
            case 2: return "eip-1559";
        }
        return null;
    }
    set type(value) {
        switch (value) {
            case null:
                setStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "type", null);
                break;
            case 0:
            case "legacy":
                setStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "type", 0);
                break;
            case 1:
            case "berlin":
            case "eip-2930":
                setStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "type", 1);
                break;
            case 2:
            case "london":
            case "eip-1559":
                setStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "type", 2);
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
    get to() { return getStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "to"); }
    set to(value) {
        setStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "to", (value == null) ? null : getAddress(value));
    }
    get nonce() { return getStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "nonce"); }
    set nonce(value) { setStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "nonce", logger.getNumber(value, "value")); }
    get gasLimit() { return getStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "gasLimit"); }
    set gasLimit(value) { setStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "gasLimit", logger.getBigInt(value)); }
    get gasPrice() { return getStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "gasPrice"); }
    set gasPrice(value) {
        setStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "gasPrice", (value == null) ? null : logger.getBigInt(value));
    }
    get maxPriorityFeePerGas() { return getStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "maxPriorityFeePerGas"); }
    set maxPriorityFeePerGas(value) {
        setStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "maxPriorityFeePerGas", (value == null) ? null : logger.getBigInt(value));
    }
    get maxFeePerGas() { return getStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "maxFeePerGas"); }
    set maxFeePerGas(value) {
        setStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "maxFeePerGas", (value == null) ? null : logger.getBigInt(value));
    }
    get data() { return getStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "data"); }
    set data(value) { setStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "data", hexlify(value)); }
    get value() { return getStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "value"); }
    set value(value) {
        setStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "value", logger.getBigInt(value));
    }
    get chainId() { return getStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "chainId"); }
    set chainId(value) { setStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "chainId", logger.getBigInt(value)); }
    get signature() { return getStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "sig") || null; }
    set signature(value) {
        setStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "sig", (value == null) ? null : Signature.from(value));
    }
    get accessList() { return getStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "accessList") || null; }
    set accessList(value) {
        setStore(__classPrivateFieldGet(this, _Transaction_props, "f"), "accessList", (value == null) ? null : accessListify(value));
    }
    get hash() {
        if (this.signature == null) {
            throw new Error("cannot hash unsigned transaction; maybe you meant .unsignedHash");
        }
        return keccak256(this.serialized);
    }
    get unsignedHash() {
        return keccak256(this.unsignedSerialized);
    }
    get from() {
        if (this.signature == null) {
            return null;
        }
        // use ecomputeAddress(this.fromPublicKey);
        return "";
    }
    get fromPublicKey() {
        if (this.signature == null) {
            return null;
        }
        // use ecrecover
        return "";
    }
    isSigned() {
        return this.signature != null;
    }
    get serialized() {
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
    get unsignedSerialized() {
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
    inferTypes() {
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
        const types = [];
        // Explicit type
        if (this.type != null) {
            types.push(this.type);
        }
        else {
            if (hasFee) {
                types.push(2);
            }
            else if (hasGasPrice) {
                types.push(1);
                if (!hasAccessList) {
                    types.push(0);
                }
            }
            else if (hasAccessList) {
                types.push(1);
                types.push(2);
            }
            else {
                types.push(0);
                types.push(1);
                types.push(2);
            }
        }
        types.sort();
        return types;
    }
    clone() {
        return Transaction.from(this);
    }
    freeze() {
        if (__classPrivateFieldGet(this, _Transaction_props, "f").sig) {
            __classPrivateFieldGet(this, _Transaction_props, "f").sig = (__classPrivateFieldGet(this, _Transaction_props, "f").sig.clone().freeze());
        }
        if (__classPrivateFieldGet(this, _Transaction_props, "f").accessList) {
            __classPrivateFieldGet(this, _Transaction_props, "f").accessList = Object.freeze(__classPrivateFieldGet(this, _Transaction_props, "f").accessList.map((set) => {
                Object.freeze(set.storageKeys);
                return Object.freeze(set);
            }));
        }
        Object.freeze(__classPrivateFieldGet(this, _Transaction_props, "f"));
        return this;
    }
    isFrozen() {
        return Object.isFrozen(__classPrivateFieldGet(this, _Transaction_props, "f"));
    }
    static from(tx) {
        if (typeof (tx) === "string") {
            const payload = arrayify(tx);
            if (payload[0] >= 0x7f) { // @TODO: > vs >= ??
                return Transaction.from(_parseLegacy(payload));
            }
            switch (payload[0]) {
                case 1: return Transaction.from(_parseEip2930(payload.slice(1)));
                case 2: return Transaction.from(_parseEip1559(payload.slice(1)));
            }
            throw new Error("unsupported transaction type");
        }
        const result = new Transaction();
        if (tx.type != null) {
            result.type = tx.type;
        }
        if (tx.to != null) {
            result.to = tx.to;
        }
        if (tx.nonce != null) {
            result.nonce = tx.nonce;
        }
        if (tx.gasLimit != null) {
            result.gasLimit = tx.gasLimit;
        }
        if (tx.gasPrice != null) {
            result.gasPrice = tx.gasPrice;
        }
        if (tx.maxPriorityFeePerGas != null) {
            result.maxPriorityFeePerGas = tx.maxPriorityFeePerGas;
        }
        if (tx.maxFeePerGas != null) {
            result.maxFeePerGas = tx.maxFeePerGas;
        }
        if (tx.data != null) {
            result.data = tx.data;
        }
        if (tx.value != null) {
            result.value = tx.value;
        }
        if (tx.chainId != null) {
            result.chainId = tx.chainId;
        }
        if (tx.signature != null) {
            result.signature = Signature.from(tx.signature);
        }
        if (tx.accessList != null) {
            result.accessList = tx.accessList;
        }
        // Should these be checked?? Should from be allowed if there is no signature?
        // from?: null | A;
        // hash?: null | string;
        return result;
    }
}
_Transaction_props = new WeakMap();
//# sourceMappingURL=transaction.js.map