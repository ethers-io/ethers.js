"use strict";

import { Log, TransactionReceipt, TransactionResponse, HederaTransactionRecord } from "@hethers/abstract-provider";
import { getAddress, getAddressFromAccount } from "@hethers/address";
import { BigNumber } from "@ethersproject/bignumber";
import { hexDataLength, hexDataSlice, hexZeroPad, isHexString } from "@ethersproject/bytes";
import { AddressZero } from "@hethers/constants";
import { AccessList, accessListify, parse as parseTransaction } from "@hethers/transactions";
import { Logger } from "@hethers/logger";
import { version } from "./_version";
const logger = new Logger(version);

export type FormatFunc = (value: any) => any;

export type FormatFuncs = { [ key: string ]: FormatFunc };

export type Formats = {
    transaction: FormatFuncs,
    transactionRequest: FormatFuncs,
    receipt: FormatFuncs,
    receiptLog: FormatFuncs,
    filter: FormatFuncs,
    filterLog: FormatFuncs,
};

export class Formatter {
    readonly formats: Formats;

    constructor() {
        logger.checkNew(new.target, Formatter);
        this.formats = this.getDefaultFormats();
    }

    getDefaultFormats(): Formats {
        const formats: Formats = <Formats>({ });

        const address = this.address.bind(this);
        const bigNumber = this.bigNumber.bind(this);
        const data = this.data.bind(this);
        const hash48 = this.hash48.bind(this);
        const hash32 = this.hash32.bind(this);
        const number = this.number.bind(this);
        const type = this.type.bind(this);

        const timestamp = this.timestamp.bind(this);

        const strictData = (v: any) => { return this.data(v, true); };

        formats.transaction = {
            hash: hash48,
            accessList: Formatter.allowNull(this.accessList.bind(this), null),
            from: address,
            gasLimit: bigNumber,
            to: Formatter.allowNull(address, null),
            value: bigNumber,
            data: data,

            r: Formatter.allowNull(this.uint256),
            s: Formatter.allowNull(this.uint256),
            v: Formatter.allowNull(number),
        };

        formats.transactionRequest = {
            from: Formatter.allowNull(address),
            nonce: Formatter.allowNull(number),
            gasLimit: Formatter.allowNull(bigNumber),
            gasPrice: Formatter.allowNull(bigNumber),
            maxPriorityFeePerGas: Formatter.allowNull(bigNumber),
            maxFeePerGas: Formatter.allowNull(bigNumber),
            to: Formatter.allowNull(address),
            value: Formatter.allowNull(bigNumber),
            data: Formatter.allowNull(strictData),
            type: Formatter.allowNull(number),
            accessList: Formatter.allowNull(this.accessList.bind(this), null),
        };

        formats.receiptLog = {
            transactionIndex: number,
            transactionHash: hash48,
            address: address,
            topics: Formatter.arrayOf(hash32),
            data: data,
            logIndex: number,
        };

        formats.receipt = {
            to: Formatter.allowNull(this.address, null),
            from: Formatter.allowNull(this.address, null),
            contractAddress: Formatter.allowNull(address, null),
            timestamp: timestamp,
            gasUsed: bigNumber,
            logsBloom: Formatter.allowNull(data),// @TODO: should this be data?
            transactionHash: hash48,
            logs: Formatter.arrayOf(this.receiptLog.bind(this)),
            cumulativeGasUsed: bigNumber,
            status: Formatter.allowNull(number),
            type: type
        };

        formats.filter = {
            fromTimestamp: Formatter.allowNull(timestamp, undefined),
            toTimestamp: Formatter.allowNull(timestamp, undefined),
            address: Formatter.allowNull(address, undefined),
            topics: Formatter.allowNull(this.topics.bind(this), undefined),
        };

        formats.filterLog = {
            timestamp: timestamp,
            address: address,
            data: Formatter.allowFalsish(data, "0x"),
            topics: Formatter.arrayOf(hash32),
            transactionHash: Formatter.allowNull(hash48, undefined),
            logIndex: number,
            transactionIndex: number
        };

        return formats;
    }

    logsMapper(values: Array<any>): Array<Log> {
        let logs: Log[] = [];
        values.forEach(function (log: any) {
            const mapped = {
                timestamp: log.timestamp,
                address: log.address,
                data: log.data,
                topics: log.topics,
                //@ts-ignore
                transactionHash: null, //currently not provided
                logIndex: log.index,
                transactionIndex: log.index,
            };
            logs.push(mapped);
        });
        return logs;
    }

