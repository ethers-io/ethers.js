import { Log, TransactionReceipt, TransactionResponse, HederaTransactionRecord } from "@hethers/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { AccessList } from "@hethers/transactions";
export declare type FormatFunc = (value: any) => any;
export declare type FormatFuncs = {
    [key: string]: FormatFunc;
};
export declare type Formats = {
    transaction: FormatFuncs;
    transactionRequest: FormatFuncs;
    receipt: FormatFuncs;
    receiptLog: FormatFuncs;
    filter: FormatFuncs;
    filterLog: FormatFuncs;
};
export declare class Formatter {
    readonly formats: Formats;
    constructor();
    getDefaultFormats(): Formats;
    logsMapper(values: Array<any>): Array<Log>;
    timestamp(value: any): string;
    accessList(accessList: Array<any>): AccessList;
    number(number: any): number;
    type(number: any): number;
    bigNumber(value: any): BigNumber;
    boolean(value: any): boolean;
    hex(value: any, strict?: boolean): string;
    data(value: any, strict?: boolean): string;
    address(value: any): string;
    callAddress(value: any): string;
    contractAddress(value: any): string;
    hash48(value: any, strict?: boolean): string;
    hash32(value: any, strict?: boolean): string;
    difficulty(value: any): number;
    uint256(value: any): string;
    transactionRequest(value: any): any;
    transactionResponse(transaction: any): TransactionResponse;
    transaction(value: any): any;
    receiptLog(value: any): any;
    receipt(value: any): TransactionReceipt;
    responseFromRecord(record: HederaTransactionRecord): TransactionResponse;
    receiptFromResponse(response: TransactionResponse): TransactionReceipt;
    topics(value: any): any;
    filter(value: any): any;
    filterLog(value: any): any;
    static check(format: {
        [name: string]: FormatFunc;
    }, object: any): any;
    static allowNull(format: FormatFunc, nullValue?: any): FormatFunc;
    static allowFalsish(format: FormatFunc, replaceValue: any): FormatFunc;
    static arrayOf(format: FormatFunc): FormatFunc;
}
//# sourceMappingURL=formatter.d.ts.map