import { Block, Log, TransactionReceipt, TransactionResponse } from "./provider.js";
import type { AccessList } from "@ethersproject/transactions";
import type { PerformActionTransaction } from "./abstract-provider.js";
import type { Filter, Provider } from "./provider.js";
export declare type FormatFunc = (value: any) => any;
export declare class Formatter {
    #private;
    constructor();
    address(value: any): string;
    callAddress(value: any): string;
    contractAddress(value: any): string;
    blockTag(value?: any): string;
    block(value: any, provider?: Provider): Block<string>;
    blockWithTransactions(value: any, provider?: Provider): Block<TransactionResponse>;
    transactionRequest(value: any, provider?: Provider): PerformActionTransaction;
    transactionResponse(value: any, provider?: Provider): TransactionResponse;
    log(value: any, provider?: Provider): Log;
    receipt(value: any, provider?: Provider): TransactionReceipt;
    topics(value: any): Array<string>;
    filter(value: any): Filter;
    filterLog(value: any): any;
    transaction(value: any): TransactionResponse;
    accessList(value: any): AccessList;
    allowFalsish(format: FormatFunc, ifFalse: any): FormatFunc;
    allowNull(format: FormatFunc, ifNull?: any): FormatFunc;
    arrayOf(format: FormatFunc): FormatFunc;
    bigNumber(value: any): bigint;
    uint256(value: any): bigint;
    boolean(value: any): boolean;
    _hexstring(dataOrLength?: boolean | number): FormatFunc;
    data(value: string): string;
    hash(value: any): string;
    number(value: any): number;
    object(format: Record<string, FormatFunc>, altNames?: Record<string, Array<string>>): FormatFunc;
    storageSlot(value: any): string;
}
//# sourceMappingURL=formatter.d.ts.map