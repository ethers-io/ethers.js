export declare const UNKNOWN_ERROR = "UNKNOWN_ERROR";
export declare const NOT_IMPLEMENTED = "NOT_IMPLEMENTED";
export declare const MISSING_NEW = "MISSING_NEW";
export declare const CALL_EXCEPTION = "CALL_EXCEPTION";
export declare const INVALID_ARGUMENT = "INVALID_ARGUMENT";
export declare const MISSING_ARGUMENT = "MISSING_ARGUMENT";
export declare const UNEXPECTED_ARGUMENT = "UNEXPECTED_ARGUMENT";
export declare const NUMERIC_FAULT = "NUMERIC_FAULT";
export declare const UNSUPPORTED_OPERATION = "UNSUPPORTED_OPERATION";
export declare function throwError(message: string, code: string, params: any): never;
export declare function checkNew(self: any, kind: any): void;
export declare function checkArgumentCount(count: number, expectedCount: number, suffix?: string): void;
export declare function setCensorship(censorship: boolean, permanent?: boolean): void;
//# sourceMappingURL=errors.d.ts.map