import { BytesLike } from "@ethersproject/bytes";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
export declare type CoerceFunc = (type: string, value: any) => any;
export declare abstract class Coder {
    readonly name: string;
    readonly type: string;
    readonly localName: string;
    readonly dynamic: boolean;
    constructor(name: string, type: string, localName: string, dynamic: boolean);
    _throwError(message: string, value: any): void;
    abstract encode(writer: Writer, value: any): number;
    abstract decode(reader: Reader): any;
}
export declare class Writer {
    readonly wordSize: number;
    _data: Uint8Array;
    _padding: Uint8Array;
    constructor(wordSize?: number);
    readonly data: string;
    readonly length: number;
    _writeData(data: Uint8Array): number;
    writeBytes(value: BytesLike): number;
    _getValue(value: BigNumberish): Uint8Array;
    writeValue(value: BigNumberish): number;
    writeUpdatableValue(): (value: BigNumberish) => void;
}
export declare class Reader {
    readonly wordSize: number;
    readonly _data: Uint8Array;
    readonly _coerceFunc: CoerceFunc;
    _offset: number;
    constructor(data: BytesLike, wordSize?: number, coerceFunc?: CoerceFunc);
    readonly data: string;
    readonly consumed: number;
    static coerce(name: string, value: any): any;
    coerce(name: string, value: any): any;
    _peekBytes(offset: number, length: number): Uint8Array;
    subReader(offset: number): Reader;
    readBytes(length: number): Uint8Array;
    readValue(): BigNumber;
}
