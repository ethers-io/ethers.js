import { Coder, Reader, Writer } from "./abstract-coder";
export declare class TupleCoder extends Coder {
    readonly coders: Array<Coder>;
    constructor(coders: Array<Coder>, localName: string);
    encode(writer: Writer, value: Array<any>): number;
    decode(reader: Reader): any;
}
