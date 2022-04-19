import type { BytesLike } from "@ethersproject/bytes";
import type { BigNumberish } from "@ethersproject/logger";
export declare const WordSize = 32;
export declare class Result extends Array<any> {
    #private;
    [K: string | number]: any;
    constructor(guard: any, items: Array<any>, keys?: Array<null | string>);
    slice(start?: number | undefined, end?: number | undefined): Array<any>;
    getValue(name: string): any;
    static fromItems(items: Array<any>, keys?: Array<null | string>): Result;
}
export declare function checkResultErrors(result: Result): Array<{
    path: Array<string | number>;
    error: Error;
}>;
export declare abstract class Coder {
    readonly name: string;
    readonly type: string;
    readonly localName: string;
    readonly dynamic: boolean;
    constructor(name: string, type: string, localName: string, dynamic: boolean);
    _throwError(message: string, value: any): never;
    abstract encode(writer: Writer, value: any): number;
    abstract decode(reader: Reader): any;
    abstract defaultValue(): any;
}
export declare class Writer {
    #private;
    constructor();
    get data(): string;
    get length(): number;
    appendWriter(writer: Writer): number;
    writeBytes(value: BytesLike): number;
    writeValue(value: BigNumberish): number;
    writeUpdatableValue(): (value: BigNumberish) => void;
}
export declare class Reader {
    #private;
    readonly allowLoose: boolean;
    constructor(data: BytesLike, allowLoose?: boolean);
    get data(): string;
    get dataLength(): number;
    get consumed(): number;
    get bytes(): Uint8Array;
    subReader(offset: number): Reader;
    readBytes(length: number, loose?: boolean): Uint8Array;
    readValue(): bigint;
    readIndex(): number;
}
//# sourceMappingURL=abstract-coder.d.ts.map