"use strict";
// Belongs to Networks; requires abstract-provider
// provider requires abstract-provider and network
Object.defineProperty(exports, "__esModule", { value: true });
exports.Formatter = void 0;
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
const index_js_1 = require("../address/index.js");
const data_js_1 = require("../utils/data.js");
const maths_js_1 = require("../utils/maths.js");
const logger_js_1 = require("../utils/logger.js");
const signature_js_1 = require("../crypto/signature.js");
const index_js_2 = require("../transaction/index.js");
const provider_js_1 = require("./provider.js");
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
class Formatter {
    #format;
    #baseBlock;
    constructor() {
        const address = this.address.bind(this);
        const bigNumber = this.bigNumber.bind(this);
        const blockTag = this.blockTag.bind(this);
        const data = this.data.bind(this);
        const hash = this.hash.bind(this);
        const number = this.number.bind(this);
        const uint256 = this.uint256.bind(this);
        const topics = this.arrayOf(hash);
        this.#format = {
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
        };
        this.#baseBlock = this.object({
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
        });
    }
    // An address
    address(value) {
        return (0, index_js_1.getAddress)(value);
    }
    // An address from a call result; may be zero-padded
    callAddress(value) {
        if ((0, data_js_1.dataLength)(value) !== 32 || (0, data_js_1.dataSlice)(value, 0, 12) !== "0x000000000000000000000000") {
            logger_js_1.logger.throwArgumentError("invalid call address", "value", value);
        }
        return this.address((0, data_js_1.dataSlice)(value, 12));
    }
    // An address from a transaction (e.g. { from: string, nonce: number })
    contractAddress(value) {
        return (0, index_js_1.getCreateAddress)({
            from: this.address(value.from),
            nonce: logger_js_1.logger.getNumber(value.nonce, "value.nonce")
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
            case "safe":
            case "finalized":
                return value;
        }
        if (typeof (value) === "number" || ((0, data_js_1.isHexString)(value) && (0, data_js_1.dataLength)(value) < 32)) {
            return (0, maths_js_1.toQuantity)(value);
        }
        return logger_js_1.logger.throwArgumentError("invalid blockTag", "value", value);
    }
    // Block objects
    block(value, provider) {
        const params = this.#baseBlock(value);
        params.transactions = value.transactions.map((t) => this.hash(t));
        return new provider_js_1.Block(params, provider);
    }
    blockWithTransactions(value, provider) {
        throw new Error();
    }
    // Transactions
    transactionRequest(value, provider) {
        return this.#format.transactionRequest(value);
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
        value = this.#format.transactionResponse(value);
        const sig = signature_js_1.Signature.from({ r: value.r, s: value.s, v: value.v });
        value.signature = sig;
        if (value.chainId == null) {
            value.chainId = sig.legacyChainId;
        }
        return new provider_js_1.TransactionResponse(value, provider);
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
        return new provider_js_1.Log(log, provider);
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
                        return logger_js_1.logger.throwError("alt-root-status/status mismatch", "BAD_DATA", {
                            value: { root: receipt.root, status: receipt.status }
                        });
                    }
                    receipt.status = value;
                    delete receipt.root;
                }
                else {
                    return logger_js_1.logger.throwError("invalid alt-root-status", "BAD_DATA", {
                        value: receipt.root
                    });
                }
            }
            else if (!(0, data_js_1.isHexString)(receipt.root, 32)) {
                // Must be a valid bytes32
                return logger_js_1.logger.throwError("invalid receipt root hash", "BAD_DATA", {
                    value: receipt.root
                });
            }
        }
        //receipt.byzantium = (receipt.root == null);
        return new provider_js_1.TransactionReceipt(receipt, provider);
    }
    // Fitlers
    topics(value) {
        return this.#format.topics(value);
    }
    filter(value) {
        return this.#format.filter(value);
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
        return (0, index_js_2.accessListify)(value);
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
        return logger_js_1.logger.getBigInt(value, "value");
    }
    uint256(value) {
        const result = this.bigNumber(value);
        if (result < 0 || result > BN_MAX_UINT256) {
            logger_js_1.logger.throwArgumentError("invalid uint256", "value", value);
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
        return logger_js_1.logger.throwArgumentError(`invalid boolean; ${JSON.stringify(value)}`, "value", value);
    }
    // Requires a value which is a valid hexstring. If dataOrLength is true,
    // the length must be even (i.e. a datahexstring) or if it is a number,
    // specifies teh number of bytes value must represent
    _hexstring(dataOrLength) {
        if (dataOrLength == null) {
            dataOrLength = false;
        }
        return (function (value) {
            if ((0, data_js_1.isHexString)(value, dataOrLength)) {
                return value.toLowerCase();
            }
            throw new Error("bad hexstring");
        });
    }
    data(value) {
        if ((0, data_js_1.dataLength)(value) == null) {
            logger_js_1.logger.throwArgumentError("", "value", value);
        }
        return value;
    }
    // Requires a network-native hash
    hash(value) {
        if ((0, data_js_1.dataLength)(value) !== 32) {
            logger_js_1.logger.throwArgumentError("", "value", value);
        }
        return this.#format.data(value);
    }
    // Requires a valid number, within the IEEE 754 safe range
    number(value) {
        return logger_js_1.logger.getNumber(value);
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
                    logger_js_1.logger.throwError(`invalid value for value.${key} (${message})`, "BAD_DATA", { value });
                }
            }
            return result;
        });
    }
}
exports.Formatter = Formatter;
//# sourceMappingURL=formatter.js.map