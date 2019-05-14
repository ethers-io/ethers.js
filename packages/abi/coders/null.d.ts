import { Coder, Reader, Writer } from "./abstract-coder";
export declare class NullCoder extends Coder {
    constructor(localName: string);
    encode(writer: Writer, value: any): number;
    decode(reader: Reader): any;
}
