export declare type BytesLike = string | Uint8Array;
export declare function isHexString(value: any, length?: number | boolean): value is string;
export declare function isBytesLike(value: any): value is BytesLike;
export declare function hexlify(data: BytesLike): string;
export declare function concat(datas: ReadonlyArray<BytesLike>): string;
export declare function dataLength(data: BytesLike): number;
export declare function dataSlice(data: BytesLike, start?: number, end?: number): string;
export declare function stripZerosLeft(data: BytesLike): string;
export declare function zeroPadValue(data: BytesLike, length: number): string;
export declare function zeroPadBytes(data: BytesLike, length: number): string;
//# sourceMappingURL=data.d.ts.map