    //TODO propper validation needed?
    timestamp(value: any): string {
        if (!value.match(/([0-9]){10}[.]([0-9]){9}/)) {
            logger.throwArgumentError("bad timestamp format", "value", value);
        }
        return value;
    }

    accessList(accessList: Array<any>): AccessList {
        return accessListify(accessList || []);
    }

    // Requires a BigNumberish that is within the IEEE754 safe integer range; returns a number
    // Strict! Used on input.
    number(number: any): number {
        if (number === "0x") { return 0; }
        return BigNumber.from(number).toNumber();
    }

    type(number: any): number {
        if (number === "0x" || number == null) { return 0; }
        return BigNumber.from(number).toNumber();
    }

    // Strict! Used on input.
    bigNumber(value: any): BigNumber {
        return BigNumber.from(value);
    }

    // Requires a boolean, "true" or  "false"; returns a boolean
    boolean(value: any): boolean {
        if (typeof(value) === "boolean") { return value; }
        if (typeof(value) === "string") {
            value = value.toLowerCase();
            if (value === "true") { return true; }
            if (value === "false") { return false; }
        }
        throw new Error("invalid boolean - " + value);
    }

    hex(value: any, strict?: boolean): string {
        if (typeof(value) === "string") {
            if (!strict && value.substring(0, 2) !== "0x") { value = "0x" + value; }
            if (isHexString(value)) {
               return value.toLowerCase();
            }
        }
        return logger.throwArgumentError("invalid hash", "value", value);
    }

    data(value: any, strict?: boolean): string {
        const result = this.hex(value, strict);
        if ((result.length % 2) !== 0) {
            throw new Error("invalid data; odd-length - " + value);
        }
        return result;
    }

    // Requires an address
    // Strict! Used on input.
    address(value: any): string {
        let address = value.toString();
        if (address.indexOf(".") !== -1) {
            address = getAddressFromAccount(address);
        }
        return getAddress(address);
    }

    callAddress(value: any): string {
        if (!isHexString(value, 32)) { return null; }
        const address = getAddress(hexDataSlice(value, 12));
        return (address === AddressZero) ? null: address;
    }

    contractAddress(value: any): string {
        return value;
    }

    // Requires a hash, optionally requires 0x prefix; returns prefixed lowercase hash.
    hash48(value: any, strict?: boolean): string {
        const result = this.hex(value, strict);
        if (hexDataLength(result) !== 48) {
            return logger.throwArgumentError("invalid hash", "value", value);
        }
        return result;
    }

    //hedera topics hash has length 32
    hash32(value: any, strict?: boolean): string {
        const result = this.hex(value, strict);
        if (hexDataLength(result) !== 32) {
            return logger.throwArgumentError("invalid topics hash", "value", value);
        }
        return result;
    }

    // Returns the difficulty as a number, or if too large (i.e. PoA network) null
    difficulty(value: any): number {
        if (value == null) { return null; }

        const v = BigNumber.from(value);

        try {
            return v.toNumber();
        } catch (error) { }

       return null;
    }

    uint256(value: any): string {
        if (!isHexString(value)) {
            throw new Error("invalid uint256");
        }
        return hexZeroPad(value, 32);
    }

    // Strict! Used on input.
    transactionRequest(value: any): any {
        return Formatter.check(this.formats.transactionRequest, value);
    }

    transactionResponse(transaction: any): TransactionResponse {

        // Rename gas to gasLimit
        if (transaction.gas != null && transaction.gasLimit == null) {
            transaction.gasLimit = transaction.gas;
        }

        // Some clients (TestRPC) do strange things like return 0x0 for the
        // 0 address; correct this to be a real address
        if (transaction.to && BigNumber.from(transaction.to).isZero()) {
            transaction.to = "0x0000000000000000000000000000000000000000";
        }

        // Rename input to data
        if (transaction.input != null && transaction.data == null) {
            transaction.data = transaction.input;
        }

        // If to and creates are empty, populate the creates from the transaction
        if (transaction.to == null && transaction.creates == null) {
            transaction.creates = this.contractAddress(transaction);
        }

        if ((transaction.type === 1 || transaction.type === 2)&& transaction.accessList == null) {
            transaction.accessList = [ ];
        }

        const result: TransactionResponse = Formatter.check(this.formats.transaction, transaction);

        if (transaction.chainId != null) {
            let chainId = transaction.chainId;

            if (isHexString(chainId)) {
                chainId = BigNumber.from(chainId).toNumber();
            }

            result.chainId = chainId;

        } else {
            let chainId = transaction.networkId;

            // geth-etc returns chainId
            if (chainId == null && result.v == null) {
                chainId = transaction.chainId;
            }

            if (isHexString(chainId)) {
                chainId = BigNumber.from(chainId).toNumber();
            }

            if (typeof(chainId) !== "number" && result.v != null) {
                chainId = (result.v - 35) / 2;
                if (chainId < 0) { chainId = 0; }
                chainId = parseInt(chainId);
            }

            if (typeof(chainId) !== "number") { chainId = 0; }

            result.chainId = chainId;
        }
        return result;
    }

