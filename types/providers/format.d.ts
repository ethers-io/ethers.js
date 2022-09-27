export declare type FormatFunc = (value: any) => any;
export declare function allowNull(format: FormatFunc, nullValue?: any): FormatFunc;
export declare function arrayOf(format: FormatFunc): FormatFunc;
export declare function object(format: Record<string, FormatFunc>, altNames?: Record<string, Array<string>>): FormatFunc;
export declare function formatBoolean(value: any): boolean;
export declare function formatData(value: string): string;
export declare function formatHash(value: any): string;
export declare function formatUint256(value: any): string;
export declare const formatLog: FormatFunc;
export declare const formatBlock: FormatFunc;
export declare const formatBlockWithTransactions: FormatFunc;
export declare const formatReceiptLog: FormatFunc;
export declare const formatTransactionReceipt: FormatFunc;
export declare function formatTransactionResponse(value: any): any;
//# sourceMappingURL=format.d.ts.map