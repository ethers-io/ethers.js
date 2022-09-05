import type { BigNumberish, BytesLike } from "./index.js";
import type { CodedEthersError, ErrorCode } from "./errors.js";
export declare type ErrorInfo<T> = Omit<T, "code" | "name" | "message">;
export declare type LogLevel = "debug" | "info" | "warning" | "error" | "off";
export declare type AssertFunc<T> = () => (undefined | T);
export declare class Logger {
    #private;
    readonly version: string;
    constructor(version?: string);
    get logLevel(): LogLevel;
    set logLevel(value: LogLevel);
    makeError<K extends ErrorCode, T extends CodedEthersError<K>>(message: string, code: K, info?: ErrorInfo<T>): T;
    throwError<K extends ErrorCode, T extends CodedEthersError<K>>(message: string, code: K, info?: ErrorInfo<T>): never;
    throwArgumentError(message: string, name: string, value: any): never;
    assertNormalize(form: string): void;
    assertPrivate(givenGuard: any, guard: any, className?: string): void;
    assertArgumentCount(count: number, expectedCount: number, message?: string): void;
    getBytes(value: BytesLike, name?: string): Uint8Array;
    getBytesCopy(value: BytesLike, name?: string): Uint8Array;
    getNumber(value: BigNumberish, name?: string): number;
    getBigInt(value: BigNumberish, name?: string): bigint;
    debug(...args: Array<any>): void;
    info(...args: Array<any>): void;
    warn(...args: Array<any>): void;
}
export declare const logger: Logger;
export declare function assertArgument(check: unknown, message: string, name: string, value: unknown): asserts check;
//# sourceMappingURL=logger.d.ts.map