    transaction(value: any): any {
        return parseTransaction(value);
    }

    receiptLog(value: any): any {
        return Formatter.check(this.formats.receiptLog, value);
    }

    receipt(value: any): TransactionReceipt {
        const result: TransactionReceipt = Formatter.check(this.formats.receipt, value);

        if (result.status != null) {
            result.byzantium = true;
        }

        return result;
    }

    responseFromRecord(record: HederaTransactionRecord): TransactionResponse {
        return {
            chainId: record.chainId ? record.chainId : null,
            hash: record.hash,
            timestamp: record.timestamp,
            transactionId: record.transactionId ? record.transactionId : null,
            from: record.from,
            to: record.to ? record.to : null,
            data: record.call_result ? record.call_result : null,
            gasLimit: typeof record.gas_limit !== 'undefined' ? BigNumber.from(record.gas_limit) : null,
            value: BigNumber.from(record.amount || 0),
            customData: {
                gas_used: record.gas_used ? record.gas_used : null,
                logs: record.logs ? record.logs : null,
                result: record.result ? record.result : null,
                accountAddress: record.accountAddress ? record.accountAddress : null,
                transfersList: record.transfersList ? record.transfersList : [],
            },
            wait: null,
        }
    }

    receiptFromResponse(response: TransactionResponse): TransactionReceipt {
        let contractAddress = null;
        let to = null;
        let logs: Log[] = [];
        response.data != '0x' ? contractAddress = response.to : to = response.to;
        response.customData?.logs?.forEach(function (log: any) {
            const values = {
                timestamp: response.timestamp,
                address: log.address,
                data: log.data,
                topics: log.topics,
                transactionHash: response.hash,
                logIndex: log.index,
                transactionIndex: log.index,
            };
            logs.push(values);
        });
        return {
            to: to,
            from: response.from,
            timestamp: response.timestamp,
            contractAddress: contractAddress,
            gasUsed: response.customData?.gas_used,
            logsBloom: null, //to be provided by hedera rest api
            transactionId: response.transactionId,
            transactionHash: response.hash,
            logs: logs,
            cumulativeGasUsed: response.customData?.gas_used,
            type: 0,
            byzantium: true,
            status: response.customData?.result === 'SUCCESS' ? 1 : 0,
            accountAddress: response.customData?.accountAddress ? response.customData.accountAddress : null
        }
    }

    topics(value: any): any {
        if (Array.isArray(value)) {
            return value.map((v) => this.topics(v));

        } else if (value != null) {
            return this.hash32(value, true);
        }

        return null;
    }

    filter(value: any): any {
        return Formatter.check(this.formats.filter, value);
    }

    filterLog(value: any): any {
        return Formatter.check(this.formats.filterLog, value);
    }

    static check(format: { [ name: string ]: FormatFunc }, object: any): any {
        const result: any = {};
        for (const key in format) {
            try {
                const value = format[key](object[key]);
                if (value !== undefined) { result[key] = value; }
            } catch (error) {
                error.checkKey = key;
                error.checkValue = object[key];
                throw error;
            }
        }
        return result;
    }

    // if value is null-ish, nullValue is returned
    static allowNull(format: FormatFunc, nullValue?: any): FormatFunc {
        return (function(value: any) {
            if (value == null) { return nullValue; }
            return format(value);
        });
    }

    // If value is false-ish, replaceValue is returned
    static allowFalsish(format: FormatFunc, replaceValue: any): FormatFunc {
        return (function(value: any) {
            if (!value) { return replaceValue; }
            return format(value);
        });
    }

    // Requires an Array satisfying check
    static arrayOf(format: FormatFunc): FormatFunc {
        return (function(array: any): Array<any> {
            if (!Array.isArray(array)) { throw new Error("not an array"); }

            const result: any = [];

            array.forEach(function(value) {
                result.push(format(value));
            });

            return result;
        });
    }
}
