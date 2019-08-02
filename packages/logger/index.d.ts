export declare type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "OFF";
export declare class Logger {
    readonly version: string;
    static errors: {
        UNKNOWN_ERROR: string;
        NOT_IMPLEMENTED: string;
        UNSUPPORTED_OPERATION: string;
        NETWORK_ERROR: string;
        SERVER_ERROR: string;
        TIMEOUT: string;
        BUFFER_OVERRUN: string;
        NUMERIC_FAULT: string;
        MISSING_NEW: string;
        INVALID_ARGUMENT: string;
        MISSING_ARGUMENT: string;
        UNEXPECTED_ARGUMENT: string;
        CALL_EXCEPTION: string;
        INSUFFICIENT_FUNDS: string;
        NONCE_EXPIRED: string;
        REPLACEMENT_UNDERPRICED: string;
        UNPREDICTABLE_GAS_LIMIT: string;
    };
    static levels: {
        [name: string]: LogLevel;
    };
    constructor(version: string);
    setLogLevel(logLevel: LogLevel): void;
    _log(logLevel: LogLevel, args: Array<any>): void;
    debug(...args: Array<any>): void;
    info(...args: Array<any>): void;
    warn(...args: Array<any>): void;
    makeError(message: string, code?: string, params?: any): Error;
    throwError(message: string, code?: string, params?: any): never;
    throwArgumentError(message: string, name: string, value: any): never;
    checkNormalize(message?: string): void;
    checkSafeUint53(value: number, message?: string): void;
    checkArgumentCount(count: number, expectedCount: number, message?: string): void;
    checkNew(target: any, kind: any): void;
    checkAbstract(target: any, kind: any): void;
    static globalLogger(): Logger;
    static setCensorship(censorship: boolean, permanent?: boolean): void;
}
