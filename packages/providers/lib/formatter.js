// Belongs to Networks; requires abstract-provider
// provider requires abstract-provider and network
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
var _Formatter_format, _Formatter_baseBlock;
/**
 *  Formatter
 *
 *  This is responsibile for converting much of the various
 *  loose network values into a concrete ethers-ready value.
 *
 *  For example, converting addresses to checksum addresses,
 *  validating a hash is 32 bytes, and so on.
 *
 *  By sub-classing this class and providing it in a custom
 *  Network object this allows exotic (non-Ethereum) networks
 *  to be fairly simple to adapt to ethers.
 */
import { getAddress, getCreateAddress } from "@ethersproject/address";
import { dataLength, dataSlice, isHexString, quantity } from "@ethersproject/bytes";
import { toHex } from "@ethersproject/math";
import { Signature } from "@ethersproject/signing-key";
import { accessListify } from "@ethersproject/transactions";
import { Block, Log, TransactionReceipt, TransactionResponse } from "./provider.js";
import { logger } from "./logger.js";
const BN_MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
//export type AccessListSet = { address: string, storageKeys: Array<string> };
//export type AccessList = Array<AccessListSet>;
//export type AccessListish = AccessList |
//                            Array<[ string, Array<string> ]> |
//                            Record<string, Array<string>>;
function stringify(value) {
    if (typeof (value) !== "string") {
        throw new Error("invalid string");
    }
    return value;
}
export class Formatter {
    constructor() {
        _Formatter_format.set(this, void 0);
        _Formatter_baseBlock.set(this, void 0);
        const address = this.address.bind(this);
        const bigNumber = this.bigNumber.bind(this);
        const blockTag = this.blockTag.bind(this);
        const data = this.data.bind(this);
        const hash = this.hash.bind(this);
        const number = this.number.bind(this);
        const uint256 = this.uint256.bind(this);
        const topics = this.arrayOf(hash);
        __classPrivateFieldSet(this, _Formatter_format, {
            address,
            bigNumber,
            blockTag,
            data,
            hash,
            number,
            uint256,
            topics,
            filter: this.object({
                fromBlock: this.allowNull(blockTag, undefined),
                toBlock: this.allowNull(blockTag, undefined),
                blockHash: this.allowNull(hash, undefined),
                address: this.allowNull(address, undefined),
                topics: this.allowNull(topics, undefined)
            }),
            transactionRequest: this.object({
                from: this.allowNull(address),
                type: this.allowNull(number),
                to: this.allowNull(address),
                nonce: this.allowNull(number),
                gasLimit: this.allowNull(uint256),
                gasPrice: this.allowNull(uint256),
                maxFeePerGas: this.allowNull(uint256),
                maxPriorityFeePerGas: this.allowNull(uint256),
                data: this.allowNull(data),
                value: this.allowNull(uint256),
            }),
            transactionResponse: this.object({
                hash: hash,
                index: number,
                type: this.allowNull(number, 0),
                // These can be null for pending blocks
                blockHash: this.allowNull(hash),
                blockNumber: this.allowNull(number),
                // For Legacy transactions, this comes from the v
                chainId: this.allowNull(number),
                from: address,
                to: this.address,
                gasLimit: bigNumber,
                gasPrice: this.allowNull(bigNumber),
                maxFeePerGas: this.allowNull(bigNumber),
                maxPriorityFeePerGas: this.allowNull(bigNumber),
                value: bigNumber,
                data: data,
                nonce: number,
                r: hash,
                s: hash,
                v: number,
                accessList: this.allowNull(this.accessList)
            }, {
                index: ["transactionIndex"]
            }),
        }, "f");
        __classPrivateFieldSet(this, _Formatter_baseBlock, this.object({
            number: number,
            hash: this.allowNull(hash, null),
            timestamp: number,
            parentHash: hash,
            nonce: this.allowNull(stringify, "0x0000000000000000"),
            difficulty: bigNumber,
            gasLimit: bigNumber,
            gasUsed: bigNumber,
            miner: this.allowNull(address, "0x0000000000000000000000000000000000000000"),
            extraData: stringify,
            baseFeePerGas: this.allowNull(bigNumber),
        }), "f");
    }
    // An address
    address(value) {
        return getAddress(value);
    }
    // An address from a call result; may be zero-padded
    callAddress(value) {
        if (dataLength(value) !== 32 || dataSlice(value, 0, 12) !== "0x000000000000000000000000") {
            logger.throwArgumentError("invalid call address", "value", value);
        }
        return this.address(dataSlice(value, 12));
    }
    // An address from a transaction (e.g. { from: string, nonce: number })
    contractAddress(value) {
        return getCreateAddress({
            from: this.address(value.from),
            nonce: logger.getNumber(value.nonce, "value.nonce")
        });
    }
    // Block Tag
    blockTag(value) {
        if (value == null) {
            return "latest";
        }
        switch (value) {
            case "earliest":
                return "0x0";
            case "latest":
            case "pending":
                return value;
        }
        if (typeof (value) === "number" || (isHexString(value) && dataLength(value) < 32)) {
            return quantity(value);
        }
        return logger.throwArgumentError("invalid blockTag", "value", value);
    }
    // Block objects
    block(value, provider) {
        const params = __classPrivateFieldGet(this, _Formatter_baseBlock, "f").call(this, value);
        params.transactions = value.transactions.map((t) => this.hash(t));
        return new Block(params, provider);
    }
    blockWithTransactions(value, provider) {
        throw new Error();
    }
    // Transactions
    transactionRequest(value, provider) {
        return __classPrivateFieldGet(this, _Formatter_format, "f").transactionRequest(value);
    }
    transactionResponse(value, provider) {
        value = Object.assign({}, value);
        // @TODO: Use the remap feature
        if (value.data == null && value.input != null) {
            value.data = value.input;
        }
        if (value.gasLimit == null && value.gas) {
            value.gasLimit = value.gas;
        }
        value = __classPrivateFieldGet(this, _Formatter_format, "f").transactionResponse(value);
        const sig = Signature.fromTransaction(value.r, value.s, value.v);
        value.signature = sig;
        if (value.chainId == null) {
            value.chainId = sig.legacyChainId;
        }
        return new TransactionResponse(value, provider);
    }
    // Receipts
    log(value, provider) {
        const log = this.object({
            address: this.address,
            blockHash: this.hash,
            blockNumber: this.number,
            data: this.data,
            index: this.number,
            removed: this.boolean,
            topics: this.topics,
            transactionHash: this.hash,
            transactionIndex: this.number,
        }, {
            index: ["logIndex"]
        })(value);
        return new Log(log, provider);
    }
    receipt(value, provider) {
        const receipt = this.object({
            blockHash: this.hash,
            blockNumber: this.number,
            contractAddress: this.allowNull(this.address),
            cumulativeGasUsed: this.bigNumber,
            from: this.address,
            gasUsed: this.bigNumber,
            logs: this.arrayOf((v) => (this.log(v, provider))),
            logsBloom: this.data,
            root: this.allowNull(this.data),
            status: this.allowNull(this.number),
            to: this.address,
            gasPrice: this.allowNull(this.bigNumber),
            hash: this.hash,
            index: this.number,
            type: this.allowNull(this.number, 0),
        }, {
            hash: ["transactionHash"],
            gasPrice: ["effectiveGasPrice"],
            index: ["transactionIndex"]
        })(value);
        // RSK incorrectly implemented EIP-658, so we munge things a bit here for it
        if (receipt.root != null) {
            if (receipt.root.length <= 4) {
                // Could be 0x00, 0x0, 0x01 or 0x1
                const value = parseInt(receipt.root);
                if (value === 0 || value === 1) {
                    // Make sure if both are specified, they match
                    if (receipt.status != null && receipt.status !== value) {
                        return logger.throwError("alt-root-status/status mismatch", "BAD_DATA", {
                            value: { root: receipt.root, status: receipt.status }
                        });
                    }
                    receipt.status = value;
                    delete receipt.root;
                }
                else {
                    return logger.throwError("invalid alt-root-status", "BAD_DATA", {
                        value: receipt.root
                    });
                }
            }
            else if (!isHexString(receipt.root, 32)) {
                // Must be a valid bytes32
                return logger.throwError("invalid receipt root hash", "BAD_DATA", {
                    value: receipt.root
                });
            }
        }
        //receipt.byzantium = (receipt.root == null);
        return new TransactionReceipt(receipt, provider);
    }
    // Fitlers
    topics(value) {
        return __classPrivateFieldGet(this, _Formatter_format, "f").topics(value);
    }
    filter(value) {
        return __classPrivateFieldGet(this, _Formatter_format, "f").filter(value);
    }
    filterLog(value) {
        console.log("ME", value);
        return null;
    }
    // Converts a serialized transaction to a TransactionResponse
    transaction(value) {
        throw new Error();
    }
    // Useful utility formatters functions, which if need be use the
    // methods within the formatter to ensure internal compatibility
    // Access List; converts an AccessListish to an AccessList
    accessList(value) {
        return accessListify(value);
    }
    // Converts falsish values to a specific value, otherwise use the formatter. Calls preserve `this`.
    allowFalsish(format, ifFalse) {
        return ((value) => {
            if (!value) {
                return ifFalse;
            }
            return format.call(this, value);
        });
    }
    // Allows null, optionally replacing it with a default value. Calls preserve `this`.
    allowNull(format, ifNull) {
        return ((value) => {
            if (value == null) {
                return ifNull;
            }
            return format.call(this, value);
        });
    }
    // Requires an Array satisfying the formatter. Calls preserves `this`.
    arrayOf(format) {
        return ((array) => {
            if (!Array.isArray(array)) {
                throw new Error("not an array");
            }
            return array.map((i) => format.call(this, i));
        });
    }
    // Requires a value which is a value BigNumber
    bigNumber(value) {
        return logger.getBigInt(value, "value");
    }
    uint256(value) {
        const result = this.bigNumber(value);
        if (result < 0 || result > BN_MAX_UINT256) {
            logger.throwArgumentError("invalid uint256", "value", value);
        }
        return result;
    }
    // Requires a value which is a value boolean or string equivalent
    boolean(value) {
        switch (value) {
            case true:
            case "true":
                return true;
            case false:
            case "false":
                return false;
        }
        return logger.throwArgumentError(`invalid boolean; ${JSON.stringify(value)}`, "value", value);
    }
    // Requires a value which is a valid hexstring. If dataOrLength is true,
    // the length must be even (i.e. a datahexstring) or if it is a number,
    // specifies teh number of bytes value must represent
    _hexstring(dataOrLength) {
        if (dataOrLength == null) {
            dataOrLength = false;
        }
        return (function (value) {
            if (isHexString(value, dataOrLength)) {
                return value.toLowerCase();
            }
            throw new Error("bad hexstring");
        });
    }
    data(value) {
        if (dataLength(value) == null) {
            logger.throwArgumentError("", "value", value);
        }
        return value;
    }
    // Requires a network-native hash
    hash(value) {
        if (dataLength(value) !== 32) {
            logger.throwArgumentError("", "value", value);
        }
        return __classPrivateFieldGet(this, _Formatter_format, "f").data(value);
    }
    // Requires a valid number, within the IEEE 754 safe range
    number(value) {
        return logger.getNumber(value);
    }
    // Requires an object which matches a fleet of other formatters
    // Any FormatFunc may return `undefined` to have the value omitted
    // from the result object. Calls preserve `this`.
    object(format, altNames) {
        return ((value) => {
            const result = {};
            for (const key in format) {
                let srcKey = key;
                if (altNames && key in altNames && !(srcKey in value)) {
                    for (const altKey of altNames[key]) {
                        if (altKey in value) {
                            srcKey = altKey;
                            break;
                        }
                    }
                }
                try {
                    const nv = format[key].call(this, value[srcKey]);
                    if (nv !== undefined) {
                        result[key] = nv;
                    }
                }
                catch (error) {
                    const message = (error instanceof Error) ? error.message : "not-an-error";
                    logger.throwError(`invalid value for value.${key} (${message})`, "BAD_DATA", { value });
                }
            }
            return result;
        });
    }
    // Requires a value which matches a network-native storage slot
    storageSlot(value) {
        return toHex(logger.getBigInt(value), 32);
    }
}
_Formatter_format = new WeakMap(), _Formatter_baseBlock = new WeakMap();
//# sourceMappingURL=formatter.js.map