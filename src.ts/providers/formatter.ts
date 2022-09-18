// Belongs to Networks; requires abstract-provider
// provider requires abstract-provider and network

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
/*
import { getAddress, getCreateAddress } from "../address/index.js";
import {
    dataLength, dataSlice, getBigInt, getNumber, isHexString, toQuantity,
    throwArgumentError, throwError
} from "../utils/index.js";
import { Signature } from "../crypto/signature.js";
import { accessListify } from "../transaction/index.js";

import { Block, Log, TransactionReceipt, TransactionResponse } from "./provider.js";

import type { AccessList } from "../transaction/index.js";

import type { PerformActionTransaction } from "./abstract-provider.js";
import type { Filter, Provider } from "./provider.js";


const BN_MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

export type FormatFunc = (value: any) => any;

//export type AccessListSet = { address: string, storageKeys: Array<string> };
//export type AccessList = Array<AccessListSet>;

//export type AccessListish = AccessList |
//                            Array<[ string, Array<string> ]> |
//                            Record<string, Array<string>>;

function stringify(value: any): string {
    if (typeof(value) !== "string") { throw new Error("invalid string"); }
    return value;
}

export class Formatter {
    #format: {
        address: FormatFunc,
        bigNumber: FormatFunc,
        blockTag: FormatFunc,
        data: FormatFunc,
        filter: FormatFunc,
        hash: FormatFunc,
        number: FormatFunc,
        topics: FormatFunc,
        transactionRequest: FormatFunc,
        transactionResponse: FormatFunc,
        uint256: FormatFunc,
    };

    #baseBlock: FormatFunc;

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
                index: [ "transactionIndex" ]
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
    address(value: any): string {
        return getAddress(value);
    }

    // An address from a call result; may be zero-padded
    callAddress(value: any): string {
        if (dataLength(value) !== 32 || dataSlice(value, 0, 12) !== "0x000000000000000000000000") {
            throwArgumentError("invalid call address", "value", value);
        }
        return this.address(dataSlice(value, 12));
    }

    // An address from a transaction (e.g. { from: string, nonce: number })
    contractAddress(value: any): string {
        return getCreateAddress({
            from: this.address(value.from),
            nonce: getNumber(value.nonce, "value.nonce")
        });
    }

    // Block Tag
    blockTag(value?: any): string {
        if (value == null) { return "latest"; }

        switch (value) {
            case "earliest":
                return "0x0";
            case "latest": case "pending": case "safe": case "finalized":
                return value;
        }

        if (typeof(value) === "number" || (isHexString(value) && dataLength(value) < 32)) {
            return toQuantity(value);
        }

        return throwArgumentError("invalid blockTag", "value", value);
    }

    // Block objects
    block(value: any, provider?: Provider): Block<string> {
        const params = this.#baseBlock(value);
        params.transactions = value.transactions.map((t: any) => this.hash(t));
        return new Block(params, provider);
    }
    blockWithTransactions(value: any, provider?: Provider): Block<TransactionResponse> {
        throw new Error();
    }

    // Transactions
    transactionRequest(value: any, provider?: Provider): PerformActionTransaction {
        return this.#format.transactionRequest(value);
    }

    transactionResponse(value: any, provider?: Provider): TransactionResponse {
        value = Object.assign({ }, value);

        // @TODO: Use the remap feature
        if (value.data == null && value.input != null) { value.data = value.input; }
        if (value.gasLimit == null && value.gas) { value.gasLimit = value.gas; }

        value = this.#format.transactionResponse(value);

        const sig = Signature.from({ r: value.r, s: value.s, v: value.v });
        value.signature = sig;
        if (value.chainId == null) { value.chainId = sig.legacyChainId; }

        return new TransactionResponse(value, provider);
    }

    // Receipts
    log(value: any, provider?: Provider): Log {
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
            index: [ "logIndex" ]
        })(value);
        return new Log(log, provider);
    }

    receipt(value: any, provider?: Provider): TransactionReceipt {
        const receipt = this.object({
            blockHash: this.hash,
            blockNumber: this.number,
            contractAddress: this.allowNull(this.address),
            cumulativeGasUsed: this.bigNumber,
            from: this.address,
            gasUsed: this.bigNumber,
            logs: this.arrayOf((v: any) => (this.log(v, provider))),
            logsBloom: this.data,
            root: this.allowNull(this.data),
            status: this.allowNull(this.number),
            to: this.address,
            gasPrice: this.allowNull(this.bigNumber),
            hash: this.hash,
            index: this.number,
            type: this.allowNull(this.number, 0),
        }, {
            hash: [ "transactionHash" ],
            gasPrice: [ "effectiveGasPrice" ],
            index: [ "transactionIndex" ]
        })(value);

        // RSK incorrectly implemented EIP-658, so we munge things a bit here for it
        if (receipt.root != null) {
            if (receipt.root.length <= 4) {
                // Could be 0x00, 0x0, 0x01 or 0x1
                const value = parseInt(receipt.root);
                if (value === 0 || value === 1) {
                    // Make sure if both are specified, they match
                    if (receipt.status != null && receipt.status !== value) {
                        return throwError("alt-root-status/status mismatch", "BAD_DATA", {
                            value: { root: receipt.root, status: receipt.status }
                        });
                    }
                    receipt.status = value;
                    delete receipt.root;
                } else {
                    return throwError("invalid alt-root-status", "BAD_DATA", {
                        value: receipt.root
                    });
                }
            } else if (!isHexString(receipt.root, 32)) {
                // Must be a valid bytes32
                return throwError("invalid receipt root hash", "BAD_DATA", {
                    value: receipt.root
                });
            }
        }

        //receipt.byzantium = (receipt.root == null);

        return new TransactionReceipt(receipt, provider);
    }

    // Fitlers
    topics(value: any): Array<string> {
        return this.#format.topics(value);
    }

    filter(value: any): Filter {
        return this.#format.filter(value);
    }

    filterLog(value: any): any {
        console.log("ME", value);
        return null;
    }

    // Converts a serialized transaction to a TransactionResponse
    transaction(value: any): TransactionResponse {
        throw new Error();
    }

    // Useful utility formatters functions, which if need be use the
    // methods within the formatter to ensure internal compatibility

    // Access List; converts an AccessListish to an AccessList
    accessList(value: any): AccessList {
        return accessListify(value);
    }

    // Converts falsish values to a specific value, otherwise use the formatter. Calls preserve `this`.
    allowFalsish(format: FormatFunc, ifFalse: any): FormatFunc {
        return ((value: any) => {
            if (!value) { return ifFalse; }
            return format.call(this, value);
        });
    }

    // Allows null, optionally replacing it with a default value. Calls preserve `this`.
    allowNull(format: FormatFunc, ifNull?: any): FormatFunc {
        return ((value: any) => {
            if (value == null) { return ifNull; }
            return format.call(this, value);
        });
    }

    // Requires an Array satisfying the formatter. Calls preserves `this`.
    arrayOf(format: FormatFunc): FormatFunc {
        return ((array: any) => {
            if (!Array.isArray(array)) { throw new Error("not an array"); }
            return array.map((i) => format.call(this, i));
        });
    }

    // Requires a value which is a value BigNumber
    bigNumber(value: any): bigint {
        return getBigInt(value, "value");
    }

    uint256(value: any): bigint {
        const result = this.bigNumber(value);
        if (result < 0 || result > BN_MAX_UINT256) {
            throwArgumentError("invalid uint256", "value", value);
        }
        return result;
    }

    // Requires a value which is a value boolean or string equivalent
    boolean(value: any): boolean {
        switch (value) {
            case true: case "true":
                return true;
            case false: case "false":
                return false;
        }
        return throwArgumentError(`invalid boolean; ${ JSON.stringify(value) }`, "value", value);
    }

    // Requires a value which is a valid hexstring. If dataOrLength is true,
    // the length must be even (i.e. a datahexstring) or if it is a number,
    // specifies teh number of bytes value must represent
    _hexstring(dataOrLength?: boolean | number): FormatFunc {
        if (dataOrLength == null) { dataOrLength = false; }
        return (function(value: any) {
            if (isHexString(value, dataOrLength)) {
                return value.toLowerCase();
            }
            throw new Error("bad hexstring");
        });
    }

    data(value: string): string {
        if (dataLength(value) == null) {
            throwArgumentError("", "value", value);
        }
        return value;
    }

    // Requires a network-native hash
    hash(value: any): string {
        if (dataLength(value) !== 32) {
            throwArgumentError("", "value", value);
        }
        return this.#format.data(value);
    }

    // Requires a valid number, within the IEEE 754 safe range
    number(value: any): number {
        return getNumber(value);
    }

    // Requires an object which matches a fleet of other formatters
    // Any FormatFunc may return `undefined` to have the value omitted
    // from the result object. Calls preserve `this`.
    object(format: Record<string, FormatFunc>, altNames?: Record<string, Array<string>>): FormatFunc {
        return ((value: any) => {
            const result: any = { };
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
                    if (nv !== undefined) { result[key] = nv; }
                } catch (error) {
                    const message = (error instanceof Error) ? error.message: "not-an-error";
                    throwError(`invalid value for value.${ key } (${ message })`, "BAD_DATA", { value })
                }
            }
            return result;
        });
    }
}
*/
