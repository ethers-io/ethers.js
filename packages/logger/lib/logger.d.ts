import { ErrorCode } from "./errors.js";
import type { CodedEthersError } from "./errors.js";
export declare type BytesLike = string | Uint8Array;
export declare type BigNumberish = string | number | bigint;
export declare type Numeric = number | bigint;
export declare type ErrorInfo<T> = Omit<T, "code" | "name" | "message">;
export declare enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR",
    OFF = "OFF"
}
export declare class Logger {
    #private;
    readonly version: string;
    static readonly LogLevels: typeof LogLevel;
    constructor(version?: string);
    makeError<K extends ErrorCode, T extends CodedEthersError<K>>(message: string, code: K, info?: ErrorInfo<T>): T;
    throwError<K extends ErrorCode, T extends CodedEthersError<K>>(message: string, code: K, info?: ErrorInfo<T>): never;
    throwArgumentError(message: string, name: string, value: any): never;
    assert<K extends ErrorCode, T extends CodedEthersError<K>>(condition: any, message: string, code: K, info?: ErrorInfo<T>): void;
    assertArgument(condition: any, message: string, name: string, value: any): void;
    assertIntegerArgument(name: string, value: any, lower?: number, upper?: number): void;
    assertSafeUint53(value: number, message?: string): void;
    assertNormalize(form: string): void;
    assertPrivate(givenGuard: any, guard: any, className?: string): void;
    assertArgumentCount(count: number, expectedCount: number, message?: string): void;
    assertInt53(value: number, operation?: string): void;
    assertUint53(value: number, operation?: string): void;
    assertInteger(value: number, operation?: string, min?: number, max?: number): void;
    getBytes(value: BytesLike, name?: string): Uint8Array;
    getBytesCopy(value: BytesLike, name?: string): Uint8Array;
    getNumber(value: BigNumberish, name?: string): number;
    getBigInt(value: BigNumberish, name?: string): bigint;
    debug(...args: Array<any>): void;
    info(...args: Array<any>): void;
    warn(...args: Array<any>): void;
    static globalLogger(): Logger;
    static setLogLevel(logLevel: LogLevel): void;
}
//# sourceMappingURL=logger.d.ts.map