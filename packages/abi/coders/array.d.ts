import { Coder, Reader, Writer } from "./abstract-coder";
export declare function pack(writer: Writer, coders: Array<Coder>, values: Array<any>): number;
export declare function unpack(reader: Reader, coders: Array<Coder>): Array<any>;
export declare class ArrayCoder extends Coder {
    readonly coder: Coder;
    readonly length: number;
    constructor(coder: Coder, length: number, localName: string);
    encode(writer: Writer, value: Array<any>): number;
    decode(reader: Reader): any;
